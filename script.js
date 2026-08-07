/* =========================================================
   EVENT DATA
   Edit this list to match your own school's calendar.
   - date: a single day, as "YYYY-MM-DD"
   - endDate: only needed for multi-day breaks/recesses
   - category: "milestone" | "recess" | "holiday" | "nonstudent"
========================================================= */
const SCHOOL_YEAR_LABEL = "2026\u201327";

const EVENTS = [
  { title: "First Day of School",          date: "2026-08-10", category: "milestone" },
  { title: "Labor Day",                     date: "2026-09-07", category: "holiday" },
  { title: "Non-student Day",               date: "2026-10-30", category: "nonstudent" },
  { title: "Veterans Day",                  date: "2026-11-11", category: "holiday" },
  { title: "Thanksgiving Recess",           date: "2026-11-23", endDate: "2026-11-27", category: "recess" },
  { title: "Winter Recess",                 date: "2026-12-21", endDate: "2027-01-01", category: "recess" },
  { title: "Non-student Day",               date: "2027-01-04", category: "nonstudent" },
  { title: "Martin Luther King, Jr. Day",   date: "2027-01-18", category: "holiday" },
  { title: "Lincoln's Birthday",            date: "2027-02-12", category: "holiday" },
  { title: "Presidents Day",                date: "2027-02-15", category: "holiday" },
  { title: "Spring Recess",                 date: "2027-03-15", endDate: "2027-03-19", category: "recess" },
  { title: "Last Day of School",            date: "2027-05-25", category: "milestone" },
];

// Total instructional days across the year (edit to match your district's official count)
const TOTAL_SCHOOL_DAYS = 180;

const CATEGORY_PIN = {
  milestone: "pin--red",
  recess: "pin--teal",
  holiday: "pin--gold",
  nonstudent: "pin--slate",
};

/* =========================================================
   HELPERS
========================================================= */
const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDate(d) {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatRange(start, end) {
  if (!end || start.getTime() === end.getTime()) return formatDate(start);

  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}\u2013${end.getDate()}, ${start.getFullYear()}`;
  }

  const sameYear = start.getFullYear() === end.getFullYear();
  if (sameYear) {
    return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} \u2013 ${MONTH_NAMES[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
  }

  return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} \u2013 ${MONTH_NAMES[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
}

function pad(n) { return String(n).padStart(2, "0"); }

/* =========================================================
   NORMALIZE EVENT DATA
========================================================= */
const parsedEvents = EVENTS.map((e) => ({
  ...e,
  start: parseDate(e.date),
  end: e.endDate ? parseDate(e.endDate) : parseDate(e.date),
})).sort((a, b) => a.start - b.start);

const yearStart = parsedEvents[0].start;
const yearEnd = parsedEvents[parsedEvents.length - 1].end;

/* =========================================================
   STATUS + PROGRESS
========================================================= */
function getStatus(now, ev) {
  if (now < ev.start) return "upcoming";
  if (now >= ev.start && now <= ev.end) return "ongoing";
  return "done";
}

// Progress = how far along the whole school year is, measured up to this event's start.
function getProgress(now, ev) {
  const span = ev.start - yearStart;
  if (span <= 0) return now >= ev.start ? 100 : 0;
  const elapsed = Math.min(Math.max(now - yearStart, 0), span);
  return Math.round((elapsed / span) * 100);
}

/* =========================================================
   RENDER: METRIC STICKY NOTES
========================================================= */
function renderMetrics(now) {
  const metricsEl = document.getElementById("metrics");
  const todayStart = startOfDay(now);

  const daysSinceStart = Math.floor((todayStart - yearStart) / DAY_MS);
  const totalSpanDays = Math.max(Math.round((yearEnd - yearStart) / DAY_MS), 1);

  let completedPct;
  if (todayStart < yearStart) completedPct = 0;
  else if (todayStart > yearEnd) completedPct = 100;
  else completedPct = Math.round(((todayStart - yearStart) / totalSpanDays) * 100);

  const eventsLeft = parsedEvents.filter((e) => getStatus(todayStart, e) !== "done").length;
  const nextEvent = parsedEvents.find((e) => getStatus(todayStart, e) !== "done");

  const daysLabel = daysSinceStart < 0 ? "Days until first day" : "Days since start";
  const daysValue = daysSinceStart < 0 ? Math.abs(daysSinceStart) : daysSinceStart;

  const metrics = [
    { value: daysValue, label: daysLabel },
    { value: TOTAL_SCHOOL_DAYS, label: "Total school days" },
    { value: `${completedPct}%`, label: "Year completed" },
    { value: eventsLeft, label: "Events left" },
    { value: nextEvent ? nextEvent.title : "None", label: "Next event" },
  ];

  metricsEl.innerHTML = metrics
    .map(
      (m) => `
      <div class="metric">
        <span class="metric__value">${m.value}</span>
        <span class="metric__label">${m.label}</span>
      </div>`
    )
    .join("");
}

/* =========================================================
   RENDER: EVENT CARDS
========================================================= */
function renderCards(now) {
  const grid = document.getElementById("events-grid");
  grid.innerHTML = parsedEvents
    .map((ev) => {
      const status = getStatus(now, ev);
      const progress = getProgress(now, ev);
      const pinClass = CATEGORY_PIN[ev.category] || "pin--slate";

      let statusText;
      if (status === "upcoming") {
        const days = Math.ceil((ev.start - now) / DAY_MS);
        statusText = days <= 1 ? "Tomorrow!" : `In ${days} days`;
      } else if (status === "ongoing") {
        statusText = "Happening now!";
      } else {
        statusText = "Finished!";
      }

      const showTape = ev.category === "recess" || ev.category === "milestone";

      return `
        <article class="card card--${status}" tabindex="0" aria-label="${ev.title}, ${statusText}">
          <div class="pin ${pinClass} card__pin" aria-hidden="true"></div>
          ${showTape ? '<div class="card__tape" aria-hidden="true"></div>' : ""}
          <h3 class="card__title">${ev.title}</h3>
          <p class="card__date">${formatRange(ev.start, ev.end)}</p>
          <span class="card__status">${statusText}</span>
          <div class="card__bar"><div class="card__bar-fill" style="width:${progress}%"></div></div>
        </article>`;
    })
    .join("");
}

/* =========================================================
   RENDER: HERO LIVE COUNTDOWN
========================================================= */
function renderHero(now) {
  const heroEl = document.getElementById("hero");
  const eyebrowEl = document.getElementById("hero-eyebrow");
  const titleEl = document.getElementById("hero-title");
  const dateEl = document.getElementById("hero-date");

  const nextEvent =
    parsedEvents.find((e) => getStatus(now, e) === "ongoing") ||
    parsedEvents.find((e) => getStatus(now, e) === "upcoming");

  if (!nextEvent) {
    heroEl.classList.add("hero--done");
    eyebrowEl.textContent = "all done";
    titleEl.textContent = "That's a wrap!";
    dateEl.textContent = `The ${SCHOOL_YEAR_LABEL} school year has ended`;
    ["days", "hours", "mins", "secs"].forEach((id) => (document.getElementById(`clock-${id}`).textContent = "00"));
    return;
  }

  const isOngoing = getStatus(now, nextEvent) === "ongoing";
  eyebrowEl.textContent = isOngoing ? "happening now" : "up next";
  titleEl.textContent = nextEvent.title;
  dateEl.textContent = formatRange(nextEvent.start, nextEvent.end);

  const target = isOngoing ? nextEvent.end.getTime() + DAY_MS : nextEvent.start.getTime();
  const diff = Math.max(target - now.getTime(), 0);

  const days = Math.floor(diff / DAY_MS);
  const hours = Math.floor((diff % DAY_MS) / (60 * 60 * 1000));
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const secs = Math.floor((diff % (60 * 1000)) / 1000);

  document.getElementById("clock-days").textContent = pad(days);
  document.getElementById("clock-hours").textContent = pad(hours);
  document.getElementById("clock-mins").textContent = pad(mins);
  document.getElementById("clock-secs").textContent = pad(secs);
}

/* =========================================================
   MAIN TICK
========================================================= */
function tick() {
  const now = new Date();
  renderHero(now);
  document.getElementById("clock-secs"); // no-op, keeps hot path simple
}

function fullRender() {
  const now = new Date();
  document.getElementById("year-title").textContent = `${SCHOOL_YEAR_LABEL} School Year Countdown`;
  document.getElementById("footer-year").textContent = SCHOOL_YEAR_LABEL;
  renderMetrics(now);
  renderCards(now);
  renderHero(now);
}

fullRender();
setInterval(tick, 1000);
// Re-render metrics/cards once a minute so day-boundary changes stay accurate
setInterval(fullRender, 60 * 1000);

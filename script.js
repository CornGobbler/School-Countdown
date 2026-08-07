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

function addDays(d, n) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

// Inclusive count of Mon–Fri between two dates
function countWeekdays(a, b) {
  if (a > b) return 0;
  let count = 0;
  let d = new Date(a);
  while (d <= b) {
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) count++;
    d = addDays(d, 1);
  }
  return count;
}

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

// Every calendar date (as "YYYY-MM-DD") that is NOT a school day: weekends handled
// separately, this set covers holidays, non-student days, and recesses. The first/last
// day "milestone" events are real school days, so they're deliberately left out of this.
const offDaySet = new Set();
parsedEvents.forEach((ev) => {
  if (ev.category === "milestone") return;
  let d = new Date(ev.start);
  while (d <= ev.end) {
    offDaySet.add(d.toDateString());
    d = addDays(d, 1);
  }
});

function isSchoolDay(d) {
  const wd = d.getDay();
  if (wd === 0 || wd === 6) return false;
  if (d < yearStart || d > yearEnd) return false;
  return !offDaySet.has(d.toDateString());
}

// Real instructional days between two dates, inclusive — weekends and any
// holiday/non-student/recess day (per offDaySet) don't count.
function countSchoolDays(a, b) {
  if (a > b) return 0;
  let count = 0;
  let d = new Date(a);
  while (d <= b) {
    if (isSchoolDay(d)) count++;
    d = addDays(d, 1);
  }
  return count;
}

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

  // Weeks remaining until the last day (0 once the year is over)
  const weeksLeft = todayStart > yearEnd ? 0 : Math.max(Math.ceil((yearEnd - todayStart) / (7 * DAY_MS)), 0);

  // Fun trivia: single-day holidays/non-student days that fall on a Monday or Friday,
  // stretching a regular weekend into a long one
  const longWeekends = parsedEvents.filter((e) => {
    const singleDay = e.start.getTime() === e.end.getTime();
    const isDayOff = e.category === "holiday" || e.category === "nonstudent";
    const wd = e.start.getDay();
    return singleDay && isDayOff && (wd === 1 || wd === 5);
  }).length;

  const metrics = [
    { value: daysValue, label: daysLabel },
    { value: TOTAL_SCHOOL_DAYS, label: "Total school days" },
    { value: `${completedPct}%`, label: "Year completed" },
    { value: eventsLeft, label: "Events left" },
    { value: weeksLeft, label: "Weeks left" },
    { value: longWeekends, label: "Long weekends" },
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
   PER-CARD HOVER DETAILS
========================================================= */
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function buildDetails(now, ev, status) {
  const lines = [];

  if (ev.start.getTime() === ev.end.getTime()) {
    const wd = WEEKDAY_NAMES[ev.start.getDay()];
    lines.push(ev.category === "milestone" ? `Falls on a ${wd}.` : `No school \u2014 falls on a ${wd}.`);
  } else {
    const offDays = countWeekdays(ev.start, ev.end);
    lines.push(`${offDays} school day${offDays === 1 ? "" : "s"} off.`);
  }

  if (status === "upcoming") {
    // Real school days you'll actually attend before this day arrives —
    // the event's own day(s) don't count, since you haven't lived them yet.
    const schoolDaysAway = countSchoolDays(addDays(startOfDay(now), 1), addDays(ev.start, -1));
    lines.push(`${schoolDaysAway} school day${schoolDaysAway === 1 ? "" : "s"} from today.`);
  } else if (status === "ongoing") {
    const daysLeft = Math.ceil((ev.end - now) / DAY_MS);
    lines.push(daysLeft <= 0 ? "Wraps up today." : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left.`);
  } else {
    const daysAgo = Math.floor((startOfDay(now) - ev.end) / DAY_MS);
    lines.push(daysAgo <= 0 ? "Just wrapped up." : `That was ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago.`);
  }

  return lines;
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
        statusText = days <= 1 ? "\u23F3 Tomorrow!" : `\u23F3 In ${days} days`;
      } else if (status === "ongoing") {
        statusText = "\u23F3 Happening now!";
      } else {
        statusText = "Finished!";
      }

      const showTape = ev.category === "recess" || ev.category === "milestone";
      const details = buildDetails(now, ev, status);

      // Chips for upcoming/ongoing events get a live ticking countdown on hover/focus.
      // "Ends in" counts to just past midnight on the event's last day; "In" counts to its start.
      const isLive = status !== "done";
      const liveTarget = status === "ongoing" ? ev.end.getTime() + DAY_MS : ev.start.getTime();
      const liveMode = status === "ongoing" ? "ends" : "start";
      const chipAttrs = isLive
        ? `data-live="true" data-target="${liveTarget}" data-mode="${liveMode}" tabindex="0"`
        : "";

      return `
        <article class="card card--${status}" tabindex="0" aria-label="${ev.title}, ${statusText}">
          <div class="pin ${pinClass} card__pin" aria-hidden="true"></div>
          ${showTape ? '<div class="card__tape" aria-hidden="true"></div>' : ""}
          <h3 class="card__title">${ev.title}</h3>
          <p class="card__date">${formatRange(ev.start, ev.end)}</p>
          <span class="card__status" ${chipAttrs}>${statusText}</span>
          <div class="card__bar"><div class="card__bar-fill" style="width:${progress}%"></div></div>
          <div class="card__details">${details.map((line) => `<span>${line}</span>`).join("")}</div>
        </article>`;
    })
    .join("");

  attachChipCountdowns();
}

/* =========================================================
   LIVE COUNTDOWN ON STATUS CHIPS
   Hovering (or tabbing to) an "In N days" / "Happening now!" chip
   swaps it into a ticking dd/hh/mm/ss countdown until you leave it.
========================================================= */
let activeChipTimers = [];

function attachChipCountdowns() {
  // clear any timers left over from the previous render
  activeChipTimers.forEach(clearInterval);
  activeChipTimers = [];

  document.querySelectorAll('.card__status[data-live="true"]').forEach((chip) => {
    const target = Number(chip.dataset.target);
    const mode = chip.dataset.mode;
    const original = chip.textContent;
    let intervalId = null;

    function tick() {
      const diff = Math.max(target - Date.now(), 0);
      const d = Math.floor(diff / DAY_MS);
      const h = Math.floor((diff % DAY_MS) / (60 * 60 * 1000));
      const m = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const s = Math.floor((diff % (60 * 1000)) / 1000);
      const prefix = mode === "ends" ? "Ends in " : "In ";
      chip.textContent = `\u23F3 ${prefix}${d}d ${h}h ${m}m ${s}s`;
    }

    function start() {
      if (intervalId) return;
      chip.classList.add("card__status--live");
      tick();
      intervalId = setInterval(tick, 1000);
      activeChipTimers.push(intervalId);
    }

    function stop() {
      clearInterval(intervalId);
      intervalId = null;
      chip.classList.remove("card__status--live");
      chip.textContent = original;
    }

    chip.addEventListener("mouseenter", start);
    chip.addEventListener("mouseleave", stop);
    chip.addEventListener("focus", start);
    chip.addEventListener("blur", stop);
  });
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

/* =========================================================
   THEME TOGGLE (day / night mode)
========================================================= */
(function setupThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  const iconEl = document.getElementById("theme-toggle-icon");
  const root = document.documentElement;

  function applyIcon(theme) {
    // Icon shows what you'll switch TO
    iconEl.textContent = theme === "dark" ? "\u2600\uFE0F" : "\uD83C\uDF19";
    toggleBtn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    toggleBtn.setAttribute("aria-label", theme === "dark" ? "Switch to day mode" : "Switch to night mode");
  }

  applyIcon(root.getAttribute("data-theme") || "light");

  toggleBtn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("schoolCountdownTheme", next);
    } catch (e) {
      /* localStorage unavailable — theme just won't persist */
    }
    applyIcon(next);
  });
})();

const events = [
  { title: "First Day of School", date: "2025-08-11", type: "school-day" },
  { title: "Labor Day", date: "2025-09-01", type: "holiday" },
  { title: "Non-student Day", date: "2025-11-10", type: "holiday" },
  { title: "Veterans Day", date: "2025-11-11", type: "holiday" },
  { title: "Thanksgiving Recess", start: "2025-11-24", end: "2025-11-28", type: "break" },
  { title: "Winter Recess", start: "2025-12-22", end: "2026-01-02", type: "break" },
  { title: "Non-student Day", date: "2026-01-05", type: "holiday" },
  { title: "Martin Luther King, Jr. Day", date: "2026-01-19", type: "holiday" },
  { title: "Lincoln's Birthday", date: "2026-02-13", type: "holiday" },
  { title: "Presidents Day", date: "2026-02-16", type: "holiday" },
  { title: "Spring Recess", start: "2026-03-16", end: "2026-03-20", type: "break" },
  { title: "Memorial Day", date: "2026-05-25", type: "holiday" },
  { title: "Last Day of School", date: "2026-05-27", type: "final" },
];

const startDate = new Date("2025-08-11");
const endDate = new Date("2026-05-27");

function daysBetween(d1, d2) {
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
}

function createEventCard(event) {
  const card = document.createElement("div");
  card.className = "event-card";

  const title = document.createElement("div");
  title.className = "event-title";
  title.textContent = event.title;
  card.appendChild(title);

  const dateDiv = document.createElement("div");
  dateDiv.className = "event-date";
  if (event.date) {
    dateDiv.textContent = new Date(event.date).toDateString();
  } else {
    dateDiv.textContent = `${new Date(event.start).toDateString()} → ${new Date(event.end).toDateString()}`;
  }
  card.appendChild(dateDiv);

  const now = new Date();
  let eventDate = event.date ? new Date(event.date) : new Date(event.start);
  let daysLeft = daysBetween(now, eventDate);
  const countdown = document.createElement("div");
  countdown.className = "countdown";
  countdown.textContent = daysLeft > 0 ? `${daysLeft} days left` : "Ongoing / Passed";
  card.appendChild(countdown);

  const progressContainer = document.createElement("div");
  progressContainer.className = "progress-container";

  const progressBar = document.createElement("div");
  progressBar.className = `progress-bar ${event.type}`;

  let totalDays = daysBetween(startDate, endDate);
  let elapsed = daysBetween(startDate, eventDate);
  let percent = Math.min(100, Math.max(0, (elapsed / totalDays) * 100));
  progressBar.style.width = percent + "%";

  progressContainer.appendChild(progressBar);
  card.appendChild(progressContainer);

  return card;
}

function renderCalendar() {
  const container = document.getElementById("calendar");
  events.forEach(event => {
    container.appendChild(createEventCard(event));
  });
}

renderCalendar();

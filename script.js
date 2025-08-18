const events = [
  { name: "First Day of School", date: "2025-08-11", type: "first-day" },
  { name: "Labor Day", date: "2025-09-01", type: "holiday" },
  { name: "Non-student Day", date: "2025-11-10", type: "holiday" },
  { name: "Veterans Day", date: "2025-11-11", type: "holiday" },
  { name: "Thanksgiving Recess", start: "2025-11-24", end: "2025-11-28", type: "recess" },
  { name: "Winter Recess", start: "2025-12-22", end: "2026-01-02", type: "recess" },
  { name: "Non-student Day", date: "2026-01-05", type: "holiday" },
  { name: "Martin Luther King, Jr. Day", date: "2026-01-19", type: "holiday" },
  { name: "Lincoln's Birthday", date: "2026-02-13", type: "holiday" },
  { name: "Presidents Day", date: "2026-02-16", type: "holiday" },
  { name: "Spring Recess", start: "2026-03-16", end: "2026-03-20", type: "recess" },
  { name: "Memorial Day", date: "2026-05-25", type: "holiday" },
  { name: "Last Day of School", date: "2026-05-27", type: "last-day" },
];

const container = document.getElementById('events-container');
const metricsContainer = document.getElementById('metrics-container');
const firstDay = new Date("2025-08-11");
const lastDay = new Date("2026-05-27");

// --- CREATE EVENT CHIPS ---
function createEventChip(event) {
  const chip = document.createElement('div');
  chip.className = `event-chip ${event.type}`;

  const name = document.createElement('div');
  name.className = 'event-name';
  name.textContent = event.name;

  const countdown = document.createElement('div');
  countdown.className = 'countdown';

  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  const progress = document.createElement('div');
  progress.className = 'progress';
  progressBar.appendChild(progress);

  chip.appendChild(name);
  chip.appendChild(countdown);
  chip.appendChild(progressBar);
  container.appendChild(chip);

  function updateCountdown() {
  const now = new Date();
  let targetStart = event.date ? new Date(event.date) : new Date(event.start);
  let targetEnd = event.end ? new Date(event.end) : targetStart; // single-day events end same day

  if (now < targetStart) {
    // Event in future
    countdown.textContent = formatTime(targetStart - now);
  } else if (now >= targetStart && now <= targetEnd) {
    // Event ongoing
    countdown.textContent = "Ongoing!";
  } else {
    // Event finished
    countdown.textContent = "Finished!";
  }

  // Progress (visible even for far events)
  const totalDuration = targetStart - firstDay;
  const elapsed = now - firstDay;
  let percent = (elapsed / totalDuration) * 100;
  if (percent < 5 && now < targetStart) percent = 5;
  percent = Math.min(Math.max(percent, 0), 100);
  progress.style.width = percent + "%";
}

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// --- METRICS ---
function updateMetrics() {
  const now = new Date();
  const totalSchoolDays = Math.ceil((lastDay - firstDay) / (1000 * 3600 * 24));
  const daysSinceStart = Math.ceil((now - firstDay) / (1000 * 3600 * 24));
  const schoolProgressPercent = Math.min(Math.max((daysSinceStart / totalSchoolDays) * 100, 0), 100);

  const upcomingEvents = events.filter(ev => {
    const evDate = ev.date ? new Date(ev.date) : new Date(ev.start);
    return evDate > now;
  }).sort((a,b) => new Date(a.date || a.start) - new Date(b.date || b.start));

  metricsContainer.innerHTML = `
    <div class="metric">Days since start: ${daysSinceStart}</div>
    <div class="metric">Total school days: ${totalSchoolDays}</div>
    <div class="metric">School year completed: ${schoolProgressPercent.toFixed(1)}%</div>
    <div class="metric">Events left: ${upcomingEvents.length}</div>
    <div class="metric">Next event: ${upcomingEvents[0] ? upcomingEvents[0].name : 'None'}</div>
  `;
}

// --- FORMAT TIME ---
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (3600*24));
  const hours = Math.floor((totalSeconds % (3600*24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// --- INITIALIZE ---
events.forEach(createEventChip);
updateMetrics();
setInterval(updateMetrics, 1000);

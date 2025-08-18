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
const firstDay = new Date("2025-08-11");

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
    let target;

    if (event.date) {
      target = new Date(event.date);
    } else if (event.start) {
      target = new Date(event.start);
    }

    // Countdown text
    const timeLeft = target - now;
    if (timeLeft > 0) {
      countdown.textContent = formatTime(timeLeft);
    } else if (event.end && now >= new Date(event.start) && now <= new Date(event.end)) {
      countdown.textContent = "Ongoing!";
    } else {
      countdown.textContent = "Happening now!";
    }

    // Progress from first day to event start
    const totalDuration = target - firstDay;
    const elapsed = now - firstDay;
    let percent = (elapsed / totalDuration) * 100;
    percent = Math.min(Math.max(percent, 0), 100); // clamp between 0-100
    progress.style.width = percent + "%";
  }

  updateCountdown(); // initial call
  setInterval(updateCountdown, 1000);
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Initialize all events
events.forEach(createEventChip);

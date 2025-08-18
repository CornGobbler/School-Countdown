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
    let target, start;
    
    if(event.date) {
      target = new Date(event.date);
      const total = target - now;
      countdown.textContent = total > 0 ? formatTime(total) : "Happening now!";
      progress.style.width = total > 0 ? `${Math.min(100, 100 - (total / (target - new Date())) * 100)}%` : `100%`;
    } else if(event.start && event.end) {
      start = new Date(event.start);
      target = new Date(event.end);
      if(now < start) {
        const total = start - now;
        countdown.textContent = formatTime(total) + " until start";
        progress.style.width = `0%`;
      } else if(now >= start && now <= target) {
        const totalDuration = target - start;
        const elapsed = now - start;
        countdown.textContent = "Ongoing!";
        progress.style.width = `${(elapsed / totalDuration) * 100}%`;
      } else {
        countdown.textContent = "Finished!";
        progress.style.width = `100%`;
      }
    }
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (3600*24));
  const hours = Math.floor((totalSeconds % (3600*24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Initialize all events
events.forEach(createEventChip);

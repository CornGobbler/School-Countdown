// List of important dates
const events = [
  { name: "First Day of School", date: "August 11, 2025 08:00:00" },
  { name: "Labor Day", date: "September 1, 2025 00:00:00" },
  { name: "Non-student Day", date: "November 10, 2025 00:00:00" },
  { name: "Veterans Day", date: "November 11, 2025 00:00:00" },
  { name: "Thanksgiving Recess", date: "November 24, 2025 00:00:00", end: "November 28, 2025 23:59:59" },
  { name: "Winter Recess", date: "December 22, 2025 00:00:00", end: "January 2, 2026 23:59:59" },
  { name: "Non-student Day", date: "January 5, 2026 00:00:00" },
  { name: "Martin Luther King, Jr. Day", date: "January 19, 2026 00:00:00" },
  { name: "Lincoln's Birthday", date: "February 13, 2026 00:00:00" },
  { name: "Presidents Day", date: "February 16, 2026 00:00:00" },
  { name: "Spring Recess", date: "March 16, 2026 00:00:00", end: "March 20, 2026 23:59:59" },
  { name: "Memorial Day", date: "May 25, 2026 00:00:00" },
  { name: "Last Day of School", date: "May 27, 2026 15:15:00" }
];

// Render event containers
const eventsContainer = document.getElementById("events");
events.forEach((event, i) => {
  const div = document.createElement("div");
  div.className = "event";
  div.innerHTML = `
    <h2>${event.name}</h2>
    <div class="countdown" id="event-${i}">Loading...</div>
  `;
  eventsContainer.appendChild(div);
});

// Countdown updater
function updateCountdown() {
  const now = new Date().getTime();

  events.forEach((event, i) => {
    const start = new Date(event.date).getTime();
    const end = event.end ? new Date(event.end).getTime() : null;
    const el = document.getElementById(`event-${i}`);

    if (now < start) {
      // Countdown to start
      const diff = start - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      el.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (end && now <= end) {
      // During event range
      el.innerHTML = "📌 Happening Now!";
    } else {
      // Passed
      el.innerHTML = "✅ Event Passed";
    }
  });
}

setInterval(updateCountdown, 1000);
updateCountdown();

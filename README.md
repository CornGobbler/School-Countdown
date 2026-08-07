# 📌 School Year Countdown

A live countdown for important dates across Garden Grove Unified School District (GGUSD) in Orange County, CA — covering key events and details for every school in the district, not just one campus.

A corkboard-themed countdown site for tracking the school year — pinned index cards for every holiday, recess, and milestone, a live ticking countdown to what's next, and a handful of small interactions that make it feel a little less like a spreadsheet.

Built with [Claude AI](https://claude.ai). Calendar dates sourced from the official [GGUSD school calendar](https://www.ggusd.us/schools/calendar).

![status](https://img.shields.io/badge/status-active-brightgreen) ![no build step](https://img.shields.io/badge/build-none%20needed-blue)

## ✨ Features

- **Live hero countdown** — real-time days/hours/minutes/seconds ticking down to the next event
- **Sticky-note metrics** — days until/since the start, total school days, % of the year completed, events left, weeks left, and a "long weekends" fun-fact counter, all computed automatically from today's date
- **Pinned event cards** — one per holiday/recess/milestone, color-coded by pin (milestone, holiday, recess, non-student day), each with a fill bar tracking progress toward that date
- **Hover for details** — hover or tab to a card to reveal its weekday, how many actual school days it's worth, and how many school days away it is (holidays and weekends excluded from that count)
- **Live countdown badges** — hover (or tab to) any "IN X DAYS" badge and it turns into a real-time ticking countdown until you move away
- **Day/night mode** — toggle in the bottom-right corner, remembers your choice on repeat visits
- **Fully responsive** — collapses gracefully from a 4-column desktop layout down to a single column on phones

## 🚀 Getting started

No build step, no dependencies to install. Just open `index.html` in a browser, or serve the folder with anything static:

```bash
python3 -m http.server 8000
```

To publish it on GitHub Pages: push the repo, then enable Pages in **Settings → Pages** and point it at the `main` branch (root).

> **Note:** if you update the files and don't see your changes on the live site, do a hard refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) — GitHub Pages' CDN and your browser cache can both hang onto the old `script.js`/`style.css` for a bit after a push.

## 🛠 Customizing for your own school

Everything about the calendar lives at the top of `script.js` — no need to touch the HTML or CSS to update dates.

```js
const EVENTS = [
  { title: "First Day of School", date: "2026-08-10", category: "milestone" },
  { title: "Labor Day",           date: "2026-09-07", category: "holiday" },
  { title: "Winter Recess",       date: "2026-12-21", endDate: "2027-01-01", category: "recess" },
  // ...add or edit as needed
];

const TOTAL_SCHOOL_DAYS = 180; // update to match your district's official count
```

**Categories** control pin color and a few small behaviors:
| Category | Pin color | Meaning |
|---|---|---|
| `milestone` | red | first/last day — an actual school day |
| `holiday` | gold | no school |
| `nonstudent` | slate | staff/planning day, no students |
| `recess` | teal | multi-day break |

Single-day events just need `date`; multi-day ranges (recesses) also need `endDate`.

## 📁 File structure

```
.
├── index.html   # markup + theme-flash-prevention script
├── style.css    # corkboard styling, day/night theme variables
└── script.js    # event data, date math, and all rendering/interactivity
```

## 🧰 Built with

Plain HTML, CSS, and vanilla JavaScript — no frameworks or build tools. Fonts via [Google Fonts](https://fonts.google.com) (Caveat, Nunito, JetBrains Mono).

## 🙏 Credits

- Built with [Claude AI](https://claude.ai)
- Calendar dates from the official [GGUSD school calendar](https://www.ggusd.us/schools/calendar)

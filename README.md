# Starburst Drone Fuel Cost Calculator

This tool helps you calculate how much fuel you need to run your Starburst Drone for a desired duration, and how much it will cost you in both gems and coal. It also provides visual insights through two synchronized graphs.

---

## 🚀 Features

### 🎯 Inputs
- **Target Time (hours)** — Total number of hours you want the drone to operate.
- **Time Added Per Fuel Use (`mm:ss`)** — How much time (in minutes and seconds) each fuel unit adds.
  - Smart input formatting (e.g. `239` → `2:39`).
- **Fuel Save Chance (%)** — The percentage chance that a fuel unit is not consumed on use.
- **Fuel Cost (gems)** — How many gems one unit of fuel costs (default: 5).
- **Fuel Cost (coal)** — How much coal one unit of fuel costs (default: 50).

### 📈 Calculations
- **Effective seconds per fuel** — Adjusted based on the save chance.
- **Fuel Units Required** — Based on total target time and effective seconds.
- **Total Cost in Gems and Coal** — Multiplied by per-unit costs.

### 📊 Charts
- **Chart 1:** Gem Cost vs. Save Chance (%):
  - Shows how increasing fuel save chance reduces gem cost.
- **Chart 2:** Gem Cost vs. Duration Added (mm:ss):
  - Shows how increasing fuel efficiency (duration per use) affects total gem cost.
- **Synchronized hover between graphs**:
  - Hovering on one graph highlights the corresponding point on the other.

### 🧠 Robust Behavior
- Gracefully handles:
  - Missing or invalid inputs (e.g. invalid mm:ss).
  - Missing DOM elements or Chart.js library.
- Waits for full page load before initializing.
- Responsive and styled interface.

---

## 🔧 Future Improvements (optional)
- Export charts as PNG
- Export data as CSV
- Save/share input presets
- Add support for multiple languages

---

## 💡 Demo Initialization
Pre-filled demo values:
```javascript
renderSyncedCharts(168, 159, 5, 27.5, 0.275);
```

---

Enjoy your optimized drone runs! 🛰️

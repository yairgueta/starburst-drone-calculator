
let saveChart, durationChart;

function renderSyncedCharts(hours, duration, fuelCost, baseSave, saveChance) {
  const saveLabels = [];
  const saveData = [];
  for (let i = Math.max(0, baseSave - 20); i <= Math.min(100, baseSave + 20); i++) {
    const sc = i / 100;
    const fuelUsed = 1 - sc;
    const effSec = duration / fuelUsed;
    const fuelNeeded = (hours * 3600) / effSec;
    const cost = fuelNeeded * fuelCost;
    saveLabels.push(i.toFixed(1));
    saveData.push(cost);
  }

  const durationLabels = [];
  const durationData = [];
  for (let sec = 30; sec <= 600; sec += 15) {
    const fuelUsed = 1 - saveChance;
    const effSec = sec / fuelUsed;
    const fuelNeeded = (hours * 3600) / effSec;
    const cost = fuelNeeded * fuelCost;
    durationLabels.push(`${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`);
    durationData.push(cost);
  }

  const ctx1 = document.getElementById('saveChart')?.getContext('2d');
  const ctx2 = document.getElementById('durationChart')?.getContext('2d');

  if (!ctx1 || !ctx2 || typeof Chart === 'undefined') {
    console.error("Chart.js or canvas context not available.");
    return;
  }

  if (saveChart) saveChart.destroy();
  saveChart = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: saveLabels,
      datasets: [{
        label: 'Gem Cost vs. Save Chance (%)',
        data: saveData,
        borderColor: '#007bff',
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          title: { display: true, text: 'Gem Cost' },
          beginAtZero: true
        },
        x: {
          title: { display: true, text: 'Save Chance (%)' }
        }
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          external: (context) => syncTooltip(context, durationChart)
        }
      }
    }
  });

  if (durationChart) durationChart.destroy();
  durationChart = new Chart(ctx2, {
    type: 'line',
    data: {
      labels: durationLabels,
      datasets: [{
        label: 'Gem Cost vs. Duration (mm:ss)',
        data: durationData,
        borderColor: '#28a745',
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          title: { display: true, text: 'Gem Cost' },
          beginAtZero: true
        },
        x: {
          title: { display: true, text: 'Duration (mm:ss)' }
        }
      },
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          external: (context) => syncTooltip(context, saveChart)
        }
      }
    }
  });
}

function syncTooltip(context, otherChart) {
  const index = context.tooltip?.dataPoints?.[0]?.dataIndex;
  if (index !== undefined && otherChart) {
    otherChart.setActiveElements([{ datasetIndex: 0, index }]);
    if (otherChart.tooltip) {
      otherChart.tooltip.setActiveElements([{ datasetIndex: 0, index }]);
    }
    otherChart.update();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderSyncedCharts(168, 159, 5, 27.5, 0.275);
});


let saveChart, durationChart;

// Utility function to parse mm:ss format
function parseTimeInput(timeStr) {
  if (!timeStr) return 0;
  
  // Handle pure numbers (convert to mm:ss)
  if (/^\d+$/.test(timeStr)) {
    const totalSeconds = parseInt(timeStr);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes * 60 + seconds;
  }
  
  // Handle mm:ss format
  const match = timeStr.match(/^(\d+):(\d+)$/);
  if (match) {
    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    if (seconds >= 60) {
      // Invalid seconds
      return 0;
    }
    return minutes * 60 + seconds;
  }
  
  return 0;
}

// Format seconds to mm:ss
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Smart input formatting for time field
function formatTimeInput(input) {
  let value = input.value.replace(/[^\d]/g, ''); // Remove non-digits
  if (value.length === 0) return;
  
  if (value.length <= 2) {
    // 1-2 digits: assume seconds, format as 0:XX
    input.value = `0:${value.padStart(2, '0')}`;
  } else if (value.length === 3) {
    // 3 digits: X:XX
    input.value = `${value[0]}:${value.slice(1)}`;
  } else {
    // 4+ digits: XX:XX (take first 4)
    value = value.slice(0, 4);
    input.value = `${value.slice(0, 2)}:${value.slice(2)}`;
  }
}

// Main calculation function
function calculateFuelCost() {
  try {
    // Get input values
    const targetHours = parseFloat(document.getElementById('targetHours').value) || 0;
    const timeAddedStr = document.getElementById('timeAdded').value.trim();
    const saveChancePercent = parseFloat(document.getElementById('saveChance').value) || 0;
    const fuelCostGems = parseInt(document.getElementById('fuelCostGems').value) || 5;
    const fuelCostCoal = parseInt(document.getElementById('fuelCostCoal').value) || 50;
    
    // Parse time added per fuel use
    const durationSeconds = parseTimeInput(timeAddedStr);
    
    if (targetHours <= 0 || durationSeconds <= 0) {
      updateResults('--', '--', '--', '--');
      return;
    }
    
    // Calculate fuel requirements
    const saveChance = saveChancePercent / 100;
    const effectiveSecondsPerFuel = durationSeconds / (1 - saveChance);
    const totalSecondsNeeded = targetHours * 3600;
    const fuelUnitsRequired = Math.ceil(totalSecondsNeeded / effectiveSecondsPerFuel);
    const totalGemsRequired = fuelUnitsRequired * fuelCostGems;
    const totalCoalRequired = fuelUnitsRequired * fuelCostCoal;
    
    // Update results display
    updateResults(
      effectiveSecondsPerFuel.toFixed(1) + 's',
      fuelUnitsRequired.toLocaleString(),
      totalGemsRequired.toLocaleString(),
      totalCoalRequired.toLocaleString()
    );
    
    // Update charts
    renderSyncedCharts(targetHours, durationSeconds, fuelCostGems, saveChancePercent, saveChance);
    
  } catch (error) {
    console.error('Calculation error:', error);
    updateResults('Error', 'Error', 'Error', 'Error');
  }
}

// Update results display
function updateResults(effectiveSeconds, fuelRequired, totalGems, totalCoal) {
  document.getElementById('effectiveSeconds').textContent = effectiveSeconds;
  document.getElementById('fuelRequired').textContent = fuelRequired;
  document.getElementById('totalGems').textContent = totalGems;
  document.getElementById('totalCoal').textContent = totalCoal;
}

// Render synchronized charts
function renderSyncedCharts(hours, durationSeconds, fuelCostGems, baseSavePercent, currentSaveChance) {
  const ctx1 = document.getElementById('saveChart')?.getContext('2d');
  const ctx2 = document.getElementById('durationChart')?.getContext('2d');
  
  if (!ctx1 || !ctx2 || typeof Chart === 'undefined') {
    console.error("Chart.js or canvas context not available.");
    return;
  }
  
  // Chart 1: Gem Cost vs. Save Chance
  const saveLabels = [];
  const saveData = [];
  const saveRange = 40; // ±20% from current value
  const minSave = Math.max(0, baseSavePercent - saveRange/2);
  const maxSave = Math.min(100, baseSavePercent + saveRange/2);
  
  for (let i = minSave; i <= maxSave; i += 1) {
    const saveChance = i / 100;
    const effectiveSeconds = durationSeconds / (1 - saveChance);
    const fuelNeeded = Math.ceil((hours * 3600) / effectiveSeconds);
    const gemCost = fuelNeeded * fuelCostGems;
    saveLabels.push(i.toFixed(1));
    saveData.push(gemCost);
  }
  
  // Chart 2: Gem Cost vs. Duration Added
  const durationLabels = [];
  const durationData = [];
  for (let sec = 30; sec <= 600; sec += 15) {
    const effectiveSeconds = sec / (1 - currentSaveChance);
    const fuelNeeded = Math.ceil((hours * 3600) / effectiveSeconds);
    const gemCost = fuelNeeded * fuelCostGems;
    durationLabels.push(formatTime(sec));
    durationData.push(gemCost);
  }
  
  // Destroy existing charts
  if (saveChart) saveChart.destroy();
  if (durationChart) durationChart.destroy();
  
  // Create Save Chance chart
  saveChart = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: saveLabels,
      datasets: [{
        label: 'Gem Cost vs. Save Chance (%)',
        data: saveData,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          title: { display: true, text: 'Gem Cost' },
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.1)' }
        },
        x: {
          title: { display: true, text: 'Save Chance (%)' },
          grid: { color: 'rgba(0,0,0,0.1)' }
        }
      },
      plugins: {
        legend: { display: true, position: 'top' },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          external: (context) => syncTooltip(context, durationChart)
        }
      }
    }
  });
  
  // Create Duration chart
  durationChart = new Chart(ctx2, {
    type: 'line',
    data: {
      labels: durationLabels,
      datasets: [{
        label: 'Gem Cost vs. Duration Added (mm:ss)',
        data: durationData,
        borderColor: '#764ba2',
        backgroundColor: 'rgba(118, 75, 162, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          title: { display: true, text: 'Gem Cost' },
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.1)' }
        },
        x: {
          title: { display: true, text: 'Duration Added (mm:ss)' },
          grid: { color: 'rgba(0,0,0,0.1)' }
        }
      },
      plugins: {
        legend: { display: true, position: 'top' },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          external: (context) => syncTooltip(context, saveChart)
        }
      }
    }
  });
}

// Synchronized tooltip function
function syncTooltip(context, otherChart) {
  try {
    const index = context.tooltip?.dataPoints?.[0]?.dataIndex;
    if (index !== undefined && otherChart && otherChart.data) {
      otherChart.setActiveElements([{ datasetIndex: 0, index: Math.min(index, otherChart.data.labels.length - 1) }]);
      otherChart.update('none');
    }
  } catch (error) {
    // Silently handle sync errors
    console.debug('Tooltip sync error:', error);
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  // Set up event listeners
  // Note: No calculate button needed - calculations happen on input change
  
  // Auto-calculate on input change
  ['targetHours', 'timeAdded', 'saveChance', 'fuelCostGems', 'fuelCostCoal'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', calculateFuelCost);
      element.addEventListener('change', calculateFuelCost);
    }
  });
  
  // Smart formatting for time input
  const timeInput = document.getElementById('timeAdded');
  if (timeInput) {
    timeInput.addEventListener('blur', () => formatTimeInput(timeInput));
  }
  
  // Initial calculation with demo values
  calculateFuelCost();
});

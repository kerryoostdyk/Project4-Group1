// Define global variable to store all data
let fullData = [];

// Load data from API endpoints
function loadData() {
    d3.json("/api/v1.0/table_data").then(function (data) {
        fullData = data;
        updateDashboard("2019"); // Set initial year
    });

    d3.json("/api/v1.0/bar_data").then(function (data) {
        fullDataBar = data;
        updateBarChart(fullDataBar, "2019");
    });

    d3.json("/api/v1.0/heat_data").then(function (data) {
        fullDataHeat = data;
        updateHeatmap(fullDataHeat, "2019");
    });
}

// Function to filter data based on selected year
function updateDashboard(selectedYear) {
    let filteredTableData = fullData.filter(d => d.year == selectedYear);
    updateTable(filteredTableData);

    let filteredBarData = fullDataBar.filter(d => d.year == selectedYear);
    updateBarChart(filteredBarData, selectedYear);

    let filteredHeatData = fullDataHeat.filter(d => d.year == selectedYear);
    updateHeatmap(filteredHeatData, selectedYear);
}

// Function to update table
function updateTable(filteredData) {
    let table = $("#mlb_table").DataTable();
    table.clear();

    filteredData.forEach(d => {
        table.row.add([
            d.year, d.player_name, d.player_position, d.team, d.team_abv,
            d.G, d.AB, d.R, d.H, d.HR, d.RBI, d.BB, d.SO, d.AVG, d.league, d.division
        ]);
    });

    table.draw(); // Redraw the table
}

// Function to update bar chart
function updateBarChart(filteredData, year) {
    let teams = filteredData.map(d => d.team_abv);
    let homeRuns = filteredData.map(d => +d.total_home_runs);

    let trace = {
        x: teams,
        y: homeRuns,
        type: "bar",
        marker: { color: teams.map(team => team_colors[team] || "#888888") }
    };

    let layout = {
        title: `Number of Home Runs in ${year}`,
        xaxis: { title: "Team" },
        yaxis: { title: "Total Home Runs" },
        height: 500,
        width: 950,
        margin: { t: 50, l: 50, r: 50, b: 100 }
    };

    Plotly.newPlot("plot", [trace], layout);
}

// Function to update heatmap
function updateHeatmap(filteredData, year) {
    if (!filteredData || filteredData.length === 0) {
        console.error(`Heatmap data is missing or empty for year ${year}.`);
        return;
    }
  
    let teams = filteredData.map(d => d.team_abv);
    let stats = ["AVG", "HR", "R", "SO"];
  
    // Ensure numeric values, default to 0 if undefined
    let zValues = stats.map(stat => filteredData.map(d => d[stat] !== null ? +d[stat] : 0));
  
    console.log("Heatmap Data:", { teams, stats, zValues });
  
    let trace = {
        z: zValues,
        x: teams,
        y: stats,
        type: "heatmap",
        showscale: true,
        xgap: 1,
        ygap: 1,
        colorscale: [
            [0, "blue"],
            [0.5, "white"],
            [1, "red"],
        ],
        hovertemplate: "Team: %{x}<br>Stat: %{y}<br>Result: %{z}<extra></extra>"
    };
  
    let layout = {
        title: `MLB Team Statistics Heatmap (${year})`,
        xaxis: { title: "Teams", tickangle: -45 },
        yaxis: { title: "Statistics" },
        height: 500,
        width: 950,
        margin: { t: 50, l: 100, r: 50, b: 100 }
    };
  
    Plotly.newPlot("heatmap", [trace], layout);
  }
  

// Listen for year selection change
$("#year-dropdown").on("change", function () {
    updateDashboard(this.value);
});

// Initialize DataTable
$("#mlb_table").DataTable();

// Load and process data on page load
$(document).ready(function () {
    loadData();
});

// Define Team Colors
let team_colors = {
    "ARI": "#A91D2D", "ATL": "#CE1141", "BAL": "#FF5100", "BOS": "#BD3039", "CHC": "#0E4CB6",
    "CWS": "#404040", "CIN": "#D50032", "CLE": "#E63946", "COL": "#5E1C8A", "DET": "#0C2C56",
    "HOU": "#FF6F1F", "KC": "#0072CE", "LAA": "#DC002E", "LAD": "#0066B3", "MIA": "#00C3E3",
    "MIL": "#2C3E50", "MIN": "#002B75", "NYM": "#F5751D", "NYY": "#1D2951", "OAK": "#026E00",
    "PHI": "#E60026", "PIT": "#FDD017", "SD": "#4D3B24", "SF": "#FE4C1E", "SEA": "#005C7C",
    "STL": "#C41E3A", "TB": "#9ACEEB", "TEX": "#BF0D3E", "TOR": "#2359C7", "WSH": "#C8102E"
};

// Define a function to update the table with filtered data based on the team clicked in the heatmap
function updateTableForTeam(teamAbv) {
    const filteredData = fullData.filter(row => row.team_abv === teamAbv);
    updateTable(filteredData);
}
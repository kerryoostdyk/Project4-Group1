// Define team colors
let team_colors = {
    "ARI": "#A91D2D", "ATL": "#CE1141", "BAL": "#FF5100", "BOS": "#BD3039", "CHC": "#0E4CB6",
    "CWS": "#404040", "CIN": "#D50032", "CLE": "#E63946", "COL": "#5E1C8A", "DET": "#0C2C56",
    "HOU": "#FF6F1F", "KC": "#0072CE", "LAA": "#DC002E", "LAD": "#0066B3", "MIA": "#00C3E3",
    "MIL": "#2C3E50", "MIN": "#002B75", "NYM": "#F5751D", "NYY": "#1D2951", "OAK": "#026E00",
    "PHI": "#E60026", "PIT": "#FDD017", "SD": "#4D3B24", "SF": "#FE4C1E", "SEA": "#005C7C",
    "STL": "#C41E3A", "TB": "#9ACEEB", "TEX": "#BF0D3E", "TOR": "#2359C7", "WSH": "#C8102E"
};

// Define a lookup for team names to their abbreviations (sunburst color correction)
const team_name_to_abv = {
    "Arizona Diamondbacks": "ARI", "Atlanta Braves": "ATL", "Baltimore Orioles": "BAL", "Boston Red Sox": "BOS",
    "Chicago Cubs": "CHC", "Chicago White Sox": "CWS", "Cincinnati Reds": "CIN", "Cleveland Guardians": "CLE",
    "Colorado Rockies": "COL", "Detroit Tigers": "DET", "Houston Astros": "HOU", "Kansas City Royals": "KC",
    "Los Angeles Angels": "LAA", "Los Angeles Dodgers": "LAD", "Miami Marlins": "MIA", "Milwaukee Brewers": "MIL",
    "Minnesota Twins": "MIN", "New York Mets": "NYM", "New York Yankees": "NYY", "Oakland Athletics": "OAK",
    "Philadelphia Phillies": "PHI", "Pittsburgh Pirates": "PIT", "San Diego Padres": "SD", "San Francisco Giants": "SF",
    "Seattle Mariners": "SEA", "St. Louis Cardinals": "STL", "Tampa Bay Rays": "TB", "Texas Rangers": "TEX",
    "Toronto Blue Jays": "TOR", "Washington Nationals": "WSH"
};

// MLB Color Assignments
const MLB_RED = "#C8102E";
const MLB_BLUE = "#0033A0";

// Plot title labels
const statLabels = {
    "total_hits": "Total Hits",
    "total_home_runs": "Home Runs",
    "total_runs": "Total Runs",
    "total_rbi": "Total RBIs",
    "total_strikeouts": "Total Strikeouts",
    "total_walks": "Total Walks",
    "avg_batting": "Batting Average",
    "avg_slugging": "Slugging Percentage"
};

// Data storage
let fullData = [];

// Load data from API
d3.json("/api/v1.0/regression_data").then(function(data) {
    fullData = data;

    // Set default selection
    updateRegressionPlot("2019", "total_hits", "total_home_runs");
});

// Regression update function
function updateRegressionPlot(selectedYear, xStat, yStat) {
    let filteredData = fullData.filter(d => d.year == selectedYear);

    let teams = filteredData.map(d => `${d.team} (${d.team_abv})`);
    let teamAbvs = filteredData.map(d => d.team_abv);
    let xValues = filteredData.map(d => d[xStat]);
    let yValues = filteredData.map(d => d[yStat]);

    let colors = teamAbvs.map(team => team_colors[team] || "#888888");

    // Perform regression
    let regressionResult = regressionLine(xValues, yValues);
    let equation = `y = ${regressionResult.slope.toFixed(2)}x + ${regressionResult.intercept.toFixed(2)}`;

    // Create scatter plot
    let scatter = {
        x: xValues,
        y: yValues,
        text: teams,
        mode: "markers",
        type: "scatter",
        name: "Data Points",
        marker: { color: colors, size: 10 }
    };

    // Regression line
    let regressionLinePlot = {
        x: regressionResult.x,
        y: regressionResult.y,
        mode: "lines",
        type: "scatter",
        name: "Regression Line",
        line: { color: "red" }
    };

    // Layout
    let layout = {
        title: `${statLabels[xStat] || xStat} vs ${statLabels[yStat] || yStat} (${selectedYear})`,
        xaxis: { title: statLabels[xStat] },
        yaxis: { title: statLabels[yStat] },
        annotations: [
            {
                xref: "paper", 
                yref: "paper",
                x: 0.95,
                y: 0.05,
                text: equation,
                showarrow: false,
                font: { size: 14, color: "black" }
            }
        ]
    };

    Plotly.newPlot("regression_plot", [scatter, regressionLinePlot], layout);
}

// Function for sunburst chart
function updateSunburstChart(selectedYear, selectedStat = "total_hits") {
    d3.json("/api/v1.0/sunburst_data?year=" + selectedYear).then(function(data) {
        if (!data.length) {
            Plotly.newPlot("sunburst_chart", [], { title: `MLB Sunburst Chart (${selectedYear}) - ${selectedStat}` });
            return;
        }

        let labels = [];
        let parents = [];
        let values = [];
        let colors = [];

        let divisionSums = {};
        let teamSums = {};

        data.forEach(d => {
            let divisionLabel = d.division;
            let teamLabel = d.team;
            let playerLabel = d.player_name;

            let fullTeamKey = `${d.division} - ${d.team}`;

            // Totals for hierarchy levels
            divisionSums[divisionLabel] = (divisionSums[divisionLabel] || 0) + d[selectedStat];
            teamSums[fullTeamKey] = (teamSums[fullTeamKey] || 0) + d[selectedStat];

            // Add player
            labels.push(playerLabel);
            parents.push(teamLabel);
            values.push(d[selectedStat]);
            colors.push(team_colors[d.team_abv]); 
        });

        // Add Teams
        Object.keys(teamSums).forEach(fullTeamKey => {
            let parts = fullTeamKey.split(" - ");
            let teamName = parts[1];
            let divisionName = parts[0];
        
            labels.push(teamName);
            parents.push(divisionName);
            values.push(teamSums[fullTeamKey]);
        
            // Get the team abbreviation and assign the correct color
            let teamAbv = team_name_to_abv[teamName] || null;
            colors.push(teamAbv ? team_colors[teamAbv] : "#888888");
        });

        // Add Divisions
        Object.keys(divisionSums).forEach(division => {
            labels.push(division);
            parents.push("MLB");
            values.push(divisionSums[division]);
            colors.push(MLB_BLUE);
        });

        // Add MLB
        labels.push("MLB");
        parents.push("");
        values.push(d3.sum(Object.values(divisionSums)));
        colors.push(MLB_RED);

        let sunburstData = [{
            type: "sunburst",
            labels: labels,
            parents: parents,
            values: values,
            branchvalues: "total",
            textinfo: "label+value",
            insidetextorientation: "radial",
            marker: { colors: colors },
            textfont: {
                size: labels.map(label => label === "MLB" ? 18 : 12),
                weight: labels.map(label => label === "MLB" ? "bold" : "normal"),
                color: "white"
            }
        }];

        let statTitle = statLabels[selectedStat] || selectedStat; 

        let layout = {
            title: `MLB Sunburst Chart (${selectedYear}) - ${statTitle}`,
            margin: { l: 0, r: 0, b: 0, t: 50 }
        };

        Plotly.newPlot("sunburst_chart", sunburstData, layout);
    });
}


// Call function after updating regression plot
d3.select("#year-dropdown").on("change", function () {
    updateRegressionPlot(
        this.value, 
        mapStatToColumn(d3.select("#x-stat-dropdown").property("value")), 
        mapStatToColumn(d3.select("#y-stat-dropdown").property("value"))
    );
    updateSunburstChart(this.value);
});

// Dynamically update dropdowns
function updateDropdownOptions() {
    let xSelected = d3.select("#x-stat-dropdown").property("value");
    let ySelected = d3.select("#y-stat-dropdown").property("value");

    d3.select("#x-stat-dropdown")
        .selectAll("option")
        .property("disabled", function() { return this.value === ySelected; });

    d3.select("#y-stat-dropdown")
        .selectAll("option")
        .property("disabled", function() { return this.value === xSelected; });
}

// Function for dropdown selection/API matching
function mapStatToColumn(stat) {
    const statMap = {
        "H": "total_hits",
        "HR": "total_home_runs",
        "R": "total_runs",
        "RBI": "total_rbi",
        "SO": "total_strikeouts",
        "BB": "total_walks"
    };
    return statMap[stat] || stat;
}

// Function to calculate linear regression
function regressionLine(xValues, yValues) {
    let n = xValues.length;
    let sumX = d3.sum(xValues);
    let sumY = d3.sum(yValues);
    let sumXY = d3.sum(xValues.map((x, i) => x * yValues[i]));
    let sumXX = d3.sum(xValues.map(x => x * x));

    let slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    let intercept = (sumY - slope * sumX) / n;

    let xMin = Math.min(...xValues);
    let xMax = Math.max(...xValues);
    let regressionX = [xMin, xMax];
    let regressionY = [intercept + slope * xMin, intercept + slope * xMax];

    return { x: regressionX, y: regressionY, slope, intercept };
}

// Event Listeners
d3.select("#year-dropdown").on("change", function () {
    updateRegressionPlot(
        this.value, 
        mapStatToColumn(d3.select("#x-stat-dropdown").property("value")), 
        mapStatToColumn(d3.select("#y-stat-dropdown").property("value"))
    );
    updateSunburstChart(this.value);
});
d3.select("#x-stat-dropdown").on("change", function () {
    updateDropdownOptions();
    updateRegressionPlot(
        d3.select("#year-dropdown").property("value"), 
        mapStatToColumn(this.value), 
        mapStatToColumn(d3.select("#y-stat-dropdown").property("value"))
    );
});
d3.select("#y-stat-dropdown").on("change", function () {
    updateDropdownOptions();
    updateRegressionPlot(
        d3.select("#year-dropdown").property("value"), 
        mapStatToColumn(d3.select("#x-stat-dropdown").property("value")), 
        mapStatToColumn(this.value)
    );
});

d3.select("#sunburst-stat-dropdown").on("change", function() {
    updateSunburstChart(d3.select("#year-dropdown").property("value"), this.value);
});

// Initialize plots with default year
updateRegressionPlot("2019", "total_hits", "total_home_runs");
updateSunburstChart("2019");
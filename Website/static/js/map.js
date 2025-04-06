// Function to handle button click event and update the selected stat
document.querySelectorAll('.stat-option').forEach(button => {
  button.addEventListener('click', function() {
      // Remove active class from all buttons
      document.querySelectorAll('.stat-option').forEach(btn => {
          btn.classList.remove('active');
      });

      // Add active class to clicked button
      this.classList.add('active');
      
      // Update the selected stat
      let selectedStat = this.getAttribute('data-value');
      
      // Ensure the selectedStat is not undefined or null
      if (selectedStat) {
          // Trigger the map creation function with the selected stat
          init(selectedStat);  // Ensure init function handles the selected stat properly
      } else {
          console.error('Selected stat is undefined.');
      }
  });
});

// Function to create the map dynamically
function createMap(selectedYear, selectedStat) {
  
  // Delete Map
  let map_container = d3.select("#map_container");
  map_container.html("");
  map_container.append("div").attr("id", "map").style("height", "800px");

  // Step 1: CREATE THE BASE LAYERS
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Assemble the API query URL.
  let url = `/api/v1.0/map_data?year=${selectedYear}&stat=${selectedStat}`;
  console.log(`Fetching map data from: ${url}`);

  d3.json(url).then(function (data) {
    console.log("Map Data Received:", data);

    // Initialize data containers
    let markers = [];

    // Determine min/max for scaling
    let minStat = Math.min(...data.map(d => d.total_stat));
    let maxStat = Math.max(...data.map(d => d.total_stat));

    // Function to scale marker
    function getRadius(stat) {
      return 10 + ((stat - minStat) / (maxStat - minStat)) * 40;
    }

    // Function to determine color
    function chooseColor(stat) {
      let scale = (stat - minStat) / (maxStat - minStat);
      let red = Math.round(255 * (1 - scale));
      let green = Math.round(255 * scale);
      return `rgb(${red}, ${green}, 0)`;
    }

    // Loop through data
    for (let i = 0; i < data.length; i++) {
      let row = data[i];

      if (row.latitude && row.longitude) {
        let marker = L.circleMarker([row.latitude, row.longitude], {
          fillOpacity: 0.75,
          color: "white",
          weight: 0.75,
          fillColor: chooseColor(row.total_stat),
          radius: getRadius(row.total_stat)
        }).bindPopup(
          `<div style="text-align: center;">
            <h3>${row.team} (${row.team_abv})</h3>
            <hr style="border: 1px solid grey;">
            <h4>${selectedStat}: ${row.total_stat}</h4>
          </div>`
        );

        markers.push(marker);
      }
    }

    // Initialize map
    let myMap = L.map("map", {
      center: [36.82, -98.58], // U.S. center
      zoom: 4.5,
      layers: [street]
    });

    // Add marker layer if there are markers
    let markerLayer = L.layerGroup(markers);
    if (markers.length > 0) {
      markerLayer.addTo(myMap);
    }

    // Layer Control
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };

    let overlayMaps = {
      "Team Stats": markerLayer
    };

    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

  });
}

// Initialize map with default values
function init(selectedStat = 'HR') {
  let selectedYear = d3.select("#year-dropdown").property("value");
  createMap(selectedYear, selectedStat);
}

// Event Listeners
d3.select("#year-dropdown").on("change", function() {
  let selectedStat = document.querySelector('.stat-option.active')?.getAttribute('data-value') || 'HR';
  init(selectedStat);
});

d3.selectAll('input[name="stat-option"]').on("change", function() {
  let selectedStat = this.value; // Assuming radio buttons, update accordingly
  init(selectedStat);
});

// On page load
init();
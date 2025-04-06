// Use D3 to select the table

// Use D3 to create a bootstrap striped table
// https://getbootstrap.com/docs/5.3/content/tables/#striped-rows

// Use D3 to select the table body

// BONUS: Dynamic table
// Loop through an array of grades and build the entire table body from scratch

// Use D3 to select the table
let table = d3.select("#ufosighting_table");
let tbody = table.select("tbody");

// Make Table Interactive
let dt_table = new DataTable('#ufosighting_table');

// Event Listener
d3.select("#filter-btn").on("click", function () {
  doWork();
});
//Event Listener
d3.select("#ufo-shape").on("change", function () {
  doWork();  
});

// On Page Load
doWork();

// Helper Functions
function doWork() {
  // Fetch the JSON data and console log it

  // get value
  let min_year = d3.select("#min-year").property("value");//user input
  let selected_shape = d3.select("#ufo-shape").property("value"); // user input
  
  if (selected_shape === "All") {
    selected_shape = "all";  
  }
  let url1 = `/api/v1.0/bar_data/${min_year}/${selected_shape}`;
  let url2 = `/api/v1.0/table_data/${min_year}/${selected_shape}`;
  let url3 = `/api/v1.0/scatter_data/${min_year}/${selected_shape}`;
  let url4 = `/api/v1.0/bubble_data/${min_year}/${selected_shape}`;
  let url5 = `/api/v1.0/donut_data/${min_year}/${selected_shape}`;
  let url6 = `/api/v1.0/countrybar_data/${min_year}/${selected_shape}`;
  
  
  

  // Make Request
  d3.json(url1).then(function (data) {
    // Make Plot
    makeBarPlot(data);
  });

  d3.json(url2).then(function (data) {
    // Make Table
    makeTable(data);
  });

  d3.json(url3).then(function (data){
    //Make scatter plot
    console.log(data)
    makeScatterplot(data);
  });

  d3.json(url4).then(function (data){
    //Make bubble plot
    console.log(data)
    makeBubbleplot(data);
  });

  
  d3.json(url5).then(function (data){
    //Make donut chart
    console.log(data)
    makeDonutchart(data);
  });

  d3.json(url6).then(function (data){
    //Make bar plot
    console.log(data)
    makeCountryBarPlot(data);
  });

  

  
}


function makeTable(data) {
  // Clear Table
  tbody.html("");
  dt_table.clear().destroy();

  // Create Table
  for (let i = 0; i < data.length; i++) {
    let row = data[i];

    // Create Table Row
    let table_row = tbody.append("tr");

    // Append Cells
    table_row.append("td").text(row.year);
    table_row.append("td").text(row.season);
    table_row.append("td").text(row.country);
    table_row.append("td").text(row.UFO_shape);
    table_row.append("td").text(row.latitude);
    table_row.append("td").text(row.longitude);
  }

  // Make Table Interactive (again)
  dt_table = new DataTable('#ufosighting_table', {
    order: [[0, 'desc']] // Sort by column 1 desc
  });
}

function makeScatterplot(data) {
  // Prepare data for the scatter plot
  let trace = {
    x: data.map(row => row.country), 
    y: data.map(row => row.num_ufosighting),  
    mode: 'markers',
    type: 'scatter',
    marker: { color: 'lightgreen' }
  };

  // Layout for the scatter plot
  let layout = {
    title: { text: 'UFO Sightings by Location' },
    xaxis: { title: { text: 'Country' } },
    yaxis: { title: { text: 'Number of UFO sightings' } },
    height: 600
  };

  // Render the plot using Plotly
  Plotly.newPlot('scatter-plot', [trace], layout);
}


function makeBarPlot(data) {
  // Create Trace
  let trace = {
    x: data.map(row => row.year),
    y: data.map(row => row.num_ufosighting),
    type: 'bar',
    marker: {
      color: 'lightblue'
    }
  }

  // Data trace array
  let traces = [trace];

  // Apply a title to the layout
  let layout = {
    title: {
      text: `Number of UFO Sightings by Year`
    },
    yaxis: {
      title: {
        text: 'Number of UFO Sightings'
      }
    },
    xaxis: {
      title: {
        text: 'Year'
      }
    },
    height: 600
  }

  // Render the plot to the div tag with id "plot"
  Plotly.newPlot('plot', traces, layout);
}

function makeCountryBarPlot(data) {
  // Create Trace
  let trace = {
    x: data.map(row => row.country),
    y: data.map(row => row.num_ufosighting),
    type: 'bar',
    marker: {
      color: 'yellow'
    }
  }

  // Data trace array
  let traces = [trace];

  // Apply a title to the layout
  let layout = {
    title: {
      text: `Number of UFO Sightings for Top 10 Countries`
    },
    yaxis: {
      title: {
        text: 'Number of UFO Sightings'
      }
    },
    xaxis: {
      title: {
        text: 'Country'
      }
    },
    height: 600
  }

  // Render the plot to the div tag with id "plot"
  Plotly.newPlot('barplot', traces, layout);
}


function makeBubbleplot(data) {
  // Prepare data for the scatter plot
  let trace = {
    x: data.map(row => row.year),
    y: data.map(row => row.Hour),
    text: data.map(row => row.year),
    mode: 'markers',
    marker: {
      color: data.map(row => row.year),
      size: data.map(row => row.Estimated_Encounter_Duration_Minutes),
      colorscale: 'Picnic'
    }
  };

  let traces = [trace];

  let layout = {
    title: {
      text: 'UFO Sightings by Year'
    },
    yaxis: {
      title: {
        text: 'Hour of the Day'
      }
    },
    xaxis: {
      title: {
        text: 'Year'
      }
    },
    height: 600
  };

  // Render the Bubble Chart
  Plotly.newPlot('bubble', traces, layout);

}

function makeDonutchart(data) {
  // Prepare data for the donut chart
  console.log(data)
  let trace = {
    values: data.map(row => row.num_ufosighting), 
    labels: data.map(row => row.season),
    type: 'pie',
    hole: 0.4,
	  marker: { colors: ['lightgreen', 'lightblue', 'grey', 'yellow'] }
  };

  // Layout for the Donut Chart
  let layout = {
    title: { text: 'UFO Sightings by Season' },
    height: 500,
    width: 600,
    showlegend: true,
  };

  // Render the plot using Plotly
  Plotly.newPlot('donut', [trace], layout);
  
  
}


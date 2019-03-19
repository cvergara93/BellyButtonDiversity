function buildMetadata(sample) {
  // @TODO: Complete the following function that builds the metadata panel
  var murl = `/metadata/${sample}`;
  // Use `d3.json` to fetch the metadata for a sample
  // Use d3 to select the panel with id of `#sample-metadata`
  var metapanel = d3.select("#sample-metadata");
  // Use `.html("") to clear any existing metadata
  metapanel.html("");
  // Use `Object.entries` to add each key and value pair to the panel
  // Hint: Inside the loop, you will need to use d3 to append new
  // tags for each key-value in the metadata.
  d3.json(murl).then(function(entry) {
    Object.entries(entry).forEach(([key, value]) => {
      console.log(entry);
      metapanel.append("h6").text(`${key}: ${value}`);
    });
  });
}

function pieChart(data) {
  console.log(data);
  function getArray(object) {
    return Object.keys(object).reduce(function(r, k) {
      object[k].forEach(function(a, i) {
        r[i] = r[i] || {};
        r[i][k] = a;
      });
      return r;
    }, []);
  }
  dataArray = getArray(data);
  console.log(dataArray);
  dataArray.sort(function(a, b) {
    return parseFloat(b.sample_values) - parseFloat(a.sample_values);
  });
  data = dataArray.slice(0, 10);
  var labels = data.map(row => row.otu_ids);
  var values = data.map(row => row.sample_values);
  var hovertext = data.map(row => row.otu_labels);
  var trace = [
    {
      values: values,
      labels: labels,
      type: "pie",
      textposition: "inside",
      hovertext: hovertext
    }
  ];

  var layout = {
    title: "<b> Belly Button OTU Distribution </b>"
  };

  Plotly.newPlot("pie", trace, layout, { responsive: true });
}

function bubbleChart(data) {
  var x = data.otu_ids;
  var y = data.sample_values;
  var markersize = data.sample_values;
  var markercolors = data.otu_ids;
  var textvalues = data.otu_labels;

  var trace1 = {
    x: data.otu_ids,
    y: data.sample_values,
    mode: "markers",
    text: data.otu_labels,
    marker: {
      color: markercolors,
      size: markersize,
      colorscale: "Earth"
    }
  };
  var trace1 = [trace1];
  var layout = {
    title: "OTU Sample Counts",
    xaxis: {
      title: "OTU ID"
    },
    yaxis: {
      title: "Sample Value"
    },
    autosize: true,
    showlegend: false
  };

  Plotly.newPlot("bubble", trace1, layout, { responsive: true });
}

// BONUS: Build the Gauge Chart
// buildGauge(data.WFREQ);
function gaugeChart(data) {
  // Enter a speed between 0 and 180
  let degree = parseInt(data.WFREQ) * (180 / 10);

  let level = degree;

  // Trig to calc meter point
  let degrees = 180 - level,
    radius = 0.5;
  let radians = (degrees * Math.PI) / 180;
  let x = radius * Math.cos(radians);
  let y = radius * Math.sin(radians);

  // Path: may have to change to create a better triangle
  (mainPath = "M -.0 -0.025 L .0 0.025 L "),
    (pathX = String(x)),
    (space = " "),
    (pathY = String(y)),
    (pathEnd = " Z");
  path = mainPath.concat(pathX, space, pathY, pathEnd);
  var trace = [
    {
      type: "scatter",
      x: [0],
      y: [0],
      marker: { size: 32, color: "850000" },
      showlegend: false,
      name: "WASH FREQ",
      text: data.WFREQ,
      hoverinfo: "text+name"
    },
    {
      values: [1, 1, 1, 1, 1, 1, 1, 1, 1, 9],
      rotation: 90,
      text: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1", ""],
      textinfo: "text",
      textposition: "inside",
      textfont: {
        size: 16
      },
      marker: {
        colors: [
          "rgba(8, 212, 65, 0.84)",
          "rgba(103, 212, 8, 0.84)",
          "rgba(167, 212, 8, 0.67)",
          "rgba(246, 249, 83, 0.84)",
          "rgba(212, 171, 8, 0.67)",
          "rgba(212, 133, 8, 0.67)",
          "rgba(212, 99, 8, 0.67)",
          "rgba(212, 45, 8, 0.67)",
          "rgba(236, 24, 24, 0.82)",
          "rgba(255, 255, 255, 0)"
        ]
      },
      labels: [
        "8-9",
        "7-8",
        "6-7",
        "5-6",
        "4-5",
        "3-4",
        "2-3",
        "2-1",
        "0-1",
        ""
      ],
      hoverinfo: "text",
      hole: 0.5,
      type: "pie",
      showlegend: false
    }
  ];

  let layout = {
    shapes: [
      {
        type: "path",
        path: path,
        fillcolor: "850000",
        line: {
          color: "850000"
        }
      }
    ],

    title: "<b> Belly Button Washing Frequency</b> <br> Scrubs Per Week",
    xaxis: {
      zeroline: false,
      showticklabels: false,
      showgrid: false,
      range: [-1, 1]
    },
    yaxis: {
      zeroline: false,
      showticklabels: false,
      showgrid: false,
      range: [-1, 1]
    },
    plot_bgcolor: "rgba(0, 0, 0, 0)",
    paper_bgcolor: "rgba(0, 0, 0, 0)"
  };

  Plotly.newPlot("gauge", trace, layout, { responsive: true });
}

function buildCharts(sample) {
  d3.json(`/wfreq/${sample}`).then(wdata =>
    // ## Gauge Chart ##
    gaugeChart(wdata)
  );
  d3.json(`/samples/${sample}`).then(data => {
    // ## Pie Chart ##
    pieChart(data);
    // ## Bubble Chart ##
    bubbleChart(data);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then(sampleNames => {
    sampleNames.forEach(sample => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();

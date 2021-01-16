// declare the census data
var censusData = [];

// Define SVG area dimensions
var svgWidth = 850;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 60,
  right: 60,
  bottom: 60,
  left: 60,
};

// Select body, append SVG area to it, and set its dimensions
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append a group area, then set its margins
var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;
//
// Initialize the application by reading the data and then
// call the callback to initialize the graphs
//
function initApp(callback) {
  d3.csv("assets/data/data.csv")
    .then(
      (data) => {
        // Format the date and cast the force value to a number
        data.forEach((element) => {
          element.age = +element.age;
          element.smokes = +element.smokes;
          element.healthcare = +element.healthcare;
          element.poverty = +element.poverty;
        });

        censusData = data;
      },
      function (error) {
        console.log(error);
      }
    )
    .then(callback);
}

//
// initialize the scatter plot
//
function init() {
  console.log("init()");
  console.log(censusData);

  // d3.extent returns the an array containing the min and
  // max values for the property specified
  var xLinearScale = d3
    .scaleLinear()
    .domain(d3.extent(censusData, (data) => data.poverty))
    .range([0, chartWidth]);

  // Configure a linear scale with a range between the chartHeight and 0
  var yLinearScale = d3
    .scaleLinear()
    .domain([0, d3.max(censusData, (data) => data.healthcare)])
    .range([chartHeight, 0]);

  // Create two new functions passing the scales in as arguments
  // These will be used to create the chart's axes
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Draw the axes
  chartGroup.append("g").call(leftAxis);

  chartGroup
    .append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);
}

initApp(init);

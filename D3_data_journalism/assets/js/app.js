// declare the census data
var censusData = [];

// Define SVG area dimensions
var svgWidth = 800;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 60,
  right: 60,
  bottom: 60,
  left: 60,
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append a group area, then set its margins
var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  .classed("chart", true);

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

  // Calculate the extents for x and y based upon the data
  // the get teh rang between the low and the high
  var xExtents = d3.extent(censusData, (data) => data.poverty);
  var xRange = xExtents[1] - xExtents[0];

  var yExtents = d3.extent(censusData, (data) => data.healthcare);
  var yRange = yExtents[1] - yExtents[0];

  // Scale the extents so that the markers don't span over the axis
  var scalePercent = 0.05;
  var xDomain = [
    xExtents[0] - xRange * scalePercent,
    xExtents[1] + xRange * scalePercent,
  ];
  var yDomain = [
    yExtents[0] - yRange * scalePercent,
    yExtents[1] + yRange * scalePercent,
  ];

  // Configure a x linear scale with a range between the 0 and chartWidth
  var xLinearScale = d3.scaleLinear().domain(xDomain).range([0, chartWidth]);

  // Configure a y linear scale with a range between the chartHeight and 0
  var yLinearScale = d3.scaleLinear().domain(yDomain).range([chartHeight, 0]);

  console.log(xLinearScale(9.2));

  // Create two new functions passing the scales in as arguments
  // These will be used to create the chart's axes
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Draw the x axis
  chartGroup
    .append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

  // Draw the y axis
  chartGroup.append("g").call(leftAxis);

  // Add a tool tip to the bubbles
  var tool_tip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function (d) {
      return `${d.state}<br/>Poverty: ${d.poverty}<br/>Healthcare: ${d.healthcare}`;
    });

  // Attach the tool tip to svg
  svg.call(tool_tip);

  // Set the circle radius
  var radius = 14;

  // Draw the circles
  var circles = chartGroup
    .selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", (d) => xLinearScale(d.poverty))
    .attr("cy", (d) => yLinearScale(d.healthcare))
    .attr("r", radius)
    .attr("opacity", "0.5")
    .on("mouseover", tool_tip.show)
    .on("mouseout", tool_tip.hide);

  // Draw the state abbr on the circles
  var circleLabels = chartGroup
    .selectAll(null)
    .data(censusData)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("x", (d) => xLinearScale(d.poverty))
    .attr("y", (d) => yLinearScale(d.healthcare) + (radius / 2 - 1))
    .text((d) => d.abbr)
    .on("mouseover", tool_tip.show)
    .on("mouseout", tool_tip.hide);

  var yLabel = chartGroup
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("id", "healthcare")
    .attr("y", 0 - margin.left + 30)
    .attr("x", 0 - chartHeight / 2)
    .classed("active", true)
    .text("Lacks Healthcare (%)")
    .on("click", updateScatter);

  var xLabel = chartGroup
    .append("text")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 40})`)
    .attr("id", "poverty")
    .classed("active", true)
    .text("In Poverty (%)")
    .on("click", updateScatter);
}

function updateScatter() {
  var element = d3.select(this);
  console.log(element.attr("id"));
}

initApp(init);

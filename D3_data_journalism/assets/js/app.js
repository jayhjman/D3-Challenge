// declare the census data
var censusData = [];

var xAttribute = "poverty";
var yAttribute = "healthcare";

// Set the circle radius
var radius = 14;

// Define SVG area dimensions
var svgWidth = 800;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 60,
  right: 60,
  bottom: 100,
  left: 60,
};

var circles = null;
var circleLabels = null;

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
          element.obesity = +element.obesity;
          element.smokes = +element.smokes;
          element.healthcare = +element.healthcare;
          element.poverty = +element.poverty;
          element.age = +element.age;
          element.income = +element.income;
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
  // Configure a x linear scale with a range between the 0 and chartWidth
  var xLinearScale = getLinearScale(censusData, xAttribute, [0, chartWidth]);

  // Configure a y linear scale with a range between the chartHeight and 0
  var yLinearScale = getLinearScale(censusData, yAttribute, [chartHeight, 0]);

  // Create two new functions passing the scales in as arguments
  // These will be used to create the chart's axes
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Draw the x axis
  chartGroup
    .append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .attr("id", "xaxis")
    .call(bottomAxis);

  // Draw the y axis
  chartGroup.append("g").attr("id", "yaxis").call(leftAxis);

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

  // Draw the circles
  circles = chartGroup
    .selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", (d) => xLinearScale(d[xAttribute]))
    .attr("cy", (d) => yLinearScale(d[yAttribute]))
    .attr("r", radius)
    .attr("opacity", "0.5")
    .on("mouseover", tool_tip.show)
    .on("mouseout", tool_tip.hide);

  // Draw the state abbr on the circles
  circleLabels = chartGroup
    .selectAll(null)
    .data(censusData)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("x", (d) => xLinearScale(d[xAttribute]))
    .attr("y", (d) => yLinearScale(d[yAttribute]) + (radius / 2 - 1))
    .text((d) => d.abbr)
    .on("mouseover", tool_tip.show)
    .on("mouseout", tool_tip.hide);

  // Add the three x labels with on click events
  // healthcare
  var yLabel = chartGroup
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("id", "healthcare")
    .attr("y", 0 - margin.left + 30)
    .attr("x", 0 - chartHeight / 2)
    .classed("active", true)
    .text("Lacks Healthcare (%)")
    .on("click", updateYScatter);

  // Add the three x labels with on click events
  // poverty
  var xLabel1 = chartGroup
    .append("text")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 40})`)
    .attr("id", "poverty")
    .classed("active", true)
    .text("In Poverty (%)")
    .on("click", updateXScatter);

  // age
  var xLabel2 = chartGroup
    .append("text")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 60})`)
    .attr("id", "age")
    .classed("inactive", true)
    .text("Age (Median)")
    .on("click", updateXScatter);

  // income
  var xLabel3 = chartGroup
    .append("text")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 80})`)
    .attr("id", "income")
    .classed("inactive", true)
    .text("Household Income (Median)")
    .on("click", updateXScatter);
}

//
// Generic linear scale function to be used to update the scales
//
function getLinearScale(data, attribute, axRange) {
  // Calculate the extents
  var extents = d3.extent(data, (d) => d[attribute]);
  var extRange = extents[1] - extents[0];

  // Going to scale by 5%
  var scalePercent = 0.05;
  var domain = [
    extents[0] - extRange * scalePercent,
    extents[1] + extRange * scalePercent,
  ];

  // Return the linear scale
  return d3.scaleLinear().domain(domain).range(axRange);
}

//
// Update x scatter handles the x labels on click and
// displays the appropriate x axis and x positions on the
// chart
//
function updateXScatter() {
  var element = d3.select(this);

  var clickedElement = element.attr("id");

  // if they click on the same element do nothing
  if (clickedElement === xAttribute) {
    return;
  }

  console.log(xAttribute);
  console.log(clickedElement);

  d3.select(`#${xAttribute}`).classed("inactive", true);
  d3.select(`#${clickedElement}`).attr("class", "active");

  xAttribute = clickedElement;

  // Get new linear scale for attribute selected
  var xLinearScale = getLinearScale(censusData, xAttribute, [0, chartWidth]);
  var bottomAxis = d3.axisBottom(xLinearScale);

  // Replace bottom axis with new data scale
  var xaxis = chartGroup.select("#xaxis");
  xaxis.call(bottomAxis);

  // Update circles x position
  circles.attr("cx", (d) => xLinearScale(d[xAttribute]));

  // Update circle lables x position
  circleLabels.attr("x", (d) => xLinearScale(d[xAttribute]));
}

function updateYScatter() {
  var element = d3.select(this);
  console.log(element.attr("id"));
}

initApp(init);

// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 500
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(Data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(Data, d => d[chosenXAxis]) * 0.8,
    d3.max(Data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  // Conditional for X Axis.
  if (chosenXAxis === "poverty") {
    var xlabel = "Poverty: ";
  }
  else if (chosenXAxis === "income") {
    var xlabel = "Median Income: "
  }
  else {
    var xlabel = "Age: "
  }

  // Conditional for Y Axis.
  if (chosenYAxis === "healthcare") {
    var ylabel = "Lacks Healthcare: ";
  }
  else if (chosenYAxis === "smokes") {
    var ylabel = "Smokers: "
  }
  else {
    var ylabel = "Obesity: "
  }


  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .style("background", "black")
    .style("color", "white")
    .offset([120, -60])
    .html(function (d) {
      if (chosenXAxis === "age") {
        return (`${d.state}<hr>${xlabel} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
      } else if (chosenXAxis !== "poverty" && chosenXAxis !== "age") {
        return (`${d.state}<hr>${xlabel}$${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
      } else {
        return (`${d.state}<hr>${xlabel}${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}%`);
      }
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function (data, _index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv")
  .then(function (csvData) {

    // Parse/Cast as numbers
    csvData.forEach(function (data) {
      data.obesity = +data.obesity;
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.income = +data.income;
      data.smokes = +data.smokes;
      data.age = +data.age;
      console.log(data);
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(csvData, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(csvData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);


    var yLinearScale = yScale(csvData, chosenYAxis);


    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(csvData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 20)
      .attr("fill", "blue")
      .attr("opacity", ".5");

    var circletextGroup = chartGroup.selectAll()
      .data(csvData)
      .enter()
      .append("text")
      .text(d => (d.abbr))
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .style("font-size", "12px")
      .style("text-anchor", "middle")
      .style('fill', 'black');

    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty")
      .classed("active", true)
      .text("In Poverty (%)");

    var ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") 
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") 
      .classed("inactive", true)
      .text("Household Income (Median)");

    var healthcareLabel = labelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", (margin.left) * 2.5)
      .attr("y", 0 - (height - 60))
      .attr("value", "healthcare") 
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var smokeLabel = labelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", (margin.left) * 2.5)
      .attr("y", 0 - (height - 40))
      .attr("value", "smokes") 
      .classed("inactive", true)
      .text("Smokes (%)");

    var obesityLabel = labelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", (margin.left) * 2.5)
      .attr("y", 0 - (height - 20))
      .attr("value", "obesity") 
      .classed("inactive", true)
      .text("Obesity (%)");
      
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // X Axis labels event listener.
    labelsGroup.selectAll("text")
      .on("click", function () {
        // Get value of selection.
        var value = d3.select(this).attr("value");

        if (true) {
          if (value === "poverty" || value === "age" || value === "income") {

            // Replaces chosenXAxis with value.
            chosenXAxis = value;

            // console.log(chosenXAxis)

            // Update x scale for new data.
            xLinearScale = xScale(csvData, chosenXAxis);

            // Updates x axis with transition.
            xAxis = renderXAxes(xLinearScale, xAxis);

            // Changes classes to change bold text.
            if (chosenXAxis === "poverty") {
              povertyLabel
                .classed("active", true)
                .classed("inactive", false);

              ageLabel
                .classed("active", false)
                .classed("inactive", true);

              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenXAxis === "age") {
              povertyLabel
                .classed("active", false)
                .classed("inactive", true);

              ageLabel
                .classed("active", true)
                .classed("inactive", false);

              incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
              povertyLabel
                .classed("active", false)
                .classed("inactive", true);

              ageLabel
                .classed("active", false)
                .classed("inactive", true)

              incomeLabel
                .classed("active", true)
                .classed("inactive", false);
            }

          } else {

            chosenYAxis = value;

            // Update y scale for new data.
            yLinearScale = yScale(csvData, chosenYAxis);

            // Updates y axis with transition.
            yAxis = renderYAxes(yLinearScale, yAxis);

            // Changes classes to change bold text.
            if (chosenYAxis === "healthcare") {

              obesityLabel
                .classed("active", false)
                .classed("inactive", true);
              healthcareLabel
                .classed("active", true)
                .classed("inactive", false);

              smokeLabel
                .classed("active", false)
                .classed("inactive", true);


            }
            else if (chosenYAxis === "smokes") {

              obesityLabel
                .classed("active", false)
                .classed("inactive", true);

              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);

              smokeLabel
                .classed("active", true)
                .classed("inactive", false);


            }
            else {

              obesityLabel
                .classed("active", true)
                .classed("inactive", false);
              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);

              smokeLabel
                .classed("active", false)
                .classed("inactive", true);


            }

          }


          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);


          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


          circletextGroup = renderText(circletextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        }

      });

  });



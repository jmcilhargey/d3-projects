const margin =  { top: 40, right: 20, bottom: 50, left: 60 };
const width = 1200 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const color = d3.scaleOrdinal(d3.schemeCategory20);
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

const svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${ margin.left }, ${ margin.top })`);


d3.request("https://dl.dropboxusercontent.com/u/63260308/Portfolio/Data/alcohol_data.txt")
  .mimeType("application/json")
  .response(function(xhr) { return JSON.parse(xhr.responseText); })
  .get((error, data) => {

  if (error) {
    console.log(error);
  }
  data.sort((a, b) => a.calories - b.calories);

  x.domain(d3.extent(data, function(d) { return Number(d.alcohol); }));
  y.domain(d3.extent(data, function(d) { return d.calories; }));

  svg.selectAll("dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 5)
    .attr("fill", (d, i) => color(i))
    .attr("cx", (d) => x(d.alcohol))
    .attr("cy", (d) => y(d.calories))
    .on("mouseover", (d) => {
      console.log("mouseover");
      tooltip.transition()
        .duration(250)
        .style("z-index", "10")
        .style("opacity", 0.9);
      tooltip.html(`${ d.name }<br/>${ d.calories } cal/L ${ d.alcohol}% alc`)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 30) + "px");
    })
    .on("mouseout", function(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0)
        .style("z-index", "-1")
    });

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  svg.append("g")
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Calories / Liter");

  svg.append("text")
    .attr("transform", `translate(${ width / 2 }, ${ height + margin.top })`)
    .style("text-anchor", "middle")
    .text("Alcohol % by Volume");

    svg.append("text")
      .attr("transform", `translate(${ width / 2 - 100 }, ${ -20 })`)
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("fill", "#424242")
      .style("font-size", "1.5em")
      .text("Calories vs Alcohol Content in Beer");

});

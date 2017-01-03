const margin =  { top: 40, right: 20, bottom: 50, left: 60 };
const width = 1200 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const parseDate = d3.timeParse("%Y-%m-%d");
const timeFormat = d3.timeFormat("%b %d, %Y");
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

const svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${ margin.left }, ${ margin.top })`);

d3.request("https://dl.dropboxusercontent.com/u/63260308/Portfolio/Data/btc_data.txt")
  .mimeType("application/json")
  .response(function(xhr) { return JSON.parse(xhr.responseText); })
  .get((error, obj) => {

  if (error) {
    console.log(error);
  }
  const data = Object.keys(obj.bpi).map((key) => { return { date: parseDate(key), price: obj.bpi[key] }}).sort((a, b) => b.date - a.date);

  x.domain(d3.extent(data.map((d) => d.date)));
  y.domain([0, d3.max(data, (d) => d.price)]);

  svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.date))
    .attr("width", "2px")
    .attr("y", (d) => y(d.price))
    .attr("height", (d) => height - y(d.price))
    .on("mouseover", function(d) {
       tooltip.transition()
         .duration(250)
         .style("opacity", 0.9);
       tooltip.html(`${ timeFormat(d.date) }<br/>$ ${ d.price }`)
         .style("left", (d3.event.pageX - 70) + "px")
         .style("top", (d3.event.pageY - 75) + "px");
       })
     .on("mouseout", function(d) {
       tooltip.transition()
         .duration(500)
         .style("opacity", 0);
       });

    svg.append("g")
      .attr("transform", `translate(0, ${ height })`)
      .call(d3.axisBottom(x))

    svg.append("g")
      .call(d3.axisLeft(y));

    svg.append("text")
        .attr("transform", `translate(${ width / 2 }, ${ height + margin.top })`)
        .style("text-anchor", "middle")
        .text("Date");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("USD / Bitcoin");

    svg.append("text")
      .attr("transform", `translate(${ width / 2 - 100 }, ${ -20 })`)
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("fill", "#424242")
      .style("font-size", "1.5em")
      .text("Bitcoin Price Over Last Year");
});

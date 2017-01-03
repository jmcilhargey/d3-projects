const margin =  { top: 40, right: 20, bottom: 50, left: 60 };
const width = 800;
const height = 110;
const boxSize = 13;

const parseTime = d3.timeParse("%m/%d/%Y");
const formatTime = d3.timeFormat("%Y-%m-%d");
const formatDay = d3.timeFormat("%w");
const formatWeek = d3.timeFormat("%U");

const svg = d3.select("#chart")
  .data(d3.range(1892, 1924))
  .enter()
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(${ (width - boxSize * 53) / 2 }, ${ height - boxSize * 7 - 1 })`);

svg.append("text")
  .attr("transform", `translate(-6, ${ boxSize * 3.5 })rotate(-90)`)
  .style("text-anchor", "middle")
  .text((d) => d);

const rect = svg.selectAll(".day")
  .data((d) => d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)))
  .enter().append("rect")
  .attr("class", "day")
  .attr("width", boxSize)
  .attr("height", boxSize)
  .attr("x", (d) => d3.timeSunday.count(d3.timeYear(d), d) * boxSize)
  .attr("y", (d) => d.getDay() * boxSize)
  .datum(formatTime);

svg.selectAll(".month")
  .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("path")
  .attr("class", "month")
  .attr("d", monthPath);

const x = d3.scaleLinear().domain([1, 16000]).rangeRound([200, 600]);
const c = d3.scaleLinear()
  .domain([1, 10])
  .range(["#ffffF6", "#e65100"]);

const array = new Array(8).fill(null).map((e, i) => c(i));
const color = d3.scaleLinear()
  .domain([1, 15000])
  .range(["#fff8f6", "#e65100"]);

const g = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("class", "key")
  .attr("transform", "translate(0, 75)");

g.selectAll("rect")
  .data(array)
  .enter().append("rect")
    .attr("height", 10)
    .attr("x", (d, i) => 200 + 50 * i)
    .attr("width", (d, i) =>  50)
    .attr("fill", (d) => d);

g.call(d3.axisBottom(x)
  .tickSize(10)
  .tickFormat((x, i) => x)
  .tickPadding(10))
  .select(".domain")
  .remove();

g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -10)
    .attr("text-anchor", "start")
    .text("Daily Arrivals");

g.append("text")
  .attr("class", "title")
  .attr("x", width / 2)
  .attr("y", -50)
  .attr("text-anchor", "middle")
  .text("Ellis Island Immigration from 1893 - 1923");

d3.request("https://dl.dropboxusercontent.com/u/63260308/Portfolio/Data/imm_data.txt")
  .mimeType("application/json")
  .response(function(xhr) { return JSON.parse(xhr.responseText); })
  .get((error, data) => {
  if (error) {
    console.log(error);
  }

  data.forEach((d) => d.date = new Date(d.date));

  const nested = d3.nest()
    .key((d) => formatTime(d.date))
    .rollup((d) => d[0].people)
    .map(data);

  rect.style("fill", (d) => nested[`$${ d }`] ? color(nested[`$${ d }`]) : "#fff");

});

function monthPath(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = t0.getDay(), w0 = d3.timeSunday.count(d3.timeYear(t0), t0),
      d1 = t1.getDay(), w1 = d3.timeSunday.count(d3.timeYear(t1), t1);
  return "M" + (w0 + 1) * boxSize + "," + d0 * boxSize
      + "H" + w0 * boxSize + "V" + 7 * boxSize
      + "H" + w1 * boxSize + "V" + (d1 + 1) * boxSize
      + "H" + (w1 + 1) * boxSize + "V" + 0
      + "H" + (w0 + 1) * boxSize + "Z";
}

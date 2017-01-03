
const width = 1000;
const height = 600;
const svg = d3.select("body").append("svg")
  .attr("height", height)
  .attr("width", width);

const color = d3.scaleOrdinal(d3.schemeCategory20);
const div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

const simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function(d) { return d.id; }))
  .force("charge", d3.forceManyBody().strength(-200))
  .force("center", d3.forceCenter(width / 2, height / 2));

svg.append("text")
  .attr("transform", `translate(${ width / 2 - 225 }, ${ 25 })`)
  .attr("dy", ".35em")
  .attr("text-anchor", "start")
  .style("fill", "#424242")
  .style("font-size", "1.5em")
  .text("Force Directed Graph of Harry Potter Characters");

d3.json("https://dl.dropboxusercontent.com/u/63260308/Portfolio/Data/harry_data.txt", function(error, graph) {

  if (error) {
    console.log(error);
  }

  const link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("stroke-width", 1);

  const node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("r", 8)
    .attr("fill", (d) => color(d.group))
    .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended))
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

  node.append("title")
    .text((d) => d.id);

  simulation
    .nodes(graph.nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(graph.links);

  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);
  }
});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

function mouseover(d) {
  div.transition()
    .duration(250)
    .style("z-index", "10")
    .style("opacity", 0.8);

  div.html(d.id)
    .style("left", `${ d3.event.pageX + 5 }px`)
    .style("top", `${ d3.event.pageY - 10 }px`);
}

function mouseout(d) {
div.transition()
  .duration(500)
  .style("opacity", 0)
  .style("z-index", "-1")
}

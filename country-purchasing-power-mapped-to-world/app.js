const width = 1000;
const height = 600;
const projection = d3.geoMercator();

const canvas = d3.select("body")
  .append("canvas")
  .attr("class", "canvas")
  .attr("width", width)
  .attr("height", height);

const overlay = d3.select("body")
  .append("svg")
  .attr("class", "overlay")
  .attr("width", width)
  .attr("height", height);

const context = canvas.node().getContext("2d");
const path = d3.geoPath()
  .projection(projection)
  .context(context);
const div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.json("https://dl.dropboxusercontent.com/u/63260308/Portfolio/Data/world_data_2.json", (error, world) => {
  if (error) {
    console.log(error);
  }

  path(topojson.feature(world, world.objects.countries));
  context.globalAlpha = 0.6;
  context.lineWidth = 1;
  context.lineJoin = "round";
  context.stroke();
  path(topojson.feature(world, world.objects.land));
  context.fillStyle = "#bfc0c0";
  context.fill();

  const points = d3.select("canvas").append("div");
  const radius = d3.scaleLinear().domain([0, 135]).range([0, 25]);

  function createPoints(worldData) {
    d3.json("https://dl.dropboxusercontent.com/u/63260308/Portfolio/Data/purchase_power_data.json", function(error, purchaseData) {

      if (error) {
        console.log(error);
      }

      points.selectAll("points.arc")
        .data(worldData)
        .enter()
        .append("points")
        .classed("arc", true)
        .attr("x", (d) => path.centroid(d)[0])
        .attr("y", (d) => path.centroid(d)[1])
        .attr("radius", (d) => radius(purchaseData[d.id] ? purchaseData[d.id].rating : 0))
        .attr("fillStyle", "#00e676");

      drawPoints(points);

      overlay.selectAll("dot")
        .data(worldData)
        .enter()
        .append("circle")
        .attr("r", (d) => purchaseData[d.id] ? radius(purchaseData[d.id].rating) : 0)
        .attr("cx", (d) => path.centroid(d)[0])
        .attr("cy", (d) => path.centroid(d)[1])
        .attr("fill", "transparent")
        .on("mouseover", function(d) {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div	.html(`${ purchaseData[d.id].name }<br/>${ purchaseData[d.id].rating }`)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
            })
        .on("mouseout", function(d) {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });
    });

    function drawPoints(points) {

      const elements = d3.selectAll("points.arc");

      elements.each(function(d) {
        const node = d3.select(this);

        context.beginPath();
        context.arc(node.attr("x"), node.attr("y"), node.attr("radius"), 0, 2 * Math.PI);
        context.fillStyle = node.attr("fillStyle");
        context.fill();
        context.font = "12px arial";
        context.fillStyle = "#000";
        context.stroke();
        context.closePath();
      });
    }
  }
  createPoints(topojson.feature(world, world.objects.countries).features);
});

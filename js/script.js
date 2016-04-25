// Basic chart constants
var margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 700 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

var color = d3.scale.category20();

// Select and initialize the size of the chart
var svg = d3.select('#chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Create a sanky diagram with these properties
var sankey = d3.sankey()
  .nodeWidth(36)
  .nodePadding(40)
  .size([width, height]);
  
var path = sankey.link();

// Load csv file, and use it inside the function
d3.csv('data/gender.csv', function(error, data) {
  // initialize the graph object
  graph  = {'nodes': [], 'links': []};
  console.log(data);  
  // Add all the data to graph
  data.forEach(function(d) {
    graph.nodes.push({ 'name': d.source });
    graph.nodes.push({ 'name': d.target });
    graph.links.push({ 'source': d.source, 'target': d.target, 'value': d.value });
  });
  // remove duplicate nodes
  graph.nodes = d3.keys(d3.nest()
    .key(function(d) {return d.name; })
    .map(graph.nodes));
  console.log(graph);
  // Switch links source/target from data to index in the nodes
  graph.links.forEach(function(d, i) {
    graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
    graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
  });
  
  // now loop through each nodes to make nodes an array of objects
  // rather than an array of strings
  graph.nodes.forEach(function (d, i) {
    graph.nodes[i] = { "name": d };
  });
  
  sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(32);
  
  // add links to the chart
  var link = svg.append('g').selectAll('.link')
      .data(graph.links)
    .enter().append('path')
      .attr('class', 'link')
      .attr('d', path)
      .style('stroke-width', function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) {return b.dy - a.dy });
      
  // TODO: add the link title
  
  // Add nodes to the chart
  var node = svg.append('g').selectAll('.node')
      .data(graph.nodes)
    .enter().append('g')
      .attr('class', 'node')
      .attr('transform', function(d){
        return 'translate(' + d.x + ',' + d.y + ')';
      });
  
  // Add rectangles to the nodes
  node.append('rect')
      .attr('height', function(d) { console.log(d); return d.dy; })
      .attr('width', sankey.nodeWidth())
      .style('fill', function(d) {return d.color = color(d.name.replace(/ .*/, "")); })
      .style('stroke', function(d) {return d3.rgb(d.color).darker(2); })
    .append('title')
      .text(function(d) {
        return d.name + '\n' + d3.format(',.0f')(d.value);
      });

});
// Global constants
var LOWER_BOUND  = 10, // what is the minimum 'value' for a link to be displayed
    NODE_WIDTH   = 40,
    NODE_PADDING = 40;

// Basic chart constants
var margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 700 - margin.left - margin.right,
  height = 900 - margin.top - margin.bottom;

var color = d3.scale.category20();

// Select and initialize the size of the chart
var svg = d3.select('#canvas')
  .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Create a sanky diagram with these properties
var sankey = d3.sankey()
  .nodeWidth(NODE_WIDTH)
  .nodePadding(NODE_PADDING)
  .size([width, height]);

var path = sankey.link();

var updateChart = function dataUpdate(filter) {
  console.log('update', filter);
}

// Load JSON file, and use it inside the function
d3.json('../source/data.json', function(error, data) {
  if (error) return console.warn(error);

  // testing constants
  // see source/meta.json for all possible values
  var filters = {
    states : ['NY', 'AL', 'WY'],
    party : 'D',
    question_id : 'income16',
    exclude_answers : []
  };
  
  var question = data[filters.party][filters.question_id]['question'];
  console.log('Answering the question: ' + question + ' for ' + party + ' in ', states);

  var answers = generateAnswers(data, filters);
  var graph = generateGraph(answers);

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
      .attr('height', function(d) { return d.dy; })
      .attr('width', sankey.nodeWidth())
      .style('fill', function(d) {return d.color = color(d.name.replace(/ .*/, '')); })
      .style('stroke', function(d) {return d3.rgb(d.color).darker(2); })
    .append('title')
      .text(function(d) {
        return d.name + '\n' + d3.format(',.0f')(d.value);
      });

  // add in the title for the nodes
    node.append('text')
      .attr('x', -6)
      .attr('y', function(d) { return d.dy / 2; })
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .attr('transform', null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr('x', 6 + sankey.nodeWidth())
      .attr('text-anchor', 'start');
});
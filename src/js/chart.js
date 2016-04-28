import d3 from 'd3'
import { Sankey } from './sankey';

// Global constants
var NODE_WIDTH   = 40,
    NODE_PADDING = 40,
    ITERATIONS   = 32;

// Basic chart constants
var margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 700 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// set color scale
var color = d3.scale.category20();

// Select and initialize the size of the chart
var svg = d3.select('#canvas').append('svg')
  .attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
  })
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// create groups for links and nodes
var linksGroup = svg.append('g').attr('class', 'links');
var nodesGroup = svg.append('g').attr('class', 'nodes');

// Create a sanky diagram with these properties
var sankey = Sankey()
  .nodeWidth(NODE_WIDTH)
  .nodePadding(NODE_PADDING)
  .size([width, height]);

// Get path data generator
var path = sankey.link();

// draw chart
export function draw(graph) {
  sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(ITERATIONS);
    
  // Draw the links
  var links = linksGroup.selectAll('.link').data(graph.links);
  // Enter
  links.enter()
    .append('path')
    .attr('class', 'link');
  // Enter + Update
  links.attr('d', path)
    .style('stroke-width', function (d) {
      return Math.max(1, d.dy);
    });
  links.append('title')
    .text(function (d) {
      return d.source.name + ' to ' + d.target.name + ' = ' + d.value;
    });
  // Exit
  links.exit().remove();
  
  // Draw the nodes
  var nodes = nodesGroup.selectAll('.node').data(graph.nodes);
  // Enter
  var nodesEnterSelection = nodes.enter()
    .append('g')
    .attr('class', 'node');
  nodesEnterSelection.append('rect')
    .attr('width', sankey.nodeWidth())
    .append('title');
  nodesEnterSelection.append('text')
    .attr('x', sankey.nodeWidth() / 2)
    .attr('dy', '.35em')
    .attr('text-anchor', 'middle')
    .attr('transform', null);

  // Enter + Update
  nodes
    .attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
  nodes.select('rect')
    .attr('height', function (d) {
      return d.dy;
    })
    .style('fill', function (d) {
      return d.color = color(d.name.replace(/ .*/, ''));
    })
    .style('stroke', function (d) {
      return d3.rgb(d.color).darker(2);
    });
  nodes.select('rect').select('title')
    .text(function (d) {
      return d.name;
    });
  nodes.select('text')
    .attr('y', function (d) {
      return d.dy / 2;
    })
    .text(function (d) {
      return d.name;
    });
  // Exit
  nodes.exit().remove();
};
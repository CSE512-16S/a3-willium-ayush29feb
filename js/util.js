var LOWER_BOUND = 10;

// Rolls up duplicate values for source/target pairs
var rollup = function rollup(data) {
  var output = [];

  data.forEach(function(row) {
    existing = output.filter(function(d) {
      return (d.source === row.source) && (d.target === row.target);
    });
    
    if (existing.length) {
      var index = output.indexOf(existing[0]);
      var currentValue = output[index].value;
      output[index].value = parseInt(currentValue + row.value, 10);
    } else {
      output.push(row);
    }
  });

  return output;
}

/* Pre: Takes in the complete data.json file.
 * filters : { states, party, question_id, exclude_targets }
 * Post: Returns answers : {}  
 * TODO: define the answers obejct, currently using from the data json
 */
var generateAnswers = function(data, filters) {
  // Get all the answers/links and filter the states
  var answers = data[filters.party][filters.question_id]['answers']
    .filter(function(d) {
      return filters.states.indexOf(d.state) != -1;
    });
  
  answers = rollup(answers); // rollup the duplicates
  return answers;
}

/* Pre: Takes in a filtered answers object {} TODO: define the answers obejct
 * Post: Returns a complete graph : { nodes: {}, links: {} }
 */
var generateGraph = function(answers) {
  var graph = { 'nodes' : [], 'links' : [] },
      zeros = [];
  
  answers.forEach(function(d) {
    if(d.value < LOWER_BOUND) {
      zeros.push({ 'name' : d.source });
    } else {
      graph.nodes.push({ 'name' : d.source });
      graph.nodes.push({ 'name' : d.target });
      graph.links.push({
        'source' : d.source,
        'target' : d.target,
        'value' : d.value
      });
    }
  });
  
  // TODO: Explain in comment.
  var nulls = []
  zeros.forEach(function(zr) {
    existing = graph.nodes.filter(function(d){
      return d.name === zr.name
    });
    if (!existing.length && nulls.indexOf(zr.name) == -1) {
      nulls.push(zr.name)
    }
  });
  
  // Remove duplicates
  graph.nodes = d3.keys(d3.nest()
    .key(function(d) {return d.name; })
    .map(graph.nodes));

  // Switch links source/target from data to index in the nodes
  graph.links.forEach(function(d, i) {
    graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
    graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
  });
  
  // now loop through each nodes to make nodes an array of objects
  // rather than an array of strings
  graph.nodes.forEach(function (d, i) {
    graph.nodes[i] = { 'name': d };
  });
  
  return graph;
}
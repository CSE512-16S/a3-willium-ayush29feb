import d3 from 'd3';
import _ from 'lodash';

// Function takes n arguments and returns the first one (in-order) that isn't undefined.
// if all arguments are undefined, returns null
export function which() {
  for (var i=0; i < arguments.length; i++) {
    try {
      if (typeof arguments[i] != 'undefined') {
        return arguments[i];
      }
    } catch(e) {
      // trying to access property of undefined, most likely
    }
  }
  
  return null;
}

export function appendPercent(graph) {
  _.forEach(graph.nodes, function(d) {
    let totalValue = 0;
    const peerNodes = _.filter(graph.nodes, function(o) {
      return _.isEqual(o.type, d.type);
    });
    _.forEach(peerNodes, function(d) {
      totalValue += d.value;
    })
    d.percent = Math.round(d.value / totalValue * 100);
  });
  
  _.forEach(graph.links, function(d) {
    let sourceValue = 0;
    let targetValue = 0;
    const sourceNodes = _.filter(graph.nodes, function(o) {
      return _.isEqual(o.meta.source_rank, d.meta.source_rank);
    });
    const targetNodes = _.filter(graph.nodes, function(o) {
      return _.isEqual(o.meta.target_id, d.meta.target_id);
    });
    
    _.forEach(sourceNodes, function(o) {
      sourceValue += o.value;
    });
    _.forEach(targetNodes, function(o) {
      targetValue += o.value;
    });
    d.sourcePercent = Math.round(d.value / sourceValue * 100);
    d.targetPercent = Math.round(d.value / targetValue * 100);
  });
}

// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function() {  
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {  
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    });
};
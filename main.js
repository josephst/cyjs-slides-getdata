let _ = require('lodash');
let fs = require('fs');

let NODECOUNT = 25;
let DAYSTOFILL = 30;
let EDGEFACTOR = 3;

/**
 * Returns an array of nodes in Cytoscape.js format.
 * The nodes will have an id, an array of counts corresponding to simulated social media posts,
 * and a randomly selected number between 1 and (count / 2) to use when making edges from the node.
 * 
 * @param {Number} count The number of nodes to generate
 * @return {Array} An array of objects to be added to Cytoscape.js
 */
function generateNodes(count) {
  let growthStrategies = {
    /**
     * Return an array of increasing integers from 1 to DAYSTOFILL + 1 with some random growth factor
     * 
     * @return {Array} Increasing array
     */
    genGrowingArr: function() {
      let randomFactor = _.random(1, 3);
      return _.range(1, DAYSTOFILL + 1).map(val => val * randomFactor);
    },

    /**
     * Return an array of decreasing integers from 1 to DAYSTOFILL + 1 with some random growth factor
     * 
     * @return {Array} Decreasing array
     */
    genDiminishingArr: function() {
      let randomFactor = _.random(1, 3);
      return _.range(DAYSTOFILL, 0, -1).map(val => val * randomFactor);
    },

    /**
     * Return an array of oscillating integers.
     * This is done by calling Math.sin on pi/2, pi, 3pi/2, 2pi so that values go from 1, 0, -1, 0.
     * The result is then multiplied by a predetermined random number between 1 and 3 and added to the basis,
     * so that all numbers are between (basis +- randomFactor).
     * 
     * @return {Array} Oscillating array
     */
    genOscillatingArr: function() {
      let result = [];
      let basis = _.random(10, 20);
      let randomFactor = _.random(1, 3);
      for (let i = 0; i < DAYSTOFILL; i++) {
        result.push(Math.round(Math.sin(Math.PI * i / 2) * randomFactor + basis));
      }
      return result;
    }
  }

  /**
   * Choose a random growth strategy from the growthStrategies object
   * 
   * @return {Function} A randomly selected function which will generate an array when called
   */
  let randomGrowthStrategy = function() {
    let strategies = _.keys(growthStrategies);
    return growthStrategies[strategies[_.random(strategies.length - 1)]]
  }
  let nodes = [];
  _.range(0, count).forEach(val => {
    let strategy = randomGrowthStrategy();
    let postsArr = strategy();
    nodes.push({
      data: {
        id: val,
        postsByDay: postsArr,
        totalPosts: postsArr.reduce((prev, cur) => prev + cur),
        peopleFollowedCount: _.random(1, Math.floor(count/2))
      }
    });
  })
  return nodes;
}

/**
 * Returns an array of edges generated from an array of nodes.
 * Each node's peopleFollowedCount is used to determine how many edges to add from the node.
 * No node will have two edges to the same target node.
 * No node will have any edge to itself.
 * 
 * @param {Array} nodes The array of nodes which will be used to get ids for the source and targets of edges.
 * @return {Array} Edges (in Cytoscape.js JSON format) with an id, source, and target.
 */
function generateEdges(nodes) {
  let edgeId = 0;
  let edges = [];

  /** Simple generator for Cytoscape.js-formatted JSON objects
   * 
   * @param {Number} id The ID of the edge
   * @param {Number} source The ID of the source node
   * @param {Number} target The ID of the target of the edge
   * @return {Object} An object with a data property, containing the passed id, source, and target properties
   */
  let generateEdge = function(id, source, target) {
    return {
      data: {
        id: id,
        source: source,
        target: target
      }
    };
  }

  nodes.forEach(node => {
    let edgesToMake = node.data.peopleFollowedCount;
    let possibleTargets = _.filter(nodes, target => {
      return target.data.id != node.data.id; 
    });
    let currentNodeEdges = [];
    for (let i = 0; i < node.data.peopleFollowedCount; i++) {
      let target = possibleTargets[_.random(possibleTargets.length - 1)];
      currentNodeEdges.push(generateEdge(edgeId++, node.data.id, target.data.id));
      // then remove this node from further consideration (don't want 2 edges from this node to target)
      _.remove(possibleTargets, possibleTarget => {
        possibleTarget.data.id == target.data.id
      });
    }
    edges = edges.concat(currentNodeEdges);
  });
  return edges;
}

/**
 * Create an array of data that can be used for Cytoscape.js JSON elements
 * 
 * @param {Number} count Number of nodes to generate
 * @return {Array} An array of elements, both nodes and edges, which can be added to a Cytoscape.js graph
 */
function generateData(count) {
  let nodes = generateNodes(count);
  let edges = generateEdges(nodes);
  console.log('done');
  return {
    elements: _.concat(nodes, edges)
  }
}

fs.writeFile('output.json', JSON.stringify(generateData(NODECOUNT), null, 2));
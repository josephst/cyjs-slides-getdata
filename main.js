let _ = require('lodash');
let fs = require('fs');

let NODECOUNT = 25;
let DAYSTOFILL = 30;
let EDGEFACTOR = 3;

function generateNodes(count) {
  let growthStrategies = {
    genGrowingArr: function() {
      let randomFactor = _.random(1, 3);
      return _.range(1, DAYSTOFILL + 1).map(val => val * randomFactor);
    },
    genDiminishingArr: function() {
      let randomFactor = _.random(1, 3);
      return _.range(DAYSTOFILL, 0, -1).map(val => val * randomFactor);
    },
    genConstantArr: function() {
      return _.fill(Array(DAYSTOFILL), _.random(10, 20));
    }
  }
  let randomGrowthStrategy = function() {
    let strategies = _.keys(growthStrategies);
    return growthStrategies[strategies[_.random(strategies.length - 1)]]
  }
  let nodes = [];
  _.range(0, count).forEach(val => {
    let strategy = randomGrowthStrategy();
    nodes.push({
      data: {
        id: val,
        postsByDay: strategy(),
        peopleFollowedCount: _.random(1, Math.floor(count/2))
      }
    });
  })
  return nodes;
}

function generateEdges(nodes) {
  let edgeId = 0;
  let edges = [];
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

function generateData(count) {
  let nodes = generateNodes(count);
  let edges = generateEdges(nodes);
  console.log('done');
  return {
    elements: _.concat(nodes, edges)
  }
}

fs.writeFile('output.json', JSON.stringify(generateData(NODECOUNT), null, 2));
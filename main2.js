let _ = require('lodash');

let NODECOUNT = 25;
let DAYSTOFILL = 30;

function generateNodes(count) {
  let growthStrategies = {
    genGrowingArr: function() {
      let randomFactor = _.random(3);
      return _.range(1, DAYSTOFILL + 1).map(val => val * randomFactor);
    },
    genDiminishingArr: function() {
      let randomFactor = _.random(3);
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
        postsByDay: strategy()
      }
    });
  })
  return nodes;
}

function generateEdges(nodes) {
  return [];
}

function generateData(count) {
  let nodes = generateNodes(count);
  let edges = generateEdges(nodes);
  return {
    elements: _.concat(nodes, edges)
  }
}

console.log(generateData(30));
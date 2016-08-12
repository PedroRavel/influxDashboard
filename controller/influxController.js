//influx package for node
var influx = require('influx');

//variables to index into array returned from querying influx database
const indexIntoQueryArray = 0;
const indexIntoSeriesOfQueryArray = 0;
const indexForDateInQuery = 0;
const indexForLengthOfValueArray = 0;
const indexForValueInQueryArray = 1;

//client variable to initialize influx client
var client;
//array to store sets of metrics and variables to index into the 3 different metric types
var list = []
var indexForGraph = 0;
var indexForStat = 1;
var indexForLargeGraph = 2;
//creating separate to store individual metrics
list[indexForGraph]      = []
list[indexForStat]       = []
list[indexForLargeGraph] = []
var indexOfList = 0;

//stucture to store influx data and pass to front end in format it can interprit 

function Metric(){
  this.metric;
  this.date = [];
  this.values = [];
  this.title = [];
  this.statNumber;
  this.graphType = "line";
  this.statOrPie = "stat";
  this.preStat;
  this.postStat;
  this.min;
  this.max;
  this.query;
};

//function to set the single stat to a specific value

function setStat(choice,listIndex,metricIndex){
  switch(choice) {
    case "latest":
      list[listIndex][metricIndex].statNumber = list[listIndex][metricIndex].values[list[listIndex][metricIndex].values.length - 1];
      break;
    case "max":
      list[listIndex][metricIndex].statNumber = Math.max(...list[listIndex][metricIndex].values);
      break;
    case "min":
      list[listIndex][metricIndex].statNumber = Math.min(...list[listIndex][metricIndex].values);
      break;
    case "sum":
      list[listIndex][metricIndex].statNumber = list[listIndex][metricIndex].values.reduce(function(a, b) {return a + b;}, 0);
      break;
    case "average":
      list[listIndex][metricIndex].statNumber = list[listIndex][metricIndex].values.reduce(function(a, b) {return a + b;}, 0)/list[listIndex][metricIndex].values.length;
      break;
  }
}

//sets the client host and database based on form

exports.setClient = function(req,res){
  client = influx({
   host : req.body.host,
   username : req.body.username,
   password : req.body.password,
   database : req.body.database
  })
  res.json(client)
}

//appends metric to list 
exports.appendMetricToList = function(req,res){
  var metric = new Metric()
  list[req.body.index].push(metric)
  res.json(list)
}

//sets single stat to stat, pie or doughnut
exports.setStatVisual = function(req,res){
  list[req.body.listIndex][req.body.metricIndex].statOrPie = req.body.visual;
  res.json(list)
}

//sets stat number to desired value
exports.setStatNumber = function(req,res){
  setStat(req.body.choice,req.body.listIndex,req.body.metricIndex)
  res.json(list);
}

//sets name that appears above metric
exports.setName = function(req,res){
  list[req.body.listIndex][req.body.metricIndex].metric = req.body.name;
  res.json(list); 
}

//set a prename to appear to the left of the single stat
exports.setPreName = function(req,res){
  list[req.body.listIndex][req.body.metricIndex].preStat = req.body.preName;
  res.json(list); 
}

//set post name to appear to the right of single stat
exports.setPostName = function(req,res){
  list[req.body.listIndex][req.body.metricIndex].postStat = req.body.postName;
  res.json(list); 
}

//set the graph type of the metric
exports.setGraph = function(req,res){
  list[req.body.listIndex][req.body.metricIndex].graphType = req.body.graphType;
  res.json(list); 
}

//sets the minimum threshold for a single stat
exports.setMin = function(req,res){
  list[req.body.listIndex][req.body.metricIndex].min = req.body.min;
  res.json(list); 
}

//set the maximum threshold for a single stat
exports.setMax = function(req,res){
  list[req.body.listIndex][req.body.metricIndex].max = req.body.max;
  res.json(list); 
}

//returns specific metric based on index
exports.getMetric = function(req,res){
  res.json(list[req.body.listIndex][req.body.metricIndex])
}

//returns entire metric list
exports.getMetricList = function(req,res){
  res.json(list);
}

//queries influx database and parses data into seperate arrays and values the front end can interprit
exports.processMetrics = function(req,res){
  client.queryRaw(req.body.query, function(err, measurements){

    if(err){
      res.send({error:"error"});
    } else {
      list[req.body.listIndex][req.body.metricIndex].query = req.body.query;
      list[req.body.listIndex][req.body.metricIndex].date.length = 0;
      list[req.body.listIndex][req.body.metricIndex].values.length = 0;
      list[req.body.listIndex][req.body.metricIndex].title.length = 0;

      if(req.body.typeOfMetric === "stat"){
        for(var i = 0; i < measurements[indexIntoQueryArray].series[indexIntoSeriesOfQueryArray].values.length; i ++){
          list[req.body.listIndex][req.body.metricIndex].date.push(measurements[indexIntoQueryArray].series[indexIntoSeriesOfQueryArray].values[i][indexForDateInQuery])
          list[req.body.listIndex][req.body.metricIndex].values.push(measurements[indexIntoQueryArray].series[indexIntoSeriesOfQueryArray].values[i][indexForValueInQueryArray])
          if(measurements[indexIntoQueryArray].series[indexIntoSeriesOfQueryArray].tags){
            list[req.body.listIndex][req.body.metricIndex].title.push(measurements[indexIntoQueryArray].series[indexIntoSeriesOfQueryArray].tags.title)
          }
        }
        list[req.body.listIndex][req.body.metricIndex].statNumber = list[req.body.listIndex][req.body.metricIndex].values[list[req.body.listIndex][req.body.metricIndex].values.length - 1];
      }
      else { 
        var indexForValues = 0;
        for(var i = 0; i < measurements[indexIntoQueryArray].series.length; i++){
          if(measurements[indexIntoQueryArray].series[i].tags && measurements[indexIntoQueryArray].series[i].columns.length <= 2){
            list[req.body.listIndex][req.body.metricIndex].title.push(measurements[indexIntoQueryArray].series[i].tags.title)
          } else {
              for(var l = 1; l < measurements[indexIntoQueryArray].series[i].columns.length; l++){
                list[req.body.listIndex][req.body.metricIndex].title.push(measurements[indexIntoQueryArray].series[i].columns[l]);
              }
          }
          for(var j = 0; j < measurements[indexIntoQueryArray].series[i].values[indexForLengthOfValueArray].length; j++){
            list[req.body.listIndex][req.body.metricIndex].values[indexForValues] = [];
            for(var k = 0; k < measurements[indexIntoQueryArray].series[i].values.length; k++){
              if(j === 0){
                if(i === 0){
                  list[req.body.listIndex][req.body.metricIndex].date.push(measurements[indexIntoQueryArray].series[i].values[k][indexForDateInQuery]);
                }
              } else {
                list[req.body.listIndex][req.body.metricIndex].values[indexForValues].push(measurements[indexIntoQueryArray].series[i].values[k][j]);
              }              
            }
            if(j != 0){
              indexForValues++;
            }
          }
        }
      }
      res.json(list);
    }
  })
}


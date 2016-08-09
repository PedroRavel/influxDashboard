//influx package for node
var influx = require('influx');

//variables to index into array return from querying influx database
const indexIntoQueryArray = 0;
const indexIntoSeriesOfQueryArray = 0;
const indexForDateInQuery = 0;
const indexForLengthOfValueArray = 0;
const indexForValueInQueryArray = 1;
const amountOfMetrics = 9;

var client = influx({
  host : 'influx-qa-read.kdc.capitalone.com',
  username : 'infreader',
  password : 't1m3r34d',
  database : 'splunk'
});    

var list = []
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
  
exports.appendMetricToList = function(req,res){
  var metricList = []
  for(var i = 0; i < amountOfMetrics; i++){
    metricList.push(new Metric())
  }
  list[indexOfList++] = metricList;
  res.json(list);
}

exports.setStatVisual = function(req,res){
  list[req.body.listIndex][req.body.metricIndex].statOrPie = req.body.visual;
  res.json(list)
}

exports.setStatNumber = function(req,res){
  setStat(req.body.choice,req.body.listIndex,req.body.metricIndex)
  res.json(list);
}

exports.setName = function(req,res){
  list[req.body.listIndex][req.body.metricIndex].metric = req.body.name;
  res.json(list); 
}

exports.setPreName = function(req,res){
  list[req.body.listIndex][req.body.metricIndex].preStat = req.body.preName;
  res.json(list); 
}

exports.setPostName = function(req,res){
  list[req.body.listIndex][req.body.metricIndex].postStat = req.body.postName;
  res.json(list); 
}

exports.setGraph = function(req,res){
  list[req.body.listIndex][req.body.metricIndex].graphType = req.body.graphType;
  res.json(list); 
}

exports.setMin = function(req,res){
  list[req.body.listIndex][req.body.metricIndex].min = req.body.min;
  res.json(list); 
}

exports.setMax = function(req,res){
  list[req.body.listIndex][req.body.metricIndex].max = req.body.max;
  res.json(list); 
}

exports.getMetric = function(req,res){
  res.json(list[req.body.listIndex][req.body.metricIndex])
}

exports.getMetricList = function(req,res){
  res.json(list);
}

exports.processMetrics = function(req,res){

 client.queryRaw(req.body.query, function(err, measurements){

    if(err){
      res.send({error:"error"});
    } else {
      var metric = new Metric();
      metric.query = req.body.query;
      if(req.body.typeOfMetric === "stat"){
        for(var i = 0; i < measurements[indexIntoQueryArray].series[indexIntoSeriesOfQueryArray].values.length; i ++){
          metric.date.push(measurements[indexIntoQueryArray].series[indexIntoSeriesOfQueryArray].values[i][indexForDateInQuery])
          metric.values.push(measurements[indexIntoQueryArray].series[indexIntoSeriesOfQueryArray].values[i][indexForValueInQueryArray])
          if(measurements[indexIntoQueryArray].series[indexIntoSeriesOfQueryArray].tags){
            metric.title.push(measurements[indexIntoQueryArray].series[indexIntoSeriesOfQueryArray].tags.title)
          }
        }
        metric.statNumber = metric.values[metric.values.length - 1];
      }
      else { 
        var indexForValues = 0;
        for(var i = 0; i < measurements[indexIntoQueryArray].series.length; i++){
          if(measurements[indexIntoQueryArray].series[i].tags && measurements[indexIntoQueryArray].series[i].columns.length <= 2){
            metric.title.push(measurements[indexIntoQueryArray].series[i].tags.title)
          } else {
              for(var l = 1; l < measurements[indexIntoQueryArray].series[i].columns.length; l++){
                metric.title.push(measurements[indexIntoQueryArray].series[i].columns[l]);
              }
          }
          for(var j = 0; j < measurements[indexIntoQueryArray].series[i].values[indexForLengthOfValueArray].length; j++){
            metric.values[indexForValues] = [];
            for(var k = 0; k < measurements[indexIntoQueryArray].series[i].values.length; k++){
              if(j === 0){
                if(i === 0){
                  metric.date.push(measurements[indexIntoQueryArray].series[i].values[k][indexForDateInQuery]);
                }
              } else {
                metric.values[indexForValues].push(measurements[0].series[i].values[k][j]);
              }              
            }
            if(j != 0){
              indexForValues++;
            }
          }
        }
      }
      list[req.body.listIndex][req.body.metricIndex] = metric
      res.json(list);
    }
  })
}


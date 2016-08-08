//influx package for node
var influx = require('influx');

//variables to index into array return from querying influx database
const indexIntoQueryArray = 0;
const indexIntoSeriesOfQueryArray = 0;
const indexForDateInQuery = 0;
const indexForMaxNumberInQueryArray = 1;
const indexForMaxValueInQueryArray = 2;
const indexForMinNumberInQueryArray = 3;
const indexForMinValueInQueryArray = 4;
const indexForNumberInQueryArray = 5;
const indexForValuesInQueryArray = 6;
const beginningIndexForTime = 11;
const endingIndexForTime = 19;
const notAvailable = "-1";
const amountOfMetrics = 9;

var client = influx({
  host : 'influx-qa-read.kdc.capitalone.com',
  username : 'infreader',
  password : 't1m3r34d',
  database : 'splunk'
});    
var list = []
var indexOfList = 0;

// var client = influx({
//    host : 'localhost',
//    username : '',
//    password : '',
//    database : 'metric_Metrics'
    
// })
//stucture to store influx data and pass to front end in format it can interprit 
//SINGLE STAT!!!
//select max(licQtGB) * 1024 as LicAllocated from EntLicInfo where title = 'All Pools' and time > now() - 476h group by time(24h), title 
//select licUsdMB from EntLicInfo WHERE time > now() - 50m
//select max(licUsdMB) from EntLicInfo where title != 'All Pools' and time > now() - 476h group by time(24h), title
//select max(licUsdMB), max(licQtGB) * 1024 as LicAllocated from EntLicInfo where title =~ /All*/ and time > now() - 476h group by time(24h), title

function Metric(){
  this.metric;
  this.date = [];
  this.values = [];
  this.number = [];
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
        list[listIndex][metricIndex].statNumber = list[listIndex][metricIndex].number[list[listIndex][metricIndex].number.length - 1];
        break;
      case "max":
        list[listIndex][metricIndex].statNumber = Math.max(...list[listIndex][metricIndex].number);
        break;
      case "min":
        list[listIndex][metricIndex].statNumber = Math.min(...list[listIndex][metricIndex].number);
        break;
      case "sum":
        list[listIndex][metricIndex].statNumber = list[listIndex][metricIndex].number.reduce(function(a, b) {return a + b;}, 0);
        break;
      case "average":
        list[listIndex][metricIndex].statNumber = list[listIndex][metricIndex].number.reduce(function(a, b) {return a + b;}, 0)/list[listIndex][metricIndex].number.length;
        break;

    }
}


// client.getMeasurements(function(err,arrayMeasurements){ 
//   console.log(JSON.stringify(arrayMeasurements))
// } )
  
exports.appendMetricToList = function(req,res){
  var metricList = []
  
  for(var i = 0; i < amountOfMetrics; i++){
    metricList.push(new Metric())
  }
  
  list[indexOfList] = metricList;
  indexOfList++;
  res.json(list);
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
  res.json(list[req.params.index])
}

exports.getMetricList = function(req,res){
  res.json(list);
}

exports.processMetrics = function(req,res){

 client.queryRaw(req.body.query, function(err, measurements){
    console.log(JSON.stringify(measurements));
    if(err){
      res.send({error:"error"});
    }else {
      var metric = new Metric();
      metric.query = req.body.query;
      if(req.body.typeOfMetric === "stat"){
        for(var i = 0; i < measurements[0].series[0].values.length; i ++){
          metric.date.push(measurements[0].series[0].values[i][0])
          metric.number.push(measurements[0].series[0].values[i][1])
        }
        metric.statNumber = metric.number[metric.number.length - 1];
      }
      else{ 

        if(measurements[0].series.length === 1){
        var j = 0;
        var i = 0;
        for(i = 0; i < measurements[0].series[0].values[0].length; i ++){
          metric.values[i] = []
          for(j = 0 ; j < measurements[0].series[0].values.length; j++){
            if(i === 0){
              metric.date.push(measurements[0].series[0].values[j][0])
            }else{
              metric.values[i - 1].push(measurements[0].series[0].values[j][i])
            }
          }
        }
        metric.values.pop();
      } else{
        var j = 0;
        var i = 0;
        for(var k = 0; k < measurements[0].series.length;k++){
          metric.values[k] = []
          for(i = 0; i < measurements[0].series[k].values[0].length; i ++){
            for(j = 0 ; j < measurements[0].series[k].values.length; j++){
              if(i === 0){
                if(k === 0)
                  metric.date.push(measurements[0].series[k].values[j][0])
              }else{
                metric.values[k].push(measurements[0].series[k].values[j][i])
              }
            }
          }
        }
      }
    }
    list[req.body.listIndex][req.body.metricIndex] = metric
    res.json(list);
    
    }
  })
}


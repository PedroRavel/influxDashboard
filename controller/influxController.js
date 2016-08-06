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
//    database : 'Kpi_Metrics'
    
// })
//stucture to store influx data and pass to front end in format it can interprit 


//SINGLE STAT!!!
//select max(licQtGB) * 1024 as LicAllocated from EntLicInfo where title = 'All Pools' and time > now() - 476h group by time(24h), title 
//select licUsdMB from EntLicInfo WHERE time > now() - 50m
//select max(licUsdMB) from EntLicInfo where title != 'All Pools' and time > now() - 476h group by time(24h), title
// select max(licUsdMB), max(licQtGB) * 1024 as LicAllocated from EntLicInfo where title =~ /All*/ and time > now() - 476h group by time(24h), title

function KPI(){
  this.kpi;
  this.date = [];
  this.values = [];
  this.number = [];
  this.graphType = "line";
  this.statOrPie = "stat";
  this.preStat;
  this.postStat;
  this.min;
  this.max;
  this.query;

  //this.data = [];
  //this.criticalValues = [];
};

// client.getMeasurements(function(err,arrayMeasurements){ 
//   console.log(JSON.stringify(arrayMeasurements))
// } )
  
exports.addToKpi = function(req,res){
  var kpiList = []
  for(var i = 0; i < 9; i++){
    kpiList.push(new KPI())
  }
  list[indexOfList] = kpiList;
  indexOfList++;

  res.json(list);
}

exports.getName = function(req,res){
  list[req.body.listIndex][req.body.metricIndex].kpi = req.body.name;
  res.json(list); 
}

exports.getPreName = function(req,res){
  list[req.body.listIndex][req.body.metricIndex].preStat = req.body.preName;
  res.json(list); 
}

exports.getPostName = function(req,res){
  list[req.body.listIndex][req.body.metricIndex].postStat = req.body.postName;
  res.json(list); 
}

exports.getGraph = function(req,res){
  console.log(req.body.graphType)
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

exports.getList = function(req,res){
  res.json(list);
}

exports.processMetrics = function(req,res){

 client.queryRaw(req.body.query, function(err, measurements){
    console.log(JSON.stringify(measurements));
    if(err){
      res.send({error:"error"});
    }else {
      var kpi = new KPI();
      kpi.query = req.body.query;
      console.log(req.body)
      if(req.body.typeOfMetric === "stat"){
        for(var i = 0; i < measurements[0].series[0].values.length; i ++){
          kpi.date.push(measurements[0].series[0].values[i][0])
          kpi.number.push(measurements[0].series[0].values[i][1])
        }
      }
      else{ 

        if(measurements[0].series.length === 1){
        var j = 0;
        var i = 0;
        for(i = 0; i < measurements[0].series[0].values[0].length; i ++){
          kpi.values[i] = []
          for(j = 0 ; j < measurements[0].series[0].values.length; j++){
            if(i === 0){
              kpi.date.push(measurements[0].series[0].values[j][0])
            }else{
              kpi.values[i - 1].push(measurements[0].series[0].values[j][i])
            }
          }
        }
        kpi.values.pop();
      } else{
        var j = 0;
        var i = 0;
        for(var k = 0; k < measurements[0].series.length;k++){
          kpi.values[k] = []
          for(i = 0; i < measurements[0].series[k].values[0].length; i ++){
            for(j = 0 ; j < measurements[0].series[k].values.length; j++){
              if(i === 0){
                if(k === 0)
                  kpi.date.push(measurements[0].series[k].values[j][0])
              }else{
                kpi.values[k].push(measurements[0].series[k].values[j][i])
              }
            }
          }
        }
      }
}
    // console.log(list)
      list[req.body.listIndex][req.body.metricIndex] = kpi
      res.json(list);
    
    }
  })
}

exports.addMetrics = function(req,res){
  
  res.json({message:"Not available"})
 
};

//gets query from influx database and parses through array and objects and sets fields for KPI objects
exports.getMetrics = function(req,res){

  res.json({message: "NO DATA"})
};

//gets individual metric, parses through the values and sets fields in kpi 
exports.getOneMetric = function(req,res){
  res.json({message: "NO DATA"})
};


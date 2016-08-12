var express = require('express');
var bodyParser = require('body-parser');
var metrics = require('./controller/influxController')
var app = express();
var http = require('http').Server(app);


var PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.post('/metric/add', function(req,res){
  metrics.appendMetricToList(req,res);
})

app.get('/metric/find/:index', function(req,res){
  metrics.getMetric(req,res);
})

app.get('/metric/list',function(req,res){
	metrics.getMetricList(req,res);
})

app.post('/metric/client', function(req,res){
  metrics.setClient(req,res);
})

app.post('/metric/setstat',function(req,res){
  metrics.setStatNumber(req,res);
})

app.post('/metric/setstatvisual',function(req,res){
  metrics.setStatVisual(req,res);
})

app.post('/metric/process', function(req,res){
  metrics.processMetrics(req,res);
})

app.post('/metric/setmin', function(req,res){
  metrics.setMin(req,res);
})

app.post('/metric/setmax', function(req,res){
  metrics.setMax(req,res);
})

app.post('/metric/setname', function(req,res){
  metrics.setName(req,res);
})

app.post('/metric/setgraph', function(req,res){
  metrics.setGraph(req,res);
})

app.post('/metric/setprename', function(req,res){
  metrics.setPreName(req,res);
})

app.post('/metric/setpostname', function(req,res){
  metrics.setPostName(req,res);
})

app.listen(PORT, function() {
	console.log('App listening on port ' + PORT);
});


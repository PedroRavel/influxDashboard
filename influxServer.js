var express = require('express');
var bodyParser = require('body-parser');
var metrics = require('./controller/influxController')
var app = express();
var http = require('http').Server(app);


var PORT = process.env.PORT || 8000;

//set two directories for ease of use
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get('/add', function(req,res){
  metrics.addToKpi(req,res);
})

app.get('/metric/find/:index', function(req,res){
  metrics.getMetric(req,res);
})

app.get('/list',function(req,res){
	metrics.getList(req,res);
})

app.post('/test', function(req,res){
  metrics.processMetrics(req,res);
})

app.post('/setmin', function(req,res){
  metrics.setMin(req,res);
})

app.post('/setmax', function(req,res){
  metrics.setMax(req,res);
})

app.post('/changename', function(req,res){
  metrics.getName(req,res);
})

app.post('/changegraph', function(req,res){
	console.log("server")
  metrics.getGraph(req,res);
})

app.post('/changeprename', function(req,res){
  metrics.getPreName(req,res);
})

app.post('/changepostname', function(req,res){
  metrics.getPostName(req,res);
})

app.post('/metric/add', function(req, res) {
  metrics.addMetrics(req,res);
});

app.get('/metric/list', function(req,res){
  metrics.getMetrics(req,res);
 });

app.listen(PORT, function() {
	console.log('App listening on port ' + PORT);
});


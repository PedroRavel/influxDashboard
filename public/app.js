
var app = angular.module('myApp',['ngRoute','chart.js'])
  .run(function($rootScope){
    //options for chart from chart.js. 
    $rootScope.options = {

      animation: {
        duration: 0.0
      },
      elements: {
        line: {
          borderWidth: 0.5
        },
        point: {
          radius: 2
        }
      },
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          display: false
        }],
        yAxes: [{
          display: true
        }],
        gridLines: {
          display: true
        }
      },
      tooltips: {
        enabled: true
      }
    };
    
    $rootScope.changeNumberColor = function(value, minValue, maxValue){
      if(minValue){
        if(value <= minValue){
          return '#0B84C1';
        }
      }

      if(maxValue){
        if(value >= maxValue){
          return '#8E0F0F';
        }
      }
    }

    //extra options for charts. setting background-color to transparent allows area below the graph to not be drawn
    $rootScope.dataSetOverride = [{
      //backgroundColor:"transparent",
      pointHoverRadius: 8,
      bezierCurve: false
    }]
  })

//sets template and controllers based on route
app.config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider) {
  $routeProvider
    .when('/options',
      {
        templateUrl: "form.html",
        controller:"ctrl"
      })
    .when('/',
      {
        templateUrl: "dashboard.html",
        controller:"ctrl"
      })
    .when('/stacked',
      {
        templateUrl:"stackedDashboard.html",
        controller: "ctrl"
      })
    .when('/metric/find/:index',
    {
      templateUrl:"kpi.html",
      controller: "kpi"
    });
}]);


app.controller('kpi', function($scope,$http,$routeParams){
  $http.get('/metric/find/' + $routeParams.index).then(function(res){
    $scope.kpi = res.data; 
  })
})


app.controller('ctrl', function($scope,$http,$timeout){
  
  $scope.graphList = ['line','bar','radar','horizontalBar'];
  $scope.switchGraph = function(graph,listIndex,metricIndex) {
    var data = {
      graphType:graph,
      listIndex:listIndex,
      metricIndex:metricIndex
    }
    $http.post('/changegraph',data).then(function(res){

    });
  }

  $scope.kpiData = []

  $http.get('/list').then(function(res){
    $scope.kpiData = res.data;
  })

  $scope.putin = function(){    
    $http.get('/add').then(function(res){
      $scope.kpiData = res.data
    })
  }

  $scope.setMin = function(min,listIndex,metricIndex){
    var data =  {
      min:min,
      listIndex:listIndex,
      metricIndex:metricIndex
    }
    $http.post('/setmin',data).then(function(res){

    });
  }

  $scope.setMax = function(max,listIndex,metricIndex){
    var data =  {
      max:max,
      listIndex:listIndex,
      metricIndex:metricIndex
    }
    $http.post('/setmax',data).then(function(res){

    });
  }
  
  $scope.changeName = function(name, listIndex,metricIndex){
    var data =  {
        name:name,
        listIndex:listIndex,
        metricIndex:metricIndex
    }
    $http.post('/changename',data).then(function(res){

    });
  }

  $scope.changePreName = function(preName, listIndex,metricIndex){
    var data =  {
        preName:preName,
        listIndex:listIndex,
        metricIndex:metricIndex
    }
    $http.post('/changeprename',data).then(function(res){});
  }

  $scope.changePostName = function(postName, listIndex,metricIndex){
    var data =  {
        postName:postName,
        listIndex:listIndex,
        metricIndex:metricIndex
    }
    $http.post('/changepostname',data).then(function(res){});
  }

  $scope.click = function(query, listIndex, metricIndex, typeOfMetric){
    var data = { 
        query:query,
        listIndex:listIndex,
        metricIndex: metricIndex,
        typeOfMetric:typeOfMetric
      }
    
    $http.post('/test',data).then(function(res){
      if(res.data.error){
        alert("Incorrect query syntax. Please check spelling");
      } else {
      $scope.kpiData = res.data;
    }
    })
  }


})




        

	

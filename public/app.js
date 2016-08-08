
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
        display: true
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

    $rootScope.pieOptions = {

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
          display: false
        }],
        gridLines: {
          display: false
        }
      },
      tooltips: {
        enabled: true
      }
    };

    $rootScope.statOptions = {

      animation: {
        duration: 0.0
      },
      elements: {
        line: {
          borderWidth: 0
        },
        point: {
          radius: 0
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
          display: false
        }],
        gridLines: {
          display: false
        }
      },
      tooltips: {
        enabled: false
      }
    };

    $rootScope.dummyOptions = {

      animation: {
        duration: 1
      },
      elements: {
        line: {
          borderWidth: 0
        },
        point: {
          radius: 0
        }
      },
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          display: true
        }],
        yAxes: [{
          display: false
        }],
        gridLines: {
          display: false
        }
      },
      tooltips: {
        enabled: false
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
  $scope.statType = ['max','min','average','sum','latest']
  $scope.statVisual = ['stat','pie','doughnut']

  $scope.metricList = []

  $http.get('/metric/list').then(function(res){
    $scope.metricList = res.data;
  })

  $scope.setVisual = function(visual,listIndex,metricIndex){
    var data = {
      visual:visual,
      listIndex:listIndex,
      metricIndex:metricIndex

    }
    
    $http.post('/metric/setstatvisual',data).then(function(res){
      $scope.metricList = res.data;
    })    

  }



  $scope.setStat = function(statChoice, listIndex,metricIndex){
  
    var data = {
      choice:statChoice,
      listIndex:listIndex,
      metricIndex:metricIndex
      
    }

    $http.post('/metric/setstat',data).then(function(res){
      $scope.metricList = res.data;
    })
  }

  $scope.switchGraph = function(graph,listIndex,metricIndex) {
    var data = {
      graphType:graph,
      listIndex:listIndex,
      metricIndex:metricIndex
    }
    $http.post('/metric/setgraph',data).then(function(res){

    });
  }

  
  $scope.createList = function(){    
      $http.get('/metric/add').then(function(res){
      $scope.metricList = res.data
    })
  }

  $scope.setMin = function(min,listIndex,metricIndex){
    var data =  {
      min:min,
      listIndex:listIndex,
      metricIndex:metricIndex
    }
    $http.post('/metric/setmin',data).then(function(res){

    });
  }

  $scope.setMax = function(max,listIndex,metricIndex){
    var data =  {
      max:max,
      listIndex:listIndex,
      metricIndex:metricIndex
    }
    $http.post('/metric/setmax',data).then(function(res){

    });
  }
  
  $scope.setName = function(name, listIndex,metricIndex){
    var data =  {
        name:name,
        listIndex:listIndex,
        metricIndex:metricIndex
    }
    $http.post('/metric/setname',data).then(function(res){

    });
  }

  $scope.setPreName = function(preName, listIndex,metricIndex){
    var data =  {
        preName:preName,
        listIndex:listIndex,
        metricIndex:metricIndex
    }
    $http.post('/metric/setprename',data).then(function(res){});
  }

  $scope.setPostName = function(postName, listIndex,metricIndex){
    var data =  {
        postName:postName,
        listIndex:listIndex,
        metricIndex:metricIndex
    }
    $http.post('/metric/setpostname',data).then(function(res){});
  }

  $scope.queryDB = function(query, listIndex, metricIndex, typeOfMetric){
    var data = { 
        query:query,
        listIndex:listIndex,
        metricIndex: metricIndex,
        typeOfMetric:typeOfMetric
      }
    
    $http.post('/metric/process',data).then(function(res){
      if(res.data.error){
        alert("Incorrect query syntax. Please check spelling");
      } else {
      $scope.metricList = res.data;
    }
    })
  }
})

var app = angular.module('myApp',['ngRoute','chart.js'])
  .run(function($rootScope){
    //options for chart from chart.js. 

    $rootScope.metricList = []
    $rootScope.indexForGraph = 0;
    $rootScope.indexForStat = 1
    $rootScope.indexForLargeGraph = 2;

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
        controller:"formCtrl"
      })
    .when('/',
      {
        templateUrl: "dashboard.html",
        controller:"dashboardCtrl"
      })
}]);


app.factory('formFactory',function($http){

  var formFactory = {};

  var grabIndex = function(listIndex,metricIndex){
    return {
      listIndex:listIndex,
      metricIndex:metricIndex
    }
  }

  formFactory.getMetrics = function(){
    return $http.get('/metric/list')
  }

  formFactory.setVisual = function(visual,listIndex,metricIndex){
    var data = grabIndex(listIndex,metricIndex);
    data.visual = visual;
    return $http.post('/metric/setstatvisual',data)
  }

  formFactory.setStat = function(statChoice, listIndex,metricIndex){
    var data = grabIndex(listIndex,metricIndex);
    data.choice = statChoice;
    return $http.post('/metric/setstat',data)
  }

  formFactory.switchGraph = function(graph,listIndex,metricIndex) {
    var data = grabIndex(listIndex,metricIndex);
    data.graphType = graph;
    return $http.post('/metric/setgraph',data)
  }

  
  formFactory.createList = function(index){    
      var data = {
        index:index
      }
      return $http.post('/metric/add',data)
  }

  formFactory.setMin = function(min,listIndex,metricIndex){
    var data = grabIndex(listIndex,metricIndex);
    data.min = min;
    return $http.post('/metric/setmin',data)
  }

  formFactory.setMax = function(max,listIndex,metricIndex){
    var data = grabIndex(listIndex,metricIndex);
    data.max = max;
    return $http.post('/metric/setmax',data)
  }
  
  formFactory.setName = function(name, listIndex,metricIndex){
    var data = grabIndex(listIndex,metricIndex);
    data.name = name;
    return $http.post('/metric/setname',data)
  }

  formFactory.setPreName = function(preName, listIndex,metricIndex){
    var data = grabIndex(listIndex,metricIndex);
    data.preName = preName;
    return $http.post('/metric/setprename',data);
  }

  formFactory.setPostName = function(postName, listIndex,metricIndex){
    var data = grabIndex(listIndex,metricIndex);
    data.postName = postName;
    return $http.post('/metric/setpostname',data)
  }

  formFactory.queryDB = function(query, listIndex, metricIndex, typeOfMetric){
    var data = grabIndex(listIndex,metricIndex);
    data.query = query;
    data.typeOfMetric = typeOfMetric; 
    return $http.post('/metric/process',data)
  }

  return formFactory;

})

app.controller('indexCtrl', function($scope,$http){
  $scope.authenticateDB = function(host,username,password,database){
    var data = {
      host: host,
      username: username,
      password: password,
      database:database
    }
    $http.post('/metric/client',data).then(function(res){
        console.log(res.data)
    })
  }
})

app.controller('dashboardCtrl', function($scope,$rootScope,$http){

    $http.get('/metric/list').then(function(res){
      $rootScope.metricList = res.data;
    })
  
    $scope.options = {

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

    $scope.pieOptions = {

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

    $scope.statOptions = {

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

    $scope.dummyOptions = {

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
  })

app.controller('formCtrl', function($scope,$http,$rootScope,formFactory){
  
  $scope.graphList  = ['line','bar','radar','horizontalBar'];
  $scope.statType   = ['max','min','average','sum','latest']
  $scope.statVisual = ['stat','pie','doughnut']

  var formFactory = formFactory;

  formFactory.getMetrics().then(function(res){
    $rootScope.metricList = res.data;
  })

  $scope.setVisual = function(visual,listIndex,metricIndex){
    formFactory.setVisual(visual,listIndex,metricIndex).then(function(res){
      $scope.metricList = res.data;
    })
  }

  $scope.setStat = function(statChoice, listIndex,metricIndex){
    formFactory.setStat(statChoice, listIndex,metricIndex).then(function(res){
      $scope.metricList = res.data;
    })
  }

  $scope.switchGraph = function(graph,listIndex,metricIndex) {
    formFactory.switchGraph(graph,listIndex,metricIndex).then(function(res){

    });
  }

  $scope.createList = function(index){    
    formFactory.createList(index).then(function(res){
      $scope.metricList = res.data
    })
  }

  $scope.setMin = function(min,listIndex,metricIndex){
    formFactory.setMin(min,listIndex,metricIndex).then(function(res){

    })
  }

  $scope.setMax = function(max,listIndex,metricIndex){
    formFactory.setMax(max,listIndex,metricIndex).then(function(res){

    })
  }
  
  $scope.setName = function(name, listIndex,metricIndex){
    formFactory.setName(name, listIndex,metricIndex).then(function(res){

    })
  }

  $scope.setPreName = function(preName, listIndex,metricIndex){
    formFactory.setPreName(preName, listIndex,metricIndex).then(function(res){

    })
  }

  $scope.setPostName = function(postName, listIndex,metricIndex){
    formFactory.setPostName(postName, listIndex,metricIndex).then(function(res){

    })
  }

  $scope.queryDB = function(query, listIndex, metricIndex, typeOfMetric){
    formFactory.queryDB(query, listIndex, metricIndex, typeOfMetric).then(function(res){
      if(res.data.error){
        alert("Incorrect query syntax. Please check spelling");
      } else {
        $scope.metricList = res.data;
      }
    })
  }

})
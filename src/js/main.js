import Home from './pages/home.js';
import Dashboard from './pages/dashboard.js';
import Group from './pages/group.js';
import Firebase from './firebase/firebase.js';
import Store from './store.js';

var todoApp = angular.module('myApp', ['ngRoute', 'datePickerComponent', 'editInHTML', 'dropdownComponent', 'todoComponent', 'userComponent', 'groupsComponent', 'fromNowComponent'])

  .config(function($routeProvider) {
        $routeProvider
            .when('/home', {
                controller: 'homeControls',
                templateUrl: 'template/home.html',
            })
            .when('/dashboard', {
                controller: 'dashboardControls',
                templateUrl: 'template/dashboard.html',
            })
                .when('/dashboard/:filter', {
                    controller: 'dashboardControls',
                    templateUrl: 'template/dashboard.html',
                })
                    .when('/task/:filter/:id', {
                        controller: 'dashboardControls',
                        templateUrl: 'template/dashboard.html',
                    })

            .when('/group', {
                controller: 'groupControls',
                templateUrl: 'template/group.html',
            })
            .when('/group/:filter', {
                controller: 'groupControls',
                templateUrl: 'template/group.html',
            })

            .otherwise({
                redirectTo:'/home'
            })
  });

  todoApp.controller('homeControls', function($rootScope, $scope, $location, $route){
      new Home().init(Firebase, $rootScope, $scope, $location, $route);
  });

  todoApp.controller('dashboardControls', function($scope, $route, $location, $rootScope){
      if (window.sessionStorage.length > 0) {
          this.loggedIn = true;
          Firebase.autoLogin($rootScope, $route);
      }

      new Dashboard().init(Firebase, $rootScope, $scope, $route, $location, Store);
  });

  todoApp.controller('groupControls', function($scope, $route, $location, $rootScope){
        if (window.sessionStorage.length > 0) {
            this.loggedIn = true;
            Firebase.autoLogin($rootScope, $route);
        }

        new Group().init(Firebase, $rootScope, $scope, $route, $location);
  });
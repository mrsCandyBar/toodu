import Menu from './controller_menuControls.js';
import Pages from './controller_pageControls.js';

import Dashboard from './pages/dashboard.js';
import TodoControls from './todo/todo_controls.js';
import Firebase from './firebase/firebase.js';
import Store from './store.js';

import AngularUUID from 'angular-uuid';


// Set single menu items
// differentiate between string and obj for dropdown items {page: 'about', list: []}
var menuItems = Menu.buildMenu(['home', 'dashboard']);
var todoApp = angular.module('myApp', ['ngRoute', 'datePickerComponent', 'angular-uuid', 'editInHTML', 'dropdownComponent', 'todoComponent'])

  .config(function($routeProvider) { 
    
    Menu.setRoutesWithBuiltMenu($routeProvider, menuItems); 

    // set custom urls
    $routeProvider
      .when('/dashboard/:filter', {
        controller: 'dashboardControls',
        templateUrl: 'template/dashboard.html',
      })

    // set route for unknown routes
    $routeProvider
      .otherwise({
        redirectTo:'/home'
      })
  });

  // MENU
  todoApp.controller('menuControls', function($rootScope, $route) { 
    Menu.initMenu(this, $rootScope, menuItems);
    
    if (window.sessionStorage.length > 0) {
      this.loggedIn = true;
      Firebase.autoLogin($rootScope, $route);
    }
  });

  todoApp.controller('homeControls',     function($rootScope, $scope, $location, $route){
      Pages.home($rootScope, $scope, $location, $route, Firebase);
  });

  todoApp.controller('dashboardControls', function($scope, $route, $location, $rootScope, uuid){
      new Dashboard().init(Firebase, TodoControls, $scope, $route, $location, 'tasks', $rootScope, uuid, Store);
  });
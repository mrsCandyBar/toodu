import Menu from './controller_menuControls.js';
import Pages from './controller_pageControls.js';

import Dashboard from './pages/dashboard.js';
import TodoControls from './todo/todo_controls.js';
import Firebase from './firebase/firebase.js';

import AngularUUID from 'angular-uuid';


// Set single menu items
// differentiate between string and obj for dropdown items {page: 'about', list: []}
var menuItems = Menu.buildMenu(['home', 'overview', 'archive']);
var todoApp = angular.module('myApp', ['ngRoute', 'datePickerComponent', 'angular-uuid', 'editInHTML', 'dropdownComponent', 'createTodoComponent', 'todoComponent'])

  .config(function($routeProvider) { 
    
    Menu.setRoutesWithBuiltMenu($routeProvider, menuItems); 

    // set custom urls
    $routeProvider
      .when('/overview/:filter', {
        controller: 'overviewControls',
        templateUrl: 'template/overview.html'
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
      Firebase.autoLogin($route);
    }
  });

  todoApp.controller('homeControls',     function($scope, $location, $route)       { Pages.home($scope, $location, $route, Firebase); });
  
  todoApp.controller('overviewControls', function($scope, $route, $location, $rootScope, uuid)       {
    new Dashboard().init(Firebase, TodoControls, $scope, $route, $location, 'tasks', $rootScope, uuid)
  });

  todoApp.controller('archiveControls',  function($scope, $route, $location, $rootScope)       { 
    new Dashboard().init(Firebase, TodoControls, $scope, $route, $location, 'archive', $rootScope) 
  });

/*
  // replace this with some fun stats based on user data returned
  .controller('beersControls',    function($scope, $locale) { Beer.initTabs($scope, $locale)
  })*/

(function () {
  'use strict';
console.log('app.js');
    //angular.module('Config', []);

    angular
        .module('App', [
            //'Config',
            'ngAnimate',
            'angular-underscore',
            'templates',
            'ui.router',
            //'ui.bootstrap',
            //'angular-loading-bar',
            'angularMoment',
            'ngRoute',
            'ngResource',
            'ui.materialize'
        ]).run(['$log', '$rootScope', runApp])
        // using '!' as the hashPrefix but can be a character of your choosing
        .config(['$locationProvider', '$httpProvider', function($locationProvider, $httpProvider) {
          console.log('config');
          $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
          }).hashPrefix('!');
        }]);

    function runApp($log, $rootScope) {
      console.log('run');

        $log.info("run");

        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.title = toState.title;
            $log.info("state changed");
        });

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParam, $stateParams) {

            $log.info("state started");

        });
    }

    angular.
      module('App').
      factory('$exceptionHandler', ['$log', '$injector', function($log, $injector) {
        return function myExceptionHandler(exception, cause) {
          $log.error('There is an error');
          $log.warn(exception, cause);

          var $rootScope = $injector.get("$rootScope");
          if(!$rootScope.errorLog) { $rootScope.errorLog = []; }

          $rootScope.errorLog.push({ exception: exception, cause: cause });
        };
      }]);
})();

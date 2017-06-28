(function () {
    'use strict';

    angular
    .module('App')
    .controller('HomeController', [
      '$rootScope', '$log', 'HomeService',
      HomeController]);

    function HomeController($rootScope, $log, HomeService) {
      var vm = this;
        $log.info('Home controller');

        /*HomeService.getData().then(function() {
            $log.info("done");
        });*/

    };
})();

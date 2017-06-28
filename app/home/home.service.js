(function () {
    'use strict';

    angular
    .module('App')
    .factory('HomeService', [
      '$http', '$q', '$resource',
      HomeService]);

    function HomeService($http, $q, $resource) {
        var sbcData = {
            getData: getData
        }
        return sbcData;

        function getData() {
            return $resource('/api/values').query().$promise;
        }
    };

})();

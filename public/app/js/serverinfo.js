(function() {
  'use strict';

  angular
    .module('App')
    .directive('serverinfo', serverinfo);

  function serverinfo(){
    let directive = {
      restrict:'E',
      scope:{
      },
      templateUrl: '/templates/serverinfo.html',
      controller: Serverinfo
    };

    return directive;
  };
  
  
  Serverinfo.$inject = ['$scope', 'dataAssistant'];

  function Serverinfo($scope, dataAssistant){
      $scope.serverinfo = {};
      
      $scope.getInfo = function(){
          dataAssistant.get('/api/servierinfo').then(function(data){
              $scope.serverinfo = data.data;
          },function(errir){
              $scope.serverinfo = {};
          });
      }

  }

})();	

(function() {
  'use strict';

  angular
    .module('App')
    .directive('calls', calls);

  function calls(){
    let directive = {
      restrict:'E',
      scope:{
      },
      templateUrl: '/templates/calls.html',
      controller: Calls
    };

    return directive;
  };
  
  
  Calls.$inject = ['$scope', 'dataAssistant'];

  function Calls($scope, dataAssistant){
    $scope.calls = [];

    $scope.init = () => {
      dataAssistant.get('/dbapi/calls/findAll')
      .then( data => {
        $scope.calls = data.data;
      })
    };

    $scope.$parent.socket.on('dbevent', (data) => {
      if(data.model == 'calls' && data.hook == 'afterCreate'){
        $scope.calls.push(data.object);
        $scope.$digest();
      }
    });

  }

})();	

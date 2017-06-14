(function() {
  'use strict';

  angular
    .module('App')
    .directive('speechers', speechers);

  function person(){
    let directive = {
      restrict:'E',
      scope:{
      },
      templateUrl: '/templates/speechers.html',
      controller: Speechers
    };

    return directive;
  };
  
  
  Speechers.$inject = ['$scope', 'dataAssistant',"_"];

  function Speechers($scope, dataAssistant, _){
    $scope.speechers = [];
    
    
    $scope.init = () => {
      dataAssistant.get('/dbapi/speechers/findAll')
      .then( data => {
        $scope.speechers = data.data;
      })
    };

    $scope.$parent.socket.on('dbevent', (data) => {
      
      if(data.model == 'speechers'){
        if(data.hook == 'afterCreate'){
          $scope.speechers.push(data.object);
          $scope.$digest();
        }
      } 
    });
  }

})();	

(function() {
  'use strict';

  angular
    .module('App')
    .directive('listitem', listitem);

  function listitem(){
    let directive = {
      restrict:'E',
      scope:{
        action: '&action',
        item: '='
      },
      templateUrl: '/templates/listitem.html',
      controller: Listitem
    };

    return directive;
  };
  
  
  Listitem.$inject = ['$scope', 'dataAssistant'];

  function Listitem($scope, dataAssistant){

    $scope.showHist = function(){        
        
    };
  }

  
  
})();	

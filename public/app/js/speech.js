(function() {
  'use strict';

  angular
    .module('App')
    .directive('speech', speech);

  function speech(){
    let directive = {
      restrict:'E',
      scope:{
      },
      templateUrl: '/templates/speech.html',
      controller: Speech
    };

    return directive;
  };
  
  
  Speech.$inject = ['$scope', 'dataAssistant'];

  function Speech($scope, dataAssistant){

  }

})();	

(function() {
  'use strict';

  angular
    .module('App')
    .directive('dialogs', dialogs);

  function dialogs(){
    let directive = {
      restrict:'E',
      scope:{
      },
      templateUrl: '/templates/dialogs.html',
      controller: Dialogs
    };

    return directive;
  };
  
  
  Dialogs.$inject = ['$scope', 'dataAssistant'];

  function Dialogs($scope, dataAssistant){
    
    $scope.setInternalNumber = function(){
			console.log('setInternalNumber');
			dataAssistant.post('/api/internal_number', {internal_number: $scope.internalnumber}).then(function(data){
				console.log('internal_number: ' + $scope.internalnumber + ' ' +data.data);
			}, function(error){
				console.log('internal_number: ' + JSON.stringify(error));
			});
		}
		

  }

})();	

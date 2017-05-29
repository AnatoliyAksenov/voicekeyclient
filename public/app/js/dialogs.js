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
      controller: Dialogs,
      link: Link
    };

    return directive;
  };
  
  Dialogs.$inject = ['$scope', 'dataAssistant'];

  function Dialogs($scope, dataAssistant){
    $scope.call = {};
    
    $scope.setInternalNumber = function(){
			console.log('setInternalNumber');
			
			dataAssistant.post('/api/internal_number', {internal_number: $scope.internalnumber})
			.then(function(data){
			  //if OK init saving socket object on server side
			  $scope.$parent.socket.emit('listenner:add', $scope.internalnumber, function(){
			    console.log('eimt listenner:add');
			  });
			  
			}, function(error){
				console.log('internal_number error: ' + JSON.stringify(error));
			});
			
		};
  }

  Link.$inject = ['$scope', '$element'];

  function Link($scope, $element){
    
    $element.find('#incomingcall').on('show.bs.modal', function(e){
      $scope.call = $scope.$parent.call;
      $scope.$digest();
    });
  }

})();	

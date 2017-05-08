(function() {
  'use strict';

  angular
    .module('App')
    .controller('MainController', MainController);

    MainController.inject = ['$scope', 'dataAssistant', 'socketUtils'];

    function MainController($scope, dataAssistant, socketUtils) {
		$scope.hists = {};
		
		socketUtils.socket.emit('start');
		

		$scope.loadhists = function(){
			dataAssistant.get('/api/hists').then(function(data){
				$scope.hists = data.data;
				console.log('hist loaded.');
			}, function(error){
				$scope.hists = {};
			});
		};		
      
		$scope.showAdd = function(){
			$scope.page = 'add';
			
		};

						
    }
})();
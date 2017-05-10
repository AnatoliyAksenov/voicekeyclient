(function() {
  'use strict';

  angular
    .module('App')
    .controller('MainController', MainController);

    MainController.inject = ['$scope', 'dataAssistant', 'socketUtils'];

    function MainController($scope, dataAssistant, socketUtils) {
		$scope.hists = {};
		$scope.status = 'undefined';
		
		$scope.socket = socketUtils.socket;
		
		$scope.socket.on('connect',function(){
			$scope.status = 'connected';
		})
		
		$scope.socket.on('ping', function(data){
			$scope.status = 'ping';
			console.log('ping');
		});
		
		$scope.socket.on('pong', function(data){
			$scope.status = 'pong';
			console.log('pong');
		});
		
		$scope.socket.on('reconnect_error', function(data){
			$scope.status = 'reconnect_error';
		});
		
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
(function() {
  'use strict';

  angular
    .module('App')
    .controller('MainController', MainController);

    MainController.inject = ['$scope', 'dataAssistant', 'socketUtils'];

    function MainController($scope, dataAssistant, socketUtils) {
    	$scope.page = 'person';
		$scope.hists = {};
		$scope.status = {message: 'disconneted'};
		
		$scope.init = function(){
		
			$scope.socket = socketUtils.socket;
			
			$scope.socket.on('connect', function(){
				$scope.status = {message: 'connect'};
				$scope.$digest();
				console.log('connect');
			});
			
			$scope.socket.on('ping', function(data){
				$scope.status = {message: 'ping'};
				$scope.$digest();
				console.log('ping');
			});
			
			$scope.socket.on('pong', function(data){
				$scope.status = {message: 'pong'};
				$scope.$digest();
				console.log('pong');
			});
			
			$scope.socket.on('reconnect_error', function(data){
				$scope.status = {message: 'reconnect_error'};
				$scope.$apply();
			});
			
			$scope.socket.on('incomingcall', function(data){
				console.log('incomingcall');
				$scope.call = data;
				$scope.$apply();
				$('incomingcall').modal();
			});
		};
		
		$scope.showPersonList = function(){
			$scope.page = 'person';
		};
		
		$scope.showCallsList = function(){
			$scope.page = 'speech';
		};
		
						
    }
})();
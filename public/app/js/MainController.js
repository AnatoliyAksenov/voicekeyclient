(function() {
  'use strict';

  angular
    .module('App')
    .controller('MainController', MainController);

    MainController.inject = ['$scope', 'dataAssistant', 'socketUtils', '$timeout'];

    function MainController($scope, dataAssistant, socketUtils, $timeout) {
    	$scope.page = 'person';
		$scope.call = { hello: "World!" };
		$scope.status = {message: 'disconnected'};
		
		$scope.init = function(){
		
			$scope.socket = socketUtils.socket;
			
			$scope.socket.on('connect', function(){
				$scope.status = {message: 'connect'};
				$scope.$digest();

				this.on('incomingcall', function(data){

					$scope.call = data;
					$scope.$digest();
					$('#incomingcall').modal('show');
				});
				
				
				this.on('listenner:add:response', data => {
					if(data){
						if(data == 'OK'){
							console.log('Internal number initialized.');
						} else {
							console.log(JSON.stringify(data));
						}
					}
				});

			});
			
			$scope.socket.on('disconnected', function(){
				$scope.status = { message: 'disconnected'};
				$scope.$digest();
				
				this.off('incomingcall');
				this.off('listenner:add:response');
			});
			
			$scope.socket.on('ping', function(data){
				$scope.status = { message: 'ping' };
				$scope.$digest();
			});
			
			$scope.socket.on('pong', function(data){
				$scope.status = { message: 'pong' };
				$scope.$digest();
				
				//change label to coonect with timeout
				$timeout( () => {
					$scope.status = { message: 'connect' };
				}, 500);
			});
			
			$scope.socket.on('reconnect_error', function(data){
				$scope.status = {message: 'reconnect_error'};
				$scope.$apply();
			});
			
			
		};
		
		$scope.showPersonList = function(){
			$scope.page = 'person';
		};
		
		$scope.showCallsList = function(){
			$scope.page = 'calls';
		};
		
						
    }
})();
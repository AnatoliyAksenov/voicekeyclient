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
    
    $scope.setInternalNumber = () => {
			
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

    $scope.getPersonInfo = (c) => {
      dataAssistant.get('/dbapi/person/findOne?options=' + encodeURI(JSON.stringify({ "where":  {"$or": [{"phoneNumber": c.ani}, {"phoneNumber": c.ani} ]}})))
      .then( data => {
        console.log(JSON.stringify(data));
        $scope.call.shortName = data.data.shortName;
        $scope.$digest;
      }, 
      error => {
        console.log(error.message);
      });
    };

    $scope.SaveCompletedModel = () => {
      const c = $scope.call;
      //replace create to findOrCreate
      dataAssistant.get('/dbapi/person/create?options=' + encodeURI(JSON.stringify({person_id: c.person_id, phoneNumber: c.ani})))
      .then( data => {
        $scope.call.person = data.data;
        dataAssistant.get('/dbapi/speecher/create?options=' + encodeURI(JSON.stringify({person_id: c.person_id, role: "caller"})))
        .then( data => {
          console.log('create person and caller_id completed');
          $scope.call.speecher = data.data;
          $('#save_completed').addClass('hide');
        });
        
      }, error => {

      });
    };

    $scope.$parent.socket.on('complete_model', data => {
      $scope.call.status = 'model';
      $scope.call.model_id = data.model_id;
      $scope.$digest;
			$('#save_completed').text('Создать');
				
    });
  }

  Link.$inject = ['$scope', '$element'];

  function Link($scope, $element){
    
    $element.find('#incomingcall').on('show.bs.modal', function(e){
      const obj =  $scope.$parent.call;
      $scope.call = {};
      $scope.call.ani = obj.param_ani;
      $scope.call.calluuid = obj.param_calluuid;
      $scope.call.dnis = obj.param_dnis;
      $scope.getPersonInfo($scope.call);
      $scope.$digest();
    });
  }

})();	

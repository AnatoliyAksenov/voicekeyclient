(function() {
  'use strict';

  angular
    .module('App')
    .directive('person', person);

  function person(){
    let directive = {
      restrict:'E',
      scope:{
      },
      templateUrl: '/templates/person.html',
      controller: Person
    };

    return directive;
  };
  
  
  Person.$inject = ['$scope', 'dataAssistant',"_"];

  function Person($scope, dataAssistant, _){
    $scope.persons = [];
    
    
    $scope.init = () => {
      dataAssistant.get('/dbapi/person/findAll')
      .then( data => {
        $scope.persons = data.data;
      })
    };

    $scope.$parent.socket.on('dbevent', (data) => {
      
      if(data.model == 'person'){
        console.log(data.hook);
        if(data.hook == 'afterCreate'){
          $scope.persons.push(data.object);
          $scope.$digest();
        }
      } 
    });
  }

})();	

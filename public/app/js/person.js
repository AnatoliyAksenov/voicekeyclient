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
  
  
  Person.$inject = ['$scope', 'dataAssistant'];

  function Person($scope, dataAssistant){
    $scope.persons = [
      {
        shortName: "test",
        fullName:  "Super test",
        person_id: "55044",
        rscode:    "12598",
        inn:       "7719584389",
        phoneNumber: "+7(495)345-55-34",
        url:       "https://rogaandcopita.com",
        email:     "info@rogaandcopita.com"},
      {
        shortName: "test",
        fullName:  "Super test",
        person_id: "55044",
        rscode:    "12598",
        inn:       "7719584389",
        phoneNumber: "+7(495)345-55-34",
        url:       "https://rogaandcopita.com",
        email:     "info@rogaandcopita.com"}
    ];
  }

})();	

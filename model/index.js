'use strict';

var Sequelize = require('sequelize');
var sequelize = new Sequelize('reb', '', '', {
	host: 'localhost',
    dialect: 'sqlite',
	  storage: __dirname + '/reb.sqlite',
	  logging: false
});

let database = {};
let User = {};

sequelize
  .authenticate()
  .then(() => {
      let Person = sequelize.define('person', {
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      personId: {
        type: Sequelize.INTEGER,
        unique: 'IDX_PERSON_PERSON_ID'
      },
      phoneNumber: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING
      }
    });
    
    //recreate
    Person.sync({force: true})
    .then(() => {
      return Person.create({
        firstName: 'Anatoliy',
        lastName: 'Aksenov',
        personId: 6007,
        phoneNumber: 6007,
        url: "http://portal.main.roseurobank.ru/user/6007"
      });
    })
    .then(()=>{
      return Person.create({
        firstName: 'Boris',
        lastName: 'Gurevich',
        personId: 1122,
        phoneNumber: 6666,
        url: "http://portal.main.roseurobank.ru/user/1122"
      });
    });
    database.person = Person;
    
    let Speech = sequelize.define('speech', {
      speecherId1: { type: Sequelize.INTEGER },
      speecherId2: { type: Sequelize.INTEGER },
      speechText: { type: Sequelize.TEXT }
    });
    
    Speech.sync({force: true})
    .then(() => {
      return Speech.create({
        speecherId1: 1,
        speecherId2: 2,
        speechText: `<speech startTime="01.01.2017">
            <specheerId1 timestamp="01.01.2017 01:01:01">Happy New Year Boris!</speecherId1>
            <specheerId2 timestamp="01.01.2017 01:01:05">Happy New Year Anatoliy!</speecherId1>
          </speech>`
      });
    })
    .then(() => {
      return Speech.create({
        speecherId1: 2,
        speecherId2: 1,
        speechText: `<speech startTime="01.01.2017">
            <specheerId1 timestamp="01.01.2017 01:01:01">Happy New Year Boris!</speecherId1>
            <specheerId2 timestamp="01.01.2017 01:01:05">Happy New Year Anatoliy!</speecherId1>
          </speech>`
      });
    });
    
    database.speech = Speech;
    
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

  database.sequelize = sequelize;
  database.Sequelize = Sequelize;

module.exports = database;
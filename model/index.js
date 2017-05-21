'use strict';

var Sequelize = require('sequelize');
var sequelize = new Sequelize('reb', '', '', {
	host: 'localhost',
    dialect: 'sqlite',
	storage: __dirname + '/reb.sqlite'
});

let database = {};
let User = {};

sequelize
  .authenticate()
  .then(() => {
      let User = sequelize.define('user', {
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      }
      
    });
    
    //recreate
    User.sync({force: true}).then(() => {
      // Table created
      return User.create({
        firstName: 'John',
        lastName: 'Hancock'
      }).then(()=>{
        return User.create({
          firstName: 'Проверка',
          lastName: 'Новая проверка'
        });
      });
    });
    database.user = User;
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

  database.sequelize = sequelize;
  database.Sequelize = Sequelize;

module.exports = database;
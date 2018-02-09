'use strict';
module.exports = function(sequelize, DataTypes) {
  var message = sequelize.define('message', {
    message: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.message.belongsTo(models.user);
      }
    }
  });
  return message;
};
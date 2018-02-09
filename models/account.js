'use strict';

var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
  var account = sequelize.define('account', {
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: [8, 99]
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        models.account.hasMany(models.user);
        // associations can be defined here
      },
      authenticate: function(email, password, callback) {
        this.find({where: {email: email}}).then(function(account) {
          if (account) {
            bcrypt.compare(password, account.password, function(err, result) {
              if (err) {
                callback(err);
              } else {
                callback(null, result ? account : false);
              }
            });
          } else {
            callback(null, false);
          }
        }).catch(callback);
      }
    },
    hooks: {
      beforeCreate: function(account, options, callback) {
        if (!account.password) return callback(null, account);
        bcrypt.hash(account.password, 10, function(err, hash) {
          if (err) return callback(err);
          account.password = hash;
          callback(null, account);
        });
      }
    }
  });
  return account;
};
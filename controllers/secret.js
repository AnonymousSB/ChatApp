var express = require('express');
var router = express.Router();

router.get('/', function(req, resp){
  req.flash('danger','You must be logged in to access that page.');
  res.redirect('/');
});

module.exports = router;
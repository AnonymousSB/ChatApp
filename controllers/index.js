var express = require('express');
var router = express.Router();

router.get('/', function(req, resp){
  // console.log('the request is', req);
  resp.render('index');
});

module.exports = router;
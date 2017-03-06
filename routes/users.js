var express = require('express');
var router = express.Router();
/* Users prefix */
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;

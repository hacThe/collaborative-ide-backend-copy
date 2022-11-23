var express = require('express');
const { v4 } = require('uuid');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});



module.exports = router;

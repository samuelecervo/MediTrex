var express = require('express');
var router = express.Router();


// GET HOMEPAGE
router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/error', function (req, res, next) {
  res.render('error');
});

module.exports = router;
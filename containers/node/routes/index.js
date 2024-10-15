var api = require("../api");
var express = require('express');
var router = express.Router();


// GET HOMEPAGE
router.get('/', function (req, res, next) {
  var node = process.env.INSTANCE;
  console.log('The client is routed on: ', node);
  var user = null;
  if (req.session.user != null) {
    user = req.session.user;
  }
  api.getArticles(3)
    .then(function (data) {
      res.render('index', {
        title: 'MediTREX | HOMEPAGE',
        articles: data,
        user: user
      });
    }).catch(function (err) {
      console.log(err);
    });
});

//HEALTCHECK
router.get('/healthcheck', function (req, res, next) {
  res.sendStatus(200);
});

// ARTICLES PAGE
router.get('/articles', function (req, res, next) {
  var user = null;
  if (req.session.user != null) {
    user = req.session.user;
  }
  api.getArticles(10)
    .then(function (data) {
      res.render('articles', {
        title: 'MediTREX | Articles',
        articles: data,
        user: user
      });
    }).catch(function (err) {
      console.log(err);
    });
});

module.exports = router;
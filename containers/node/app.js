require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');

// ROUTERs
var indexRouter = require('./routes/index');

// VARIOUS
var db = require("./db");
const instanceID = process.env.INSTANCE;

// APP 
const http = require('http');
var app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// VIEW ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// LOGGER
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


// ROUTERS
app.use('/', indexRouter);

// 404 
app.use(function (req, res, next) {
  next(createError(404));
});

// ERROR HANDLER
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});


//START SERVER
server.listen(port, () => {
  console.log(`APP: Server listening at http://localhost:${port}`);
});

module.exports = app;

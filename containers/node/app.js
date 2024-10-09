require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');

// ROUTERs
var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var personalAreaRouter = require('./routes/personalarea');
var apiRouter = require('./routes/api');

// SESSION
const session = require("express-session");
var cookieParser = require('cookie-parser');
const http = require('http');

const Queue = require('better-queue');

// VARIOUS
const fileUpload = require('express-fileupload');
var db = require("./db");
const instanceID = process.env.INSTANCE;

// APP 
var app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;


// TCP SOCKET 
const socketIo = require('socket.io');
const io = socketIo(server);
const redis = require('socket.io-redis');
io.adapter(redis({ host: 'redis', port: 6379 }));

// STATIC
app.use('/socket.io', express.static(__dirname + '/node_modules/socket.io/client-dist/'));

app.use(fileUpload());

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
  })
);

app.use(cookieParser());
app.use((req, res, next) => {
  next();
});

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
app.use('/user', userRouter);
app.use('/personalarea', personalAreaRouter);
app.use('/api', apiRouter);

// 404 
app.use(function (req, res, next) {
  next(createError(404));
});

// HEADER SETTINGS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
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

// TCP MESSAGES SOCKET (LIVE CHAT AND BROADCAST DOC-PAT)
io.on('connection', async (socket) => { //  CONNECTION EVENT
  const userid = socket.handshake.query.userid;
  socket.join(userid); 

  try {     // GET ALL MESSAGES OF THE CONNECTED USER AND EMIT
    console.log("TCP SOCKET: Get all messages of " + userid);
    const res = await db.getMessages(userid);
    res.rows.forEach(msg => {
      socket.emit('chat message', msg); 
    });
  } catch (err) {
    console.error('TCP SOCKET: Error "GET ALL MESSAGES": ', err);
  }

  socket.on('chat message', async (msg) => {  // CHAT MESSAGE EVENT, SAVE IN DATABASE AND SEND TO RECIPIENT
    try {
      console.log("TCP SOCKET: Message request, sender:" + msg.sender + " -> recipient: " + msg.recipient);
      const res = await db.insertMessage(msg.sender, msg.recipient, msg.msg);
      msg.timestamp = new Date();
      io.to(`${msg.recipient}`).emit('chat message', msg);
      socket.emit('chat message', msg); 
    } catch (err) {
      console.error('TCP SOCKET: Error "SAVE MESSAGE": ', err);
    }
  });

  socket.on('broadcast', async (msg) => { // BROADCAST EVENT, SEND TO ALL DOCTOR'S PATIENTS
    if (msg.isdoctor) {
      try {
        console.log("TCP SOCKET: Broadcast request by " + msg.sender);
        //console.log("MESSAGGIO RICEVUTO", msg);
        const patientList = await db.getMyPatientList(msg.sender);
        //console.log("Ricevuta lista pazienti: ", patientList.rows);
        for (const x of patientList.rows) {
          //console.log("----- PAZIENTE: ", x);
          await db.insertMessage(msg.sender, x.patient, msg.msg);
          msg.timestamp = new Date();
          const message = {
            recipient: x.patient,
            msg: msg.msg,
            isdoctor: msg.isdoctor,
            timestamp: msg.timestamp,
            surname: msg.surname,
            name: msg.name,
            sender: msg.sender
          };
          io.to(`${x.patient}`).emit('chat message', message);
        }
        socket.emit('broadcast', msg);
      } catch (err) {
        console.error('TCP SOCKET: Error "BROADCAST MESSAGE": ', err);
      }
    }
  });

  socket.on('disconnect', () => {
    //console.log(`${userid} si è disconnesso`);
  });
});

module.exports = app;

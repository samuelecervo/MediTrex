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
var paxosRouter = require('./routes/paxos');
var fdRouter = require('./routes/failure-detector');

// SESSION
const session = require("express-session");
var cookieParser = require('cookie-parser');
const http = require('http');

// PAXOS
const bodyParser = require('body-parser');
const { Paxos } = require('paxos');
const Queue = require('better-queue');

// VARIOUS
const fileUpload = require('express-fileupload');
var db = require("./db");
const instanceID = process.env.INSTANCE;

// APP 
var app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const udpPort = process.env.UDP_PORT || 4000;

// UDP SOCKET 
const dgram = require('dgram');
const udpSocket = dgram.createSocket('udp4');

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
    cookie: { secure: false } // Cambia a false per sviluppo locale
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

// PAXOS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ROUTERS
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/personalarea', personalAreaRouter);
app.use('/api', apiRouter);
app.use('/paxos', paxosRouter);
app.use('/failure-detector', fdRouter);

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

// SOCKET UDP PER FAILURE DETECTOR
udpSocket.on('listening', () => {     //SET ADDRESS OF UDP SOCKET
  const address = udpSocket.address();
  console.log(`UDP SOCKET: Server UDP on ${address.address}:${address.port}`);
});

udpSocket.bind(udpPort, () => {   //BIN UDP SOCKET
  console.log(`UDP SOCKET: Socket UDP binded to ${udpPort}`);
});

// SEND DATA TO UDP SOCKET AND TO FAILURE DETECTOR DASHBOARD PAGE
function sendDataOverUDP(message, remoteHost, remotePort) { 
  io.emit('fd-info', "Sending data to " + remoteHost);
  udpSocket.send(message, 0, message.length, remotePort, remoteHost, (err) => {
    if (err) {
      io.emit('fd-info', "Error during sending UDP data to node " + remoteHost);
      console.error('UDP SOCKET: Error during sending UDP data to node ' + remoteHost);
    }
  });
}

// MESSAGE EVENT ON UDP SOCKET
udpSocket.on('message', (msg, rinfo) => {
  const parsedMsg = JSON.parse(msg.toString());
  if (parsedMsg.type === 'HEARTBEATREQUEST') {    // THE MESSAGE IS AN HEARTBEAT REQUEST
    console.log(`UDP SOCKET: HEARTBEATREQUEST from ${parsedMsg.nodeId} (${rinfo.address}:${rinfo.port})`);
    try {
      const message = Buffer.from(JSON.stringify({ type: 'HEARTBEATREPLY', nodeId: instanceID }));
      sendDataOverUDP(message, parsedMsg.nodeId, udpPort);
    } catch (e) {
      console.error('FAILURE DETECTOR: Error sending HEARTBEATREPLY:', e);
    }
  } else if (parsedMsg.type === 'HEARTBEATREPLY') {   // THE MESSAGE IS AN HEARTBEAT REPLY
    console.log(`UDP SOCKET: HEARTBEATREPLY   from ${parsedMsg.nodeId} (${rinfo.address}:${rinfo.port})`);
    if (!alive.some(aliveElem => aliveElem.id === parsedMsg.nodeId)) {
      alive.push({ id: parsedMsg.nodeId, host: parsedMsg.nodeId, port: port, udpPort: udpPort });
      const socketMsg = {
        id: parsedMsg.nodeId,
        host: parsedMsg.nodeId,
        port: 3000,
        status: 'alive'
      };
      io.emit('fd-alert', socketMsg);
    }
  } else {
    console.log("UDP SOCKET: Error, cannot read content of UDP message!");
  }
});

// UDP SOCKET ERROR HANDLER
udpSocket.on('error', (err) => {
  console.error('UDP SOCKET: Error in UDP:', err);
});

// CLOSED SOCKET EVENT HANDLER
process.on('SIGINT', () => {
  udpSocket.close(() => {
    console.log('UDP SOCKET: Socket UDP closed.');
    process.exit();
  });
});

// DEFINITION OF ALL REPLICAS
global.replicas = new Array();
for (let i=1; i<=3; i++) {
  global.replicas.push({id: 'node'+i, host: 'node'+i, port: port, udpPort: udpPort});
}

alive = global.replicas;
global.suspected = new Array();
const DELTA = parseInt(process.env.FD_DELTA);
let delay = DELTA;

function failureDetector() {
  alive.forEach(aliveElem => {
    if (global.suspected.some(x => x.id === aliveElem.id))
      delay += DELTA;
  });

  //console.log("REPLICAS: ", global.replicas);
  global.replicas.forEach(process => {
    if (!alive.some(x => x.id === process.id) && !global.suspected.some(x => x.id === process.id)) {
      global.suspected.push(process);
      const socketMsg = {
        id: process.id,
        host: process.id,
        port: 3000,
        status: 'suspected'
      };
      io.emit('fd-alert', socketMsg);
      console.log(`FAILURE DETECTOR: ${process.id} suspected!`);
    } else if (alive.some(x => x.id === process.id) && global.suspected.some(x => x.id === process.id)) {
      global.suspected = global.suspected.filter(element => element.id !== process.id);
      const socketMsg = {
        id: process.id,
        host: `node${process.id}`,
        port: 3000,
        status: 'restored'
      };
      io.emit('fd-alert', socketMsg);
      console.log(`FAILURE DETECTOR: ${process.id} restored!`);
    }

    try {
      const message = Buffer.from(JSON.stringify({ type: 'HEARTBEATREQUEST', nodeId: instanceID }));
      sendDataOverUDP(message, process.host, process.udpPort);
    } catch (e) {
      console.error('FAILURE DETECTOR: Error sending HEARTBEATREQUEST:', e);
    }
  });

  alive = [];
  setTimeout(failureDetector, delay);
}

if(process.env.FAILURE_DETECTOR === "yes")
  if(instanceID != 'MASTER')
      failureDetector();

module.exports = app;

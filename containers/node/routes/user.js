var express = require('express');
const axios = require('axios');

var router = express.Router();
var md5 = require('md5');
require('express-session');

var db = require("../db");
let Patient = require("../classes/Patient");
let Doctor = require("../classes/Doctor");

var cookieParser = require("cookie-parser");
router.use(cookieParser());

// GET LOGIN
router.get('/signin', function (req, res, next) {
  if (req.cookies.email) {  // IF THE CLIENT HAS COOKIES SETTED
    db.getUtente(req.cookies.email, req.cookies.password)   // GET USER INFO
      .then(function (data) {
        if (data.rowCount == 1) {
          console.log(data.rows);
          req.session.isLogged = true;    //  SAVE THE SESSION
          req.session.user = data.rows;
          req.session.cookie.expires = false;
          req.session.save((err) => {
            if (err) {
              console.error('Error during SignIn by cookies: ', err);
              return res.status(500).send('Internal error');
            }
            res.redirect("/personalarea");
          });
        } else {
          res.render("signin", {
            title: "MediTREX | Sign In",
          });
        }
      })
      .catch(function (err) {
        console.log("Error during SignIn by cookies: " + err);
      });
  } else {    //THE CLIENT HAS NO COOKIES
    res.render("signin", {
      title: "MediTREX | Sign In",
    });
  }
});

// POST LOGIN
router.post("/signin", function (req, res, next) {
  db.getUtente(req.body.email, md5(req.body.password)).then(data => {
    if (data.rowCount == 1) { // LOGIN SUCCESS
      if (req.body.rememberMe) {
        res.cookie('email', req.body.email);
        res.cookie('password', md5(req.body.password));
      }
      req.session.isLogged = true;  // SAVE THE SESSION
      req.session.user = data.rows;
      req.session.cookie.expires = false;
      req.session.save((err) => {
        if (err) {
          console.error('Error during the creation of the user session: ', err);
          return res.status(500).send('Internal error');
        }
        res.redirect('/personalarea');
      });
    } else {
      res.render("signin", {
        title: "MediTREX | Sign In",
        notCorrect: true,
      });
    }
  })
    .catch(function (err) {
      console.log("POST login error: " + err.stack);
    });
});


// GET SIGNUP
router.get('/signup', async function (req, res, next) {
  db.getSpecialties().then(data => {
    res.render("signup", {
      title: "MediTREX | Sign In",
      specialtyList: data.rows
    });
  }).catch(err => {
    console.log(err);
    res.render("/", {
      title: "MediTREX | ERROR"
    });
  })

});

// POST SIGNUP 
router.post('/signup', async (req, res) => {
  var user = null;

  if (req.body.isDoctor === '1') {
    user = new Doctor(
      req.body.taxidcode,
      req.body.name,
      req.body.surname,
      req.body.email,
      md5(req.body.password),
      req.body.dateofbirth,
      req.body.gender,
      req.body.medicalicenseid,
      req.body.specification
    );


  } else {
    user = new Patient(
      req.body.taxidcode,
      req.body.name,
      req.body.surname,
      req.body.email,
      md5(req.body.password),
      req.body.dateofbirth,
      req.body.gender
    );
  }

  // RUN PAXOS PROTOCOL ON SIGNUP 
  try {

    const existingUser = await db.findUserByEmail(user.email);
    if (existingUser) {
      res.render("error", {
        title: "MediTREX | Error",
        message: "Already existing email"
      });
      return;
    }

    const acceptedRequest = await runPaxosConsensus(user);

    if (acceptedRequest) {

      var newQuery = await db.insertUser(user);
      if (newQuery) {
        var newId = newQuery.rows[0].userid;
        if (!user.isDoctor) await db.createMR(newId);
        console.log('APP: User successfully registered!');
        res.redirect('signin');
        return;
      }
    }

    else {
      res.render("error", {
        title: "MediTREX | Error",
        message: "Already existing email"
      });
      return;
    }

  } catch (error) {
    console.error('Error during the signup: ', error);
    res.status(500).send('Error during the signup.');
  }
});


global.highestProposalNumber = 0;


// PAXOS PROTOCOL
async function runPaxosConsensus(user) {
  let proposalNumber = global.highestProposalNumber + 1;
  let promisesReceived = 0;
  let acceptedReceived = 0;

  // PREPARE THE PROPOSAL
  async function prepareProposal() {
    var aliveReplicas = new Array();
    global.replicas.forEach(replica => {
      if (!global.suspected.some(x => x.id === replica.id))
        aliveReplicas.push(replica);
    });
    const promises = aliveReplicas.map(async replica => {
      try {
        console.log(`PAXOS: ${process.env.INSTANCE} -> ${replica.host} | (PREPARE, ${proposalNumber})`);
        const response = await axios.post(`http://${replica.host}:${replica.port}/paxos/prepare`, {
          senderId: process.env.INSTANCE,
          proposalNumber: proposalNumber
        });
        const {
          success,
          acceptedProposalNumber
        } = response.data;

        if (success) {
          promisesReceived++;
        }

        if (global.highestProposalNumber < acceptedProposalNumber)
            global.highestProposalNumber = acceptedProposalNumber;

      } catch (error) {
        console.error(`PAXOS: error during the PROPOSE ${replica.id}:`, error.message);
      }
    });

    await Promise.all(promises);
  }

  // ACCEPT A PROPOSAL
  async function acceptProposal(proposalNumber) {
    var aliveReplicas = new Array();
    global.replicas.forEach(replica => {
      if (!global.suspected.some(x => x.id === replica.id))
        aliveReplicas.push(replica);
    });
    const acceptPromises = aliveReplicas.map(async replica => {
      try {
        console.log(`PAXOS: ${process.env.INSTANCE} -> ${replica.host} | (ACCEPT, ${proposalNumber})`);
        const response = await axios.post(`http://${replica.host}:${replica.port}/paxos/accept`, {
          senderId: process.env.INSTANCE,
          proposalNumber: proposalNumber
        });
        const {
          success,
          acceptedProposalNumber
        } = response.data;

        if (success) {
          acceptedReceived++;
        }

        if (global.highestProposalNumber < acceptedProposalNumber)
            global.highestProposalNumber = acceptedProposalNumber;

      } catch (error) {
        console.error(`PAXOS: error during the DECIDE ${replica.id}:`, error.message);
      }
    });

    await Promise.all(acceptPromises);
  }

  // DECIDE A PROPOSAL
  async function decideProposal(proposalNumber) {
    var aliveReplicas = new Array();
    global.replicas.forEach(replica => {
      if (!global.suspected.some(x => x.id === replica.id))
        aliveReplicas.push(replica);
    });
    const decidePromises = aliveReplicas.map(async replica => {
      try {
        console.log(`PAXOS: ${process.env.INSTANCE} -> ${replica.host} | (DECIDE, ${proposalNumber})`);
        const response = await axios.post(`http://${replica.host}:${replica.port}/paxos/decide`, {
          senderId: process.env.INSTANCE,
          proposalNumber: proposalNumber
        });

      } catch (error) {
        console.error(`PAXOS: error during the DECIDE ${replica.id}:`, error.message);
      }
    });

    await Promise.all(decidePromises);
  }

  // RUN THE PAXOS PROTOCOL
  await prepareProposal();

  var aliveReplicas = new Array();
  global.replicas.forEach(replica => {
    if (!global.suspected.some(x => x.id === replica.id))
      aliveReplicas.push(replica);
  });
  if (promisesReceived > aliveReplicas.length / 2) {

    await acceptProposal(proposalNumber);

    var aliveReplicas = new Array();
    global.replicas.forEach(replica => {
      if (!global.suspected.some(x => x.id === replica.id))
        aliveReplicas.push(replica);
    });

    if (acceptedReceived > aliveReplicas.length / 2) {
      await decideProposal(proposalNumber);
      return true;

    } else {
      return false;
    }
  } else {
    return false;
  }
}

//LOGOUT
router.get("/logout", function (req, res, next) {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.clearCookie('email');
      res.clearCookie('pass');
      res.redirect('/');
    }
  });
});

router.get("/error", (req, res) => res.send("error logging in"));

module.exports = router;
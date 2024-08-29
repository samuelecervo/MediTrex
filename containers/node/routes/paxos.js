const express = require('express');
const router = express.Router();

let highestProposalNumber = 0;
let lastSenderId = 0;

// PROPOSAL PREPARE
router.post('/prepare', (req, res) => {
  
  const {
    senderId,
    proposalNumber
  } = req.body;

  var tempSenderId = parseInt(senderId.split("e")[1]);
  if (proposalNumber > highestProposalNumber || proposalNumber == highestProposalNumber && tempSenderId >= lastSenderId) {
    lastSenderId = tempSenderId;
    highestProposalNumber = proposalNumber;
    global.highestProposalNumber = proposalNumber;

    console.log(`PAXOS: ${process.env.INSTANCE} -> ${senderId} | (ACK, ${proposalNumber})`);
    res.json({
      success: true,
      acceptedProposalNumber: proposalNumber,
    });


  
  } else {
    console.log(`PAXOS: ${process.env.INSTANCE} -> ${senderId} | (NACK, ${highestProposalNumber})`);
    res.json({
      success: false,
      acceptedProposalNumber: highestProposalNumber
    });
  }
});

// PROPOSAL ACCEPT
router.post('/accept', (req, res) => {
  const {
    senderId,
    proposalNumber
  } = req.body;

  var tempSenderId = parseInt(senderId.split("e")[1]);
  if (proposalNumber > highestProposalNumber || proposalNumber == highestProposalNumber && tempSenderId >= lastSenderId) {

    console.log(`PAXOS: ${process.env.INSTANCE} -> ${senderId} | (ACK, ${proposalNumber})`);
    res.json({
      success: true,
      acceptedProposalNumber: proposalNumber
    });
  
  } else {

    console.log(`PAXOS: ${process.env.INSTANCE} -> ${senderId} | (NACK, ${highestProposalNumber})`);
    res.json({
      success: false,
      acceptedProposalNumber: highestProposalNumber
    });
  }
});

// PROPOSAL DECIDE
router.post('/decide', (req, res) => {
  const {
    senderId,
    proposalNumber
  } = req.body;

  res.sendStatus(200);

});

module.exports = router;
const express = require('express');
const md5 = require('md5');
var db = require("../db");
const router = express.Router();
require('express-session');

router.get('/', async function (req, res, next) {
  if (req.session.user) {

    if (req.session.user.isdoctor) var pagina = "dashboardDoctor";
    else var pagina = "dashboardPatient";

    res.render(pagina, {
      title: "MediTREX | Dashboard",
      user: req.session.user
    });
  } else res.redirect('/');
});

router.get('/appointments', function (req, res, next) {
  if (req.session.user) {
    res.render("appointments", {
      title: "MediTREX | Appointments",
      user: req.session.user
    });
  } else res.redirect('/');
});

router.get('/medicalrecord', async function (req, res, next) {
  if (req.session.user) {
    var prescriptionsList = await db.getPrescription(req.session.user.userid);
    var gpName = await db.getGP(req.session.user.userid);

    if (gpName.rows[0])
      gpName= "Dr. " + gpName.rows[0].surname + " " + gpName.rows[0].name;
    else
      gpName = '';

    prescriptionsList.rows.map(item => item.fromdate = (new Date(item.fromdate).toISOString().split('T')[0]));
    prescriptionsList.rows.map(item => item.todate = (new Date(item.todate).toISOString().split('T')[0]));

    res.render("medicalrecord", {
      title: "MediTREX | Medical Record",
      user: req.session.user,
      prescriptions: prescriptionsList.rows,
      gpName: gpName
    });
  } else res.redirect('/');
});

router.get('/medicalrecordview', async function (req, res, next) {
  var patientId = req.query.id;
  if (req.session.user && req.session.user.isdoctor && await db.checkIfMyPatient(req.session.user.userid, patientId)) {
    var prescriptionsList = await db.getPrescription(patientId);
    var gpName = await db.getGP(patientId);
    var patientMR = await db.getMedicalRecord(patientId);

    if (gpName.rows[0])
      gpName= "Dr. " + gpName.rows[0].surname + " " + gpName.rows[0].name;
    else
      gpName = '';

    prescriptionsList.rows.map(item => item.fromdate = (new Date(item.fromdate).toISOString().split('T')[0]));
    prescriptionsList.rows.map(item => item.todate = (new Date(item.todate).toISOString().split('T')[0]));

    res.render("medicalrecordview", {
      title: "MediTREX | Medical Record",
      user: req.session.user,
      prescriptions: prescriptionsList.rows,
      gpName: gpName,
      patient: patientMR.rows[0]
    });
  } else res.redirect('/');
});

router.get('/doctors', async function (req, res, next) {
  if (req.session.user) {
    var docList = await db.getDoctorList();

    res.render("doctors", {
      title: "MediTREX | Doctors",
      user: req.session.user,
      doctors: docList.rows
    });
  } else res.redirect('/');
});

router.get('/mypatients', async function (req, res, next) {
  if (req.session.user && req.session.user.isdoctor) {
    var patList = await db.getMyPatientList(req.session.user.userid);

    res.render("mypatients", {
      title: "MediTREX | My Patients",
      user: req.session.user,
      patients: patList.rows
    });
  } else res.redirect('/');
});

router.get('/messages', function (req, res, next) {
  if (req.session.user) {
    res.render("messages", {
      title: "MediTREX | Messages",
      user: req.session.user
    });
  } else res.redirect('/');
});

router.get('/profile', function (req, res, next) {
  if (req.session.user) {
    res.render("profile", {
      title: "MediTREX | Profile",
      user: req.session.user
    });
  } else res.redirect('/');
});

router.post('/profile/updatePassword', async function (req, res, next) {
  var oldPass = md5(req.body.oldPass);
  var newPass = md5(req.body.newPass);
  var confirmPass = md5(req.body.repeatPass);
  var msg = '';
  if (confirmPass == newPass) {
    if (await db.checkPassword(req.session.user.email, oldPass)) {
      if (await db.updatePassword(req.session.user.email, newPass)) {
        msg = "Password changed!"
        req.session.user.password = newPass;
      } else
        msg = "There is a problem while changing password...";
    } else
      msg = "There is a problem while changing password, check if old password is correct...";
  }
  res.render("profile", {
    title: "MediTREX | Profile",
    user: req.session.user,
    passMsg: msg
  });
});

router.post('/profile/updateBio', async function (req, res, next) {
  var msg = "There is a problem while changing bio, try later";
  if (req.session.user.isdoctor) {
    var bio = req.body.bio;
    if (await db.updateBio(req.session.user.email, bio)) {
      msg = "Bio updated!"
      req.session.user.bio = bio;
    }
  }
  res.render("profile", {
    title: "MediTREX | Profile",
    user: req.session.user,
    bioMsg: msg
  });
});

router.post('/profile/updateAvatar', async function (req, res, next) {
  var msg = "There is a problem while changing avatar, try later";

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("Nessun file è stato caricato.");
  }

  const uploadedFile = req.files.imgFile;
  var path = '/uploads/' + uploadedFile.name;

  try {
    await uploadedFile.mv('public' + path);
    const success = await db.updateImg(req.session.user.email, path);

    if (success) {
      msg = 'File caricato con successo!';
      req.session.user.img = path;
      res.render("profile", {
        title: "MediTREX | Profile",
        user: req.session.user,
        bioMsg: msg
      });
    }
  } catch (err) {
    console.error(err);
    res.render("profile", {
      title: "MediTREX | Profile",
      user: req.session.user,
      bioMsg: msg
    });
  }
});

module.exports = router;
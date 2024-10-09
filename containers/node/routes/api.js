const express = require('express');
var db = require("../db");
const router = express.Router();
require('express-session');

router.get('/getAppointments', async function (req, res, next) {
    if (req.session.user && req.session.user.isdoctor) {
        var appointments = await db.getDoctorAppointments(req.session.user.userid, req.query.month, req.query.year);
        res.send(appointments.rows);
    } else if (req.session.user) {
        var appointments = await db.getPatientAppointments(req.session.user.userid, req.query.month, req.query.year);
        res.send(appointments.rows);
    }
});

router.get('/getAppointmentsByDate', async function (req, res, next) {
    if (req.session.user && req.session.user.isdoctor) {
        var appointments = await db.getDoctorAppointmentsByDate(req.session.user.userid, req.query.date);
        res.send(appointments.rows);
    } else if (req.session.user) {
        var appointments = await db.getPatientAppointmentsByDate(req.session.user.userid, req.query.date);
        res.send(appointments.rows);
    }
});

router.get('/addNewAppointment', async function (req, res, next) {
    if (req.session.user && req.session.user.isdoctor && await db.checkIfMyPatient(req.session.user.userid, req.query.patientId)) {
        await db.addNewAppointment(req.query.patientId, req.session.user.userid, req.query.date, req.query.time);
        res.send(true);
    }
});

router.get('/getPatientsList', async function (req, res, next) {
    if (req.session.user && req.session.user.isdoctor) {
        var patientsList = await db.getPatientsList(req.session.user.userid);
        res.send(patientsList.rows);
    }
});

router.get('/getMedicationsByPatient', async function (req, res, next) {
    if (req.session.user && req.session.user.isdoctor) {
        //Check if my patient:
        if (await db.checkIfMyPatient(req.session.user.userid, req.query.patientId)) {
            var medicationsList = await db.getMedicationsByPatient(req.query.patientId);
            res.send(medicationsList.rows);
        } else res.send(false);
    }
});

router.get('/getMedicationById', async function (req, res, next) {
    if (req.session.user && req.session.user.isdoctor) {
        //Check if my prescription:
        if (await db.checkIfMyDoctorPrescription(req.session.user.userid, req.query.prescriptionId)) {
            var medicationDetails = await db.getMedicationById(req.query.prescriptionId);
            res.send(medicationDetails.rows);
        } else res.send(false);
    }
});

router.get('/getMedicationsByPatientAndDate', async function (req, res, next) {
    if (req.session.user && req.session.user.isdoctor) {
        //Check if my patient:
        if (await db.checkIfMyPatient(req.session.user.userid, req.query.patientId)) {
            var medicationsList = await db.getMedicationsByPatientAndDate(req.query.patientId, req.query.currentDate);
            res.send(medicationsList.rows);
        } else res.send(false);
    } else if (req.session.user) {
        var medicationsList = await db.getMedicationsByPatientAndDate(req.session.user.userid, req.query.currentDate);
        res.send(medicationsList.rows);
    }
});

router.get('/getSymptomsByPatientAndDate', async function (req, res, next) {
    if (req.session.user && req.session.user.isdoctor) {
        //Check if my patient:
        if (await db.checkIfMyPatient(req.session.user.userid, req.query.patientId)) {
            var sypmtomsRes = await db.getSymptomsByPatientAndDate(req.query.patientId, req.query.currentDate);
            res.send(sypmtomsRes.rows);
        } else res.send(false);
    } else if (req.session.user) {
        var sypmtomsRes = await db.getSymptomsByPatientAndDate(req.session.user.userid, req.query.currentDate);
        res.send(sypmtomsRes.rows);
    }
});

router.get('/addPrescription', async function (req, res, next) {
    if (req.session.user && req.session.user.isdoctor) {
        if (await db.checkIfMyPatient(req.session.user.userid, req.query.patientId)) {
            if (req.query.prescriptionId == 0 && !await db.checkAlreadyExistsPrescription(req.query.medication, req.query.patientId, req.query.startingdate, req.query.endingdate)) {
                var addPrescriptionResult = await db.addPrescription(req.session.user.userid, req.query.patientId, req.query.medication, req.query.startingdate, req.query.endingdate, req.query.frequency, req.query.time);
                res.send(addPrescriptionResult);
            } else if (req.query.prescriptionId != 0 && await db.checkIfMyDoctorPrescription(req.session.user.userid, req.query.prescriptionId)) {
                var editPrescriptionResult = await db.editPrescription(req.query.prescriptionId, req.query.medication, req.query.startingdate, req.query.endingdate, req.query.frequency, req.query.time);
                res.send(editPrescriptionResult);
            } else res.send(false);
        } else res.send(false);
    }
});

router.get('/deletePrescription', async function (req, res, next) {
    if (req.session.user && req.session.user.isdoctor && await db.checkIfMyDoctorPrescription(req.session.user.userid, req.query.prescriptionId)) {
        var deletePrescriptionResult = await db.deletePrescription(req.query.prescriptionId);
        res.send(deletePrescriptionResult);
    } else if (req.session.user) res.send(false);
});

router.get('/changeMedicationChecker', async function (req, res, next) {
    if (req.session.user && !req.session.user.isdoctor) {
        //check it's my prescription and all data is ok
        if (await db.checkIfMyPrescription(req.session.user.userid, req.query.prescriptionId) && await db.checkValidPrescription(req.session.user.userid, req.query.prescriptionId, req.query.currentDate, req.query.occurrence)) {
            if (req.query.method === 'create')
                await db.checkMedication(req.query.prescriptionId, req.query.currentDate, req.query.occurrence);
            else if (req.query.method === 'delete')
                await db.uncheckMedication(req.query.takenprescriptionId);
        }
        res.send(true);
    }
});

router.get('/changeAppointmentChecker', async function (req, res, next) {
    if (req.session.user && req.session.user.isdoctor) {
        //check it's my prescription and all data is ok
        if (await db.checkIfMyAppointment(req.session.user.userid, req.query.appId)) {
            console.log("DENTRO");
            await db.changeAppointmentChecker(req.query.appId, req.query.newChecked);
        }
        res.send(true);
    }
});

router.get('/changeSymptoms', async function (req, res, next) {
    if (req.session.user && !req.session.user.isdoctor) {
        await db.changeSymptoms(req.session.user.userid, req.query.currentDate, req.query.newText);
        res.send(true);
    }
});

router.get('/getMedicalRecord', async function (req, res, next) {
    if (req.session.user && !req.session.user.isdoctor) {
        var mr = await db.getMedicalRecord(req.session.user.userid);
        res.send(mr.rows);
    } else if (req.session.user) {
        var mr = await db.getMedicalRecord(req.query.patientId);
        res.send(mr.rows);
    }
});

router.get('/changeMR', async function (req, res, next) {
    if (req.session.user && !req.session.user.isdoctor) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if ([0, 1, 2, 3].includes(parseInt(req.query.newSmoke)) && [0, 1, 2, 3].includes(parseInt(req.query.newDrugs)) && [0, 1, 2, 3].includes(parseInt(req.query.newAlcohol)) && regex.test(req.query.currentDate)) {
            await db.changeMedicalRecord(req.session.user.userid, req.query.newMH, req.query.newALL, req.query.newSmoke, req.query.newDrugs, req.query.newAlcohol);
            await db.changeSymptoms(req.session.user.userid, req.query.currentDate, req.query.newCS);
            res.send(true);
        }
    }
});

router.get('/addRequest', async function (req, res, next) {
    if (req.session.user && !req.session.user.isdoctor) {
        if (!await db.checkInTreatment(req.session.user.userid, req.query.doctorId))
            if (await db.insertInTreatment(req.session.user.userid, req.query.doctorId))
                res.send([{
                    'result': 'ok'
                }]);
            else res.send([{
                'result': 'Impossible to add intreatment, retry'
            }]);
        else res.send([{
            'result': 'This intreatment exists'
        }]);
    } else res.send([{
        'result': "you can't"
    }]);
});

router.get('/addGPRequest', async function (req, res, next) {
    if (req.session.user && !req.session.user.isdoctor)
        if (await db.checkInTreatment(req.session.user.userid, req.query.doctorId) && !await db.checkGP(req.session.user.userid, req.query.doctorId))
            if (await db.insertGP(req.session.user.userid, req.query.doctorId)) {
                res.send(true);
            }

});

router.get('/acceptInTreatment', async function (req, res, next) {
    try {
        if (req.session.user && req.session.user.isdoctor) {
            await db.acceptInTreatment(req.query.patientid, req.session.user.userid);
            res.send(true);
        } else res.send(false);
    } catch (e) {
        console.log("ERRORE ACCEPT INTREATMENT ", req.session)
    }
});

router.get('/checkInTreatment', async function (req, res, next) {
    if (req.session.user) {
        //console.log("QUERY: " + req.query.other + " - " + req.session.user.userid);
        if (await db.checkInTreatment(req.query.other, req.session.user.userid))
            return res.send(true);
        return res.send(false);
    } else return res.send(false);
});

router.get('/getInTreatment', async function (req, res, next) {
    if (req.session.user) {
        var result = await db.getInTreatment(req.session.user.userid);
        return res.send(result.rows);
    } else return res.send([]);
});

router.get('/declineInTreatment', async function (req, res, next) {
    if (req.session.user && req.session.user.isdoctor) {
        await db.declineInTreatment(req.query.patientid, req.session.user.userid);
        res.send(true);
    }
});

router.get('/removeInTreatment', async function (req, res, next) {
    if (req.session.user && req.session.user.isdoctor) {
        await db.removeInTreatment(req.query.patientid, req.session.user.userid);
        res.send(true);
    }
});

router.get('/acceptGP', async function (req, res, next) {
    if (req.session.user && req.session.user.isdoctor && await db.checkGP(req.query.patientid, req.session.user.userid)) {
        await db.deleteAllGP(req.query.patientid);
        await db.acceptGP(req.query.patientid, req.session.user.userid);
        res.send(true);
    } else res.send(false);
});

module.exports = router;
require('dotenv').config();
const {Client} = require('pg')

const client = new Client({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_DATABASE,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT
});

client.connect();

class functions {
  static getSpecialties() {
    return new Promise((resolve, reject) => {
      client.query("SELECT * FROM Specialties", (err, res) => {
        if (err) {
          console.log("DB: Error in getSpecialties: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static updatePassword(user, pass) {
    return new Promise((resolve, reject) => {
      client.query("UPDATE Users SET password = $1 WHERE email = $2", [pass, user], (err, res) => {
        if (err) {
          console.log("DB: Error in updatePassword: " + err);
          return reject(err);
        }
        resolve(res.rowCount > 0);
      });
    });
  }

  static updateBio(user, bio) {
    return new Promise((resolve, reject) => {
      client.query("UPDATE Users SET bio = $1 where email = $2", [bio, user], (err, res) => {
        if (err) {
          console.log("DB: Error in updateBio: " + err);
          return reject(err);
        }
        resolve(res.rowCount > 0);
      });
    });
  }

  static updateImg(user, path) {
    return new Promise((resolve, reject) => {
      client.query("UPDATE Users SET img = $1 where email = $2", [path, user], (err, res) => {
        if (err) {
          console.log("DB: Error in updateImg: " + err);
          return reject(err);
        }
        resolve(res.rowCount > 0);
      });
    });
  }

  static findUserByEmail(email) {
    return new Promise((resolve, reject) => {
      client.query("SELECT * FROM Users WHERE email = $1", [email], (err, res) => {
        if (err) {
          console.log("DB: Error in insertUser: " + err);
          return reject(err);
        }
        resolve(res.rowCount > 0);
      })
    });
  }

  static insertUser(newUser) {
    return new Promise((resolve, reject) => {
      client.query("INSERT INTO Users (taxId, name, surname, email, password, dateOfBirth, gender, isDoctor, medicalLicenseId, specialty) VALUES (" + newUser.toQuery() + ") RETURNING userid", (err, res) => {
        if (err) {
          console.log("DB: Error in insertUser: " + err);
          return reject(err);
        }
        resolve(res);
      })
    });
  }

  static createMR(patientId) {
    return new Promise((resolve, reject) => {
      client.query("INSERT INTO MedicalRecord (patient) VALUES ($1)", [patientId], (err, res) => {
        if (err) {
          console.log("DB: Error in createMR: " + err);
          return reject(err);
        }
        resolve(true);
      });
    });
  }

  static getUtente(username, pass) {
    return new Promise((resolve, reject) => {
      client.query("SELECT * " +
        "FROM Users u " +
        "LEFT JOIN Specialties s ON u.specialty = s.specialtyId " +
        "WHERE u.email = $1 AND u.password = $2", [username, pass], (err, res) => {
          if (err) {
            console.log("DB: Error in getUtente: " + err);
            return reject(err);
          }
          resolve(res);
        });
    });
  }

  static checkPassword(user, pass) {
    return new Promise((resolve, reject) => {
      client.query("SELECT * FROM Users WHERE email = $1 AND password = $2", [user, pass], (err, res) => {
        if (err) {
          console.log("DB: Error in checkPassword: " + err);
          return reject(err);
        }
        resolve(res.rowCount === 1);
      });
    });
  }

  static checkIfMyPatient(doctorId, patientId) {
    return new Promise((resolve, reject) => {
      client.query("SELECT * FROM InTreatment WHERE doctor = $1 AND patient = $2 AND pending = false", [doctorId, patientId], (err, res) => {
        if (err) {
          console.log("DB: Error in checkIfMyPatient: " + err);
          return reject(err);
        }
        resolve(res.rowCount > 0);
      });
    });
  }

  static checkInTreatment(id1, id2) {
    return new Promise((resolve, reject) => {
      client.query("SELECT * FROM InTreatment WHERE (doctor = $1 AND patient = $2) or (doctor = $2 AND patient = $1)", [id1, id2], (err, res) => {
        if (err) {
          console.log("DB: Error in checkInTreatment: " + err);
          return reject(err);
        }
        resolve(res.rowCount > 0);
      });
    });
  }

  static getGP(patientId) {
    return new Promise((resolve, reject) => {
      client.query("SELECT name, surname FROM Users u JOIN InTreatment i ON i.doctor=u.userid WHERE i.patient = $1 AND i.gp = 2", [patientId], (err, res) => {
        if (err) {
          console.log("DB: Error in getGP: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static checkGP(id1, id2) {
    return new Promise((resolve, reject) => {
      client.query("SELECT * FROM InTreatment WHERE gp > 0 AND (doctor = $1 AND patient = $2 or doctor = $2 AND patient = $1)", [id1, id2], (err, res) => {
        if (err) {
          console.log("DB: Error in checkGP: " + err);
          return reject(err);
        }
        resolve(res.rowCount > 0);
      });
    });
  }

  static deleteAllGP(patientId) {
    return new Promise((resolve, reject) => {
      client.query("UPDATE InTreatment SET gp = 0 WHERE patient = $1", [patientId], (err, res) => {
        if (err) {
          console.log("DB: Error in deleteAllGP: " + err);
          return reject(err);
        }
        resolve(true);
      });
    });
  }

  static acceptGP(patient, doctor) {
    return new Promise((resolve, reject) => {
      client.query("UPDATE InTreatment SET gp = 2 WHERE patient = $1 AND doctor = $2", [patient, doctor], (err, res) => {
        if (err) {
          console.log("DB: Error in acceptGP: " + err);
          return reject(err);
        }
        resolve(true);
      });
    });
  }

    static checkIfMyPrescription(patientId, prescriptionId){
      return new Promise((resolve, reject) => {
        client.query("SELECT * FROM prescriptions WHERE patient = $1 AND prescriptionId = $2", [patientId, prescriptionId], (err, res) => {
          if (err) {
            console.log("DB: Error in checkIfMyPrescription: " + err);
            return reject(err);
          }
          resolve(res.rowCount > 0);
        });
      });
    }
  

  static checkIfMyDoctorPrescription(doctorId, prescriptionId) {
    return new Promise((resolve, reject) => {
      client.query("SELECT * FROM Prescriptions WHERE doctor = $1 AND prescriptionId = $2", [doctorId, prescriptionId], (err, res) => {
        if (err) {
          console.log("DB: Error in checkIfMyDoctorPrescription: " + err);
          return reject(err);
        }
        resolve(res.rowCount > 0);
      });
    });
  }

  static checkValidPrescription(patientId, prescriptionId, currentDate, occurrence) {
    return new Promise((resolve, reject) => {
      client.query("SELECT * FROM Prescriptions WHERE patient = $1 AND prescriptionId = $2 AND fromdate <= $3 AND todate >= $3 AND frequency >= $4", [patientId, prescriptionId, currentDate, occurrence], (err, res) => {
        if (err) {
          console.log("DB: Error in checkIfMyPrescription: " + err);
          return reject(err);
        }
        resolve(res.rowCount > 0);
      });
    });
  }

  static checkAlreadyExistsPrescription(medication, patient, newFromdate, newTodate) {
    return new Promise((resolve, reject) => {
      client.query("SELECT * FROM Prescriptions WHERE (medication = $1 AND patient = $2 AND (fromdate >= $3 AND fromdate <= $4 OR todate >= $3 AND todate <= $4) )", [medication, patient, newFromdate, newTodate], (err, res) => {
        if (err) {
          console.log("DB: Error in checkAlreadyExistsPrescription: " + err);
          return reject(err);
        }
        resolve(res.rowCount > 0);
      });
    });
  }

  static addNewAppointment(patientId, doctorId, date, time) {
    return new Promise((resolve, reject) => {
      client.query("INSERT INTO Appointments(patient, doctor, date, time) VALUES ($1, $2, $3, $4)", [patientId, doctorId, date, time], (err, res) => {
        if (err) {
          console.log("DB: Error in addNewAppointment: " + err);
          return reject(err);
        }
        resolve(true);
      });
    });
  }

  static getDoctorAppointments(doctorId, month, year) {
    return new Promise((resolve, reject) => {
      client.query("SELECT a.*, u.name, u.surname FROM Appointments a JOIN Users u ON a.patient=u.userId WHERE doctor = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date)= $3", [doctorId, month, year], (err, res) => {
        if (err) {
          console.log("DB: Error in getDoctorAppointments: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static getPatientAppointments(patientId, month, year) {
    return new Promise((resolve, reject) => {
      client.query("SELECT a.*, u.name, u.surname FROM Appointments a JOIN Users u ON a.doctor=u.userId WHERE a.patient = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date)= $3", [patientId, month, year], (err, res) => {
        if (err) {
          console.log("DB: Error in getDoctorAppointments: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static getDoctorAppointmentsByDate(doctorId, date) {
    return new Promise((resolve, reject) => {
      client.query("SELECT a.*, u.name, u.surname FROM Appointments a JOIN Users u ON a.patient=u.userId WHERE doctor = $1 AND date = $2", [doctorId, date], (err, res) => {
        if (err) {
          console.log("DB: Error in getDoctorAppointmentsByDate: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static getPatientAppointmentsByDate(patientId, date) {
    return new Promise((resolve, reject) => {
      client.query("SELECT a.*, u.name, u.surname FROM Appointments a JOIN Users u ON a.doctor=u.userId WHERE patient = $1 AND date = $2", [patientId, date], (err, res) => {
        if (err) {
          console.log("DB: Error in getPatientAppointmentsByDate: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static checkIfMyAppointment(doctorId, appId) {
    return new Promise((resolve, reject) => {
      client.query("SELECT * FROM Appointments WHERE doctor = $1 AND appointmentid = $2", [doctorId, appId], (err, res) => {
        if (err) {
          console.log("DB: Error in checkIfMyAppointment: " + err);
          return reject(err);
        }
        resolve(res.rowCount > 0);
      });
    });
  }

  static changeAppointmentChecker(appId, newChecked) {
    return new Promise((resolve, reject) => {
      client.query("UPDATE Appointments SET visited = $1 WHERE appointmentId = $2", [newChecked, appId], (err, res) => {
        if (err) {
          console.log("DB: Error in changeAppointmentChecker: " + err);
          return reject(err);
        }
        resolve(true);
      });
    });
  }

  static getPatientsList(doctorId) {
    return new Promise((resolve, reject) => {
      client.query("SELECT u.* FROM InTreatment i JOIN Users u ON i.patient=u.userId WHERE i.doctor= $1 AND pending=false", [doctorId], (err, res) => {
        if (err) {
          console.log("DB: Error in getPatientsList: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static getDoctorList() {
    return new Promise((resolve, reject) => {
      client.query("SELECT * FROM Users u, Specialties s WHERE u.isDoctor=true AND u.specialty = s.specialtyId ORDER BY u.surname", (err, res) => {
        if (err) {
          console.log("DB: Error in getDoctorList: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static getMyPatientList(doctorId) {
    return new Promise((resolve, reject) => {
      client.query("SELECT * FROM InTreatment i JOIN Users u ON i.patient=u.userid WHERE i.doctor = $1 ORDER BY u.surname", [doctorId], (err, res) => {
        if (err) {
          console.log("DB: Error in getDoctorList: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static getMedicationById(prescriptionId) {
    return new Promise((resolve, reject) => {
      client.query("SELECT * FROM Prescriptions WHERE prescriptionId= $1", [prescriptionId], (err, res) => {
        if (err) {
          console.log("DB: Error in getMedicationById: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static getMedicationsByPatient(patientId) {
    return new Promise((resolve, reject) => {
      client.query("SELECT * FROM Prescriptions WHERE patient= $1", [patientId], (err, res) => {
        if (err) {
          console.log("DB: Error in getMedicationsByPatient: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static getMedicationsByPatientAndDate(patientId, currentDate) {
    return new Promise((resolve, reject) => {
      client.query("SELECT p.*, t.takenprescriptionId, t.taken, t.occurrence FROM Prescriptions p LEFT JOIN TakenPrescriptions t ON p.prescriptionId = t.prescription AND t.date = $2 WHERE p.patient = $1 AND p.fromdate <= $2 AND p.todate >= $2 ORDER BY p.time, t.occurrence, p.medication", [patientId, currentDate], (err, res) => {
        if (err) {
          console.log("DB: Error in getMedicationsByPatientAndDate: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static getSymptomsByPatientAndDate(patientId, currentDate) {
    return new Promise((resolve, reject) => {
      client.query("SELECT description FROM Symptoms WHERE patient = $1 AND date = $2", [patientId, currentDate], (err, res) => {
        if (err) {
          console.log("DB: Error in getSymptomsByPatientAndDate: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static getPrescription(userId) {
    return new Promise((resolve, reject) => {
      client.query("SELECT * FROM Prescriptions p, Users u WHERE patient = $1 and u.userId = p.doctor order by fromdate ", [userId], (err, res) => {
        if (err) {
          console.log("DB: Error in getPrescription: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static addPrescription(userId, patientId, medication, startingDate, endingDate, frequency, time) {
    return new Promise((resolve, reject) => {
      if (frequency == 0) time = null;
      client.query("INSERT INTO Prescriptions(medication, patient, doctor, fromdate, todate, frequency, time) VALUES ($1, $2, $3, $4, $5, $6, $7)", [medication, patientId, userId, startingDate, endingDate, frequency, time], (err, res) => {
        if (err) {
          console.log("DB: Error in addPrescription: " + err);
          return reject(err);
        }
        resolve(true);
      });
    });
  }

  static editPrescription(prescriptionId, medication, startingDate, endingDate, frequency, time) {
    return new Promise((resolve, reject) => {
      if (frequency == 0) time = null;
      client.query("UPDATE Prescriptions SET medication = $2, fromdate = $3, todate = $4, frequency = $5, time = $6 WHERE prescriptionId = $1", [prescriptionId, medication, startingDate, endingDate, frequency, time], (err, res) => {
        if (err) {
          console.log("DB: Error in editPrescription: " + err);
          return reject(err);
        }
        resolve(true);
      });
    });
  }

  static deletePrescription(prescriptionId) {
    return new Promise((resolve, reject) => {
      client.query("DELETE FROM Prescriptions WHERE prescriptionId = $1", [prescriptionId], (err, res) => {
        if (err) {
          console.log("DB: Error in deletePrescription: " + err);
          return reject(err);
        }
        resolve(true);
      });
    });
  }

  static checkMedication(prescriptionId, currentDate, occurrence) {
    return new Promise((resolve, reject) => {
      client.query("INSERT INTO TakenPrescriptions(prescription, date, occurrence, taken) VALUES ($1, $2, $3, true)", [prescriptionId, currentDate, occurrence], (err, res) => {
        if (err) {
          console.log("DB: Error in checkMedication: " + err);
          return reject(err);
        }
        resolve(true);
      });
    });
  }

  static uncheckMedication(takenprescriptionId) {
    return new Promise((resolve, reject) => {
      client.query("DELETE FROM TakenPrescriptions WHERE takenprescriptionId = $1", [takenprescriptionId], (err, res) => {
        if (err) {
          console.log("DB: Error in uncheckMedication: " + err);
          return reject(err);
        }
        resolve(true);
      });
    });
  }

  static changeSymptoms(patientId, currentDate, newText) {
    return new Promise((resolve, reject) => {
      client.query("INSERT INTO Symptoms(patient, date, description) VALUES ($1, $2, $3) ON CONFLICT (patient, date) DO UPDATE SET description = $3", [patientId, currentDate, newText], (err, res) => {
        if (err) {
          console.log("DB: Error in changeSymptoms: " + err);
          return reject(err);
        }
        resolve(true);
      });
    });
  }

  static getMedicalRecord(userId) {
    return new Promise((resolve, reject) => {
      client.query("SELECT m.*, u.*, s.description AS symptoms FROM MedicalRecord m JOIN Users u ON m.patient=u.userId LEFT JOIN Symptoms s ON m.patient=s.patient AND s.date=CURRENT_DATE WHERE m.patient = $1", [userId], (err, res) => {
        if (err) {
          console.log("DB: Error in getMedicalRecord: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static changeMedicalRecord(patientId, newMH, newALL, newSmoke, newDrugs, newAlcohol) {
    return new Promise((resolve, reject) => {
      client.query("UPDATE MedicalRecord SET medicalHistory = $2, allergies = $3, smoke = $4, drugs = $5, alcohol = $6 WHERE patient = $1", [patientId, newMH, newALL, newSmoke, newDrugs, newAlcohol], (err, res) => {
        if (err) {
          console.log("DB: Error in changeMedicalRecord: " + err);
          return reject(err);
        }
        resolve(true);
      });
    });
  }


    static getMessages(userId){
      console.log("GET MESSAGES: " + userId);
      return new Promise((resolve, reject) => {
        client.query("SELECT  sender, recipient, msg, timestamp, name, surname, pending, gp FROM"+
                      " (SELECT * FROM Messages m, Users u "+
                      " WHERE ((sender = $1 and m.recipient = u.userid) or (recipient = $1 and u.userid = m.sender)) order by timestamp) t"+
                      " left join intreatment i"+
                      " on (patient = sender and doctor = recipient) or (patient = recipient and doctor = sender)", [userId], (err, res) => {
          if (err) {
            console.log("DB: Error in getMessages: " + err);
            return reject(err);
          }
          resolve(res);
        });
    });
  }

  static insertMessage(sender, recipient, msg) {
    return new Promise((resolve, reject) => {
      client.query("INSERT INTO Messages (sender, recipient, msg) VALUES ($1, $2, $3)", [sender, recipient, msg], (err, res) => {
        if (err) {
          console.log("DB: Error in insertMessage: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static insertInTreatment(patient, doctor) {
    return new Promise((resolve, reject) => {
      client.query("INSERT INTO InTreatment (patient, doctor) VALUES ($1, $2) ON CONFLICT DO NOTHING", [patient, doctor], (err, res) => {
        if (err) {
          console.log("DB: Error in insertInTreatment: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static insertGP(patient, doctor) {
    return new Promise((resolve, reject) => {
      client.query("UPDATE InTreatment SET gp = 1 WHERE patient = $1 AND doctor = $2", [patient, doctor], (err, res) => {
        if (err) {
          console.log("DB: Error in insertGP: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static getInTreatment(patient) {
    return new Promise((resolve, reject) => {
      client.query("SELECT * FROM InTreatment WHERE patient = $1", [patient], (err, res) => {
        if (err) {
          console.log("DB: Error in getInTreatment: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static acceptInTreatment(patient, doctor) {
    return new Promise((resolve, reject) => {
      client.query("UPDATE InTreatment SET pending=false WHERE doctor = $2 and patient = $1", [patient, doctor], (err, res) => {
        if (err) {
          console.log("DB: Error in acceptInTreatment: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static declineInTreatment(patient, doctor) {
    return new Promise((resolve, reject) => {
      client.query("DELETE FROM InTreatment WHERE doctor = $2 and patient = $1", [patient, doctor], (err, res) => {
        if (err) {
          console.log("DB: Error in declineInTreatment: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static removeInTreatment(patient, doctor) {
    return new Promise((resolve, reject) => {
      client.query("DELETE FROM InTreatment WHERE doctor = $2 and patient = $1", [patient, doctor], (err, res) => {
        if (err) {
          console.log("DB: Error in declineInTreatment: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

  static deleteConversation(user1, user2) {
    return new Promise((resolve, reject) => {
      client.query("DELETE FROM Messages WHERE (sender = $1 AND recipient = $2) OR (sender = $2 AND recipient = $1)", [user1, user2], (err, res) => {
        if (err) {
          console.log("DB: Error in deleteConversation: " + err);
          return reject(err);
        }
        resolve(res);
      });
    });
  }

}

module.exports = functions;
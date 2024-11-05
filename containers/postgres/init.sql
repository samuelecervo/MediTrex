DO $$
BEGIN
    CREATE TYPE gender_type AS ENUM ('M', 'F', 'O');
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Il tipo gender_type esiste già.';
END $$;

CREATE TABLE IF NOT EXISTS Specialties (
  specialtyId SERIAL PRIMARY KEY,
  specialtyName VARCHAR(30) NOT NULL,
  description text NOT NULL
);

CREATE TABLE IF NOT EXISTS Users (
  userId SERIAL PRIMARY KEY,
  taxId VARCHAR(16) NOT NULL,
  name VARCHAR(30) NOT NULL,
  surname VARCHAR(30) NOT NULL,
  email VARCHAR(30) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  dateOfBirth DATE NOT NULL,
  gender gender_type NOT NULL,
  isDoctor boolean,
  medicalLicenseId VARCHAR(20) DEFAULT NULL,
  specialty INT DEFAULT NULL,
  FOREIGN KEY (specialty) REFERENCES Specialties(specialtyId),
  bio VARCHAR(100) DEFAULT NULL,
  img VARCHAR(100) DEFAULT 'https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png'
);

CREATE TABLE IF NOT EXISTS InTreatment (
  inTreatmentId SERIAL PRIMARY KEY,
  patient INT NOT NULL,
  doctor INT NOT NULL,
  pending boolean default true,
  gp INT default 0,
  FOREIGN KEY (patient) REFERENCES Users(userId),
  FOREIGN KEY (doctor) REFERENCES Users(userId),
  UNIQUE(patient, doctor)
);

CREATE TABLE IF NOT EXISTS Appointments (
  appointmentId SERIAL PRIMARY KEY,
  patient INT NOT NULL,
  doctor INT NOT NULL,
  FOREIGN KEY (patient) REFERENCES Users(userId),
  FOREIGN KEY (doctor) REFERENCES Users(userId),
  date DATE NOT NULL,
  time TIME NOT NULL,
  visited boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS Prescriptions (
  prescriptionId SERIAL PRIMARY KEY,
  medication VARCHAR(30) NOT NULL,
  patient INT NOT NULL,
  doctor INT NOT NULL,
  FOREIGN KEY (patient) REFERENCES Users(userId),
  FOREIGN KEY (doctor) REFERENCES Users(userId),
  fromdate DATE NOT NULL,
  todate DATE NOT NULL,
  frequency INT NOT NULL,
  time TIME DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS TakenPrescriptions (
  takenprescriptionId SERIAL PRIMARY KEY,
  prescription INT NOT NULL,
  FOREIGN KEY (prescription) REFERENCES Prescriptions(prescriptionId) ON DELETE CASCADE,
  date DATE NOT NULL,
  occurrence INTEGER DEFAULT NULL,
  taken BOOLEAN NOT NULL DEFAULT true,
  taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS Symptoms (
  symptomId SERIAL PRIMARY KEY,
  patient INT NOT NULL,
  FOREIGN KEY (patient) REFERENCES Users(userId),
  date DATE NOT NULL,
  description VARCHAR(100) DEFAULT NULL,
  CONSTRAINT unique_symptom UNIQUE (patient, date)
);

CREATE TABLE IF NOT EXISTS MedicalRecord (
  medicalRecordId SERIAL PRIMARY KEY,
  patient INT NOT NULL,
  FOREIGN KEY (patient) REFERENCES Users(userId),
  medicalHistory VARCHAR(100) DEFAULT '',
  allergies VARCHAR(100) DEFAULT '',
  smoke INT DEFAULT 0,
  drugs INT DEFAULT 0,
  alcohol INT DEFAULT 0,
  UNIQUE(patient)
);

CREATE TABLE Messages (
    msgId SERIAL PRIMARY KEY,
    sender INT NOT NULL,
    recipient INT NOT NULL,
    msg TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender) REFERENCES Users(userId),
    FOREIGN KEY (recipient) REFERENCES Users(userId)
);


INSERT INTO Specialties (specialtyName, description) VALUES
('General', 'General Medicine'),
('Cardiology', 'Cardiology is a medical specialty that deals with the study, diagnosis, and treatment of heart diseases and disorders of the cardiovascular system.'),
('Dermatology', 'Dermatology is the medical specialty that focuses on the diagnosis and treatment of skin, hair, and nail diseases.'),
('Endocrinology', 'Endocrinology is the branch of medicine that studies endocrine glands and hormones, and treats hormonal disorders such as diabetes and thyroid diseases.'),
('Gastroenterology', 'Gastroenterology involves the diagnosis and treatment of diseases of the digestive system, including the esophagus, stomach, intestines, liver, pancreas, and biliary system.'),
('Neurology', 'Neurology is the medical specialty that deals with diseases and disorders of the central and peripheral nervous system, including the brain and spinal cord.'),
('Oncology', 'Oncology is the branch of medicine that deals with the prevention, diagnosis, and treatment of cancer.'),
('Orthopedics', 'Orthopedics is the medical specialty that treats disorders of the musculoskeletal system, including bones, joints, ligaments, tendons, and muscles.'),
('Pediatrics', 'Pediatrics is the medical specialty dedicated to the health and diseases of infants, children, and adolescents.'),
('Psychiatry', 'Psychiatry is the medical specialty that deals with the diagnosis, treatment, and prevention of mental, emotional, and behavioral disorders.'),
('Radiology', 'Radiology is the branch of medicine that uses imaging techniques to diagnose and treat diseases. It includes X-rays, CT scans, MRIs, and ultrasounds.'),
('Urology', 'Urology is the medical specialty that deals with diseases and disorders of the male and female urinary tract and the male reproductive system.');

INSERT INTO Users (taxId, name, surname, email, password, dateOfBirth, gender, isDoctor, medicalLicenseId, specialty, bio) VALUES
('RLNNDR44L44L444K', 'Andrea', 'Orlandi', 'andrea@meditrex.it', '202cb962ac59075b964b07152d234b70', '1999/04/14', 'M', '1', 'SonoUnDottore', 1, 'la mia bio'),
('CRVSML33L33L333K', 'Samuele', 'Cervo', 'samuele@meditrex.it', '202cb962ac59075b964b07152d234b70', '2000/07/12', 'M', '0', null, null, null),
('CPPGSN77L77L777K', 'Agnese', 'Capparelli', 'agnese@meditrex.it', '202cb962ac59075b964b07152d234b70', '1999/06/10', 'F', '1', 'SonoUnDottore', 6,'la bio'),
('LDTRSP22L22L222K', 'Rosapia', 'Laudati', 'rosapia@meditrex.it', '202cb962ac59075b964b07152d234b70', '2000/03/13', 'F', '0', null, null, null),
('VRDLGI00L00L000K', 'Luigi', 'Verdi', 'pat@meditrex.it', '202cb962ac59075b964b07152d234b70', '1999/06/10', 'M', '0', null, null, null),
('RSSGLI11L11L111K', 'Giulia', 'Rossi', 'doc@meditrex.it', '202cb962ac59075b964b07152d234b70', '1999/06/10', 'F', '1', 'SonoUnDottore', 8, 'bio');

INSERT INTO Appointments (patient, doctor, date, time, visited) VALUES
(5, 6, '2024-06-23', '15:30:00', false),
(5, 1, '2024-07-12', '17:00:00', false),
(5, 3, '2024-07-15', '11:30:00', false),
(1, 2, '2024-06-25', '14:00:00', true);

INSERT INTO Prescriptions (medication, patient, doctor, fromdate, todate, frequency, time) VALUES
('Paracetamol', 5, 6, '2024-11-05', '2024-11-08', 2, '9:00:00'),
('Augumentin', 5, 6, '2024-11-03', '2024-11-09', 1, '10:00:00'),
('Brufen', 2, 1, '2024-06-18', '2024-07-14', 1, '09:30:00');

INSERT INTO InTreatment (patient, doctor, pending, gp) VALUES
(5, 6, false, 0),
(4, 6, false, 0),
(2, 1, false, 0),
(2, 6, true, 0),
(2, 3, true, 0);

INSERT INTO Messages (sender, recipient, msg) VALUES
(5, 6, 'Hello!'),
(4, 6, 'Hello!'),
(2, 1, 'Hello!'),
(2, 6, 'Hello!'),
(2, 3, 'Hello!');

INSERT INTO Symptoms (patient, date, description) VALUES
(5, '2024-06-18', 'Dizziness'),
(2, '2024-06-22', 'Headache'),
(4, '2024-06-25', 'Stomacache'),
(4, '2024-06-24', 'Fever'),
(2, '2024-06-29', 'Dizziness'),
(2, '2024-07-02', 'Fever'),
(2, '2024-07-05', 'Stomacache'),
(2, '2024-07-10', 'Dizziness'),
(5, '2024-06-29', 'Stomacache');

INSERT INTO MedicalRecord (patient, medicalHistory, allergies, smoke, drugs, alcohol) VALUES
(2, 'Asthma, Cancer', 'Pollen', 0, 2, 3),
(4, 'Cardiac Disease', 'Dust, Pet', 1, 1, 0),
(5, 'Diabets', 'Nickel', 0, 3, 1);
let User = require("./User");

class Doctor extends User {
    constructor(taxId, name, surname, email, password, dateofbirth, gender, medicallicenseid, specialty) {
        super(taxId, name, surname, email, password, dateofbirth, gender);
        this.medicallicenseid = medicallicenseid;
        this.specialty = specialty;
    }

    toString() {
        return super.toString() + (
            "medicalLicenseId = " + this.medicallicenseid + "\n" +
            "specialty = " + this.specialty
        );
    }

    toQuery() {
        return super.toQuery()+", true,'" + this.medicallicenseid + "','" + this.specialty + "'";
    }
}

module.exports = Doctor;
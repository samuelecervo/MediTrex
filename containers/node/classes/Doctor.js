let User = require("./User");

class Doctor extends User {
    constructor(taxId, name, surname, email, password, dateofbirth, gender, medicalLicenseId, specification) {
        super(taxId, name, surname, email, password, dateofbirth, gender);
        this.medicalLicenseId = medicalLicenseId;
        this.specification = specification;
    }

    toString() {
        return super.toString() + (
            "medicalLicenseId = " + this.medicalLicenseId + "\n" +
            "specification = " + this.specification
        );
    }

    toQuery() {
        return super.toQuery()+", true,'" + this.medicalLicenseId + "','" + this.specification + "'";
    }
}

module.exports = Doctor;
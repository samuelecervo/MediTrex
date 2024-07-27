let User = require("./User.js");

class Patient extends User {
    constructor(taxId, name, surname, email, password, dateofbirth, gender) {
        super(taxId, name, surname, email, password, dateofbirth, gender);
    }

    toQuery() {
        return super.toQuery()+", false, null, null";
    }
}

module.exports = Patient;
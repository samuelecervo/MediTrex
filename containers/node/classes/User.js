class User {
    constructor(taxId, name, surname, email, password, dateofbirth, gender) {
        this.taxId = taxId;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.password = password;
        this.dateofbirth = dateofbirth;
        this.gender = gender;
    }

    toString() {
        return (
            "taxId = " + this.taxId + "\n" + 
            "name = " + this.name + "\n" +
            "surname = " + this.surname + "\n" +
            "email= " + this.email + "\n" +
            "password = " + this.password + "\n" +
            "dateofbirth= " + this.dateofbirth + "\n" +
            "gender = " + this.gender + "\n"
        );
    }

    toQuery() {
        return "'"+this.taxId + "','" + this.name + "','" + this.surname + "','" + this.email + "','" + this.password + "','" + this.dateofbirth + "','" + this.gender + "'";
    }

}

module.exports = User;
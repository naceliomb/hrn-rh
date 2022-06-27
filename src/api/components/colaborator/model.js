class Colaborator{
    constructor(name, departament, workSchedule, diarist, temp, contact, status, role, cpf, email, emailEnterprise, admissionDate, documentStatus, comments){
        this.name = name;
        this.departament = departament;
        this.workSchedule = workSchedule;
        this.diarist = diarist;
        this.temp = temp;
        this.contact = contact;
        this.status = status;
        this.role = role;
        this.cpf = cpf;
        this.email = email;
        this.emailEnterprise = emailEnterprise;
        this.admissionDate = admissionDate;
        this.documentStatus = documentStatus;
        this.comments = comments;
    }
};

module.exports = Colaborator;
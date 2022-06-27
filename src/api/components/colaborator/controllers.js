const express = require('express');
const Colaborator = require('./model');
const { getDoc } = require('../../services/spreadSheet');


const router = express.Router();

router.get('/colaborators/:doc', async (req, res) => {
    console.log('access - http://localhost:3000/api/v1/colaborators/:doc');
    const docId = req.params.doc;
    const date = req.query.date;
    let colaborators = [];
    if (!docId) {
        res.status(400).json('EMPTY DOC ID');
        return;
    }
    try {
        getDoc(docId).then(async (doc) => {
            const sheet = doc.sheetsByIndex[0];
            console.log(`SHEET NAME: ${sheet.title}`);

            sheet.getRows().then((rows) => {
                rows.map((row) => {
                    if (!date) {
                        if (row['NOME']) {
                            const day = row['DATA - ADMISSÃO'].substring(0, 2);
                            const month = row['DATA - ADMISSÃO'].substring(3, 5);
                            const year = row['DATA - ADMISSÃO'].substring(row['DATA - ADMISSÃO'].length - 4);

                            const date = new Date(year + '-' + month + '-' + day);
                            const colaborator = new Colaborator(
                                row['NOME'],
                                row['SETOR'],
                                row['ESCALA'],
                                row['FEIRISTA'] == 'TRUE' ? true : false,
                                row['TEMPORARIO'] == 'TRUE' ? true : false,
                                row['CONTATO'],
                                row['STATUS'],
                                row['FUNÇÃO'],
                                row['CPF'],
                                row['E-MAIL'],
                                row['E-MAIL INSTITUCIONAL'],
                                date,
                                row['SITUAÇÃO - DOCUMENTOS'],
                                row['OBSERVAÇÕES']
                            );
                            colaborators.push(colaborator);
                        } 
                    }else {
                        if (row['NOME'] && row['DATA - ADMISSÃO'] == date) {
                            const day = row['DATA - ADMISSÃO'].substring(0, 2);
                            const month = row['DATA - ADMISSÃO'].substring(3, 5);
                            const year = row['DATA - ADMISSÃO'].substring(row['DATA - ADMISSÃO'].length - 4);

                            const date = new Date(year + '-' + month + '-' + day);
                            const colaborator = new Colaborator(
                                row['NOME'],
                                row['SETOR'],
                                row['ESCALA'],
                                row['FEIRISTA'] == 'TRUE' ? true : false,
                                row['TEMPORARIO'] == 'TRUE' ? true : false,
                                row['CONTATO'],
                                row['STATUS'],
                                row['FUNÇÃO'],
                                row['CPF'],
                                row['E-MAIL'],
                                row['E-MAIL INSTITUCIONAL'],
                                date,
                                row['SITUAÇÃO - DOCUMENTOS'],
                                row['OBSERVAÇÕES']
                            );
                            colaborators.push(colaborator);
                        }
                    }
                });

                if(!colaborators.length){
                    res.status(404).json('COLABORATORS NOT FOUND!');
                    return;
                }

                res.status(200).json(colaborators);
                return;
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json('SERVER ERROR');
    }
});

router.get('/colaborators/:name/:doc', async (req, res) => {
    console.log('access - http://localhost:3000/colaborators/:name/:doc');
    const docId = req.params.doc;
    const name = req.params.name;
    let colaborators = [];

    if (!docId) {
        res.status(400).json('INVALID DOC ID');
        return;
    }
    try {
        getDoc(docId).then(async (doc) => {
            const sheet = doc.sheetsByIndex[0];
            console.log(`SHEET NAME: ${sheet.title}`);

            sheet.getRows().then((rows) => {
                if (name) {
                    rows.map((row) => {
                        if (row['NOME'].toUpperCase().substring(0, name.length) == name.toUpperCase()) {
                            const day = row['DATA - ADMISSÃO'].substring(0, 2);
                            const month = row['DATA - ADMISSÃO'].substring(3, 5);
                            const year = row['DATA - ADMISSÃO'].substring(row['DATA - ADMISSÃO'].length - 4);

                            const date = new Date(year + '-' + month + '-' + day);
                            const colaborator = new Colaborator(
                                row['NOME'],
                                row['SETOR'],
                                row['ESCALA'],
                                row['FEIRISTA'] == 'TRUE' ? true : false,
                                row['TEMPORARIO'] == 'TRUE' ? true : false,
                                row['CONTATO'],
                                row['STATUS'],
                                row['FUNÇÃO'],
                                row['CPF'],
                                row['E-MAIL'],
                                row['E-MAIL INSTITUCIONAL'],
                                date,
                                row['SITUAÇÃO - DOCUMENTOS'],
                                row['OBSERVAÇÕES']
                            );
                            colaborators.push(colaborator);
                        }
                    });
                    if (!colaborators.length) {
                        res.status(404).json('COLABORATOR NOT FOUND');
                        return;
                    }
                    res.status(200).json(colaborators);
                    return;
                } else {
                    res.status(400).json('INVALID NAME');
                    return;
                }
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json('SERVER ERROR');
    }
});

router.get('/mail/colaborators/:doc', async (req, res) => {
    console.log('access - http://localhost:3000/colaborators/email-enterprise/:doc');
    const docId = req.params.doc;
    const empty = req.query.empty;
    const date = req.query.date;

    const template = req.query.template;
    let colaborators = [];
    if (!docId) {
        res.status(400).json('INVALID DOC ID');
        return;
    }
    try {
        getDoc(docId).then(async (doc) => {
            const sheet = doc.sheetsByIndex[0];
            console.log(`SHEET NAME: ${sheet.title}`);

            sheet.getRows().then((rows) => {
                rows.map((row) => {
                    if (!empty) {
                        if (
                            (row['DATA - ADMISSÃO'] == date && row['E-MAIL INSTITUCIONAL'] && row['NOME']) ||
                            (!date && row['E-MAIL INSTITUCIONAL'] && row['NOME'])
                        ) {
                            const day = row['DATA - ADMISSÃO'].substring(0, 2);
                            const month = row['DATA - ADMISSÃO'].substring(3, 5);
                            const year = row['DATA - ADMISSÃO'].substring(row['DATA - ADMISSÃO'].length - 4);

                            const date = new Date(year + '-' + month + '-' + day);

                            const colaborator = new Colaborator(
                                row['NOME'],
                                row['SETOR'],
                                row['ESCALA'],
                                row['FEIRISTA'] == 'TRUE' ? true : false,
                                row['TEMPORARIO'] == 'TRUE' ? true : false,
                                row['CONTATO'],
                                row['STATUS'],
                                row['FUNÇÃO'],
                                row['CPF'],
                                row['E-MAIL'],
                                row['E-MAIL INSTITUCIONAL'],
                                date,
                                row['SITUAÇÃO - DOCUMENTOS'],
                                row['OBSERVAÇÕES']
                            );
                            colaborators.push(colaborator);
                        }
                    } else {
                        if (
                            (row['DATA - ADMISSÃO'] == date && !row['E-MAIL INSTITUCIONAL'] && row['TEMPORARIO'] != 'TRUE' && row['NOME']) ||
                            (!date && !row['E-MAIL INSTITUCIONAL'] && row['TEMPORARIO'] != 'TRUE' && row['NOME'])
                        ) {
                            const day = row['DATA - ADMISSÃO'].substring(0, 2);
                            const month = row['DATA - ADMISSÃO'].substring(3, 5);
                            const year = row['DATA - ADMISSÃO'].substring(row['DATA - ADMISSÃO'].length - 4);

                            const date = new Date(year + '-' + month + '-' + day);

                            const colaborator = new Colaborator(
                                row['NOME'],
                                row['SETOR'],
                                row['ESCALA'],
                                row['FEIRISTA'] == 'TRUE' ? true : false,
                                row['TEMPORARIO'] == 'TRUE' ? true : false,
                                row['CONTATO'],
                                row['STATUS'],
                                row['FUNÇÃO'],
                                row['CPF'],
                                row['E-MAIL'],
                                row['E-MAIL INSTITUCIONAL'],
                                date,
                                row['SITUAÇÃO - DOCUMENTOS'],
                                row['OBSERVAÇÕES']
                            );
                            colaborators.push(colaborator);
                        }
                    }
                });

                if (!colaborators.length) {
                    res.status(404).json('COLABORATORS NOT FOUND');
                    return;
                }

                if (template == 'true') {
                    let message = '';
                    colaborators.forEach((colaborator) => {
                        message =
                            message +
                            `<br>NOME: ${colaborator.name}<br>CPF: ${colaborator.cpf}<br>SETOR: ${colaborator.departament}<br>FUNÇÃO: ${colaborator.role}<br>CLT OU CONTRATO: CLT<br>RAMAL: 9361<br>------------------------------`;
                    });
                    res.status(200).send(message);
                    return;
                }

                res.status(200).json(colaborators);
                return;
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json('SERVER ERROR');
    }
});

module.exports = router;

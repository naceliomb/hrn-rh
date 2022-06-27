const express = require('express');
const Colaborator = require('../colaborator/model');
const { getDoc } = require('../../services/spreadSheet');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');

const router = express.Router();

router.get('/archives/card/:name/:doc', async (req, res) => {
    console.log('access - http://localhost:3000/archives/card');

    const docId = req.params.doc;
    const name = req.params.name;
    let colaborators = [];

    const filePath = path.join(__dirname, '../', '../', 'global', 'welcome.ejs');

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
                        if (row['NOME'].toUpperCase() == name.toUpperCase()) {
                            const colaborator = new Colaborator(
                                row['NOME'],
                                row['SETOR'],
                                row['ESCALA'],
                                row['FEIRISTA'] == 'TRUE' ? true : false,
                                row['CONTATO'],
                                row['STATUS'],
                                row['FUNÇÃO'],
                                row['CPF'],
                                row['E-MAIL'],
                                row['E-MAIL INSTITUCIONAL'],
                                new Date(row['DATA - ADMISSÃO']),
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

                    ejs.renderFile(filePath, { colaborators: colaborators }, (err, data) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json('Erro na leitura do arquivo');
                        }

                        return res.send(data);
                    });
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

router.get('/archives/cards/:doc', async (req, res) => {
    console.log('access - http://localhost:3000/archives/cards');
    const docId = req.params.doc;
    const date = req.query.date;
    let colaborators = [];

    const filePath = path.join(__dirname, '../', '../', 'global', 'welcomeAll.ejs');
    const downloadsPath = path.join(__dirname, '../', '../', 'public', 'downloads');
    if (!date) {
        res.status(400).json('Enter date!');
        return;
    }
    const dateDirectoryPath = path.join(downloadsPath, date.replace(/[/]/g, '-'));

    if (!docId) {
        res.status(400).json('INVALID DOC ID');
        return;
    }

    

    try {
        getDoc(docId).then(async (doc) => {
            const sheet = doc.sheetsByIndex[0];
            console.log(`SHEET NAME: ${sheet.title}`);

            sheet.getRows().then((rows) => {
                if (date) {
                    rows.map((row) => {
                        if (row['DATA - ADMISSÃO'] == date) {
                            const colaborator = new Colaborator(
                                row['NOME'],
                                row['SETOR'],
                                row['ESCALA'],
                                row['FEIRISTA'] == 'TRUE' ? true : false,
                                row['CONTATO'],
                                row['STATUS'],
                                row['FUNÇÃO'],
                                row['CPF'],
                                row['E-MAIL'],
                                row['E-MAIL INSTITUCIONAL'],
                                new Date(row['DATA - ADMISSÃO']),
                                row['SITUAÇÃO - DOCUMENTOS'],
                                row['OBSERVAÇÕES']
                            );
                            colaborators.push(colaborator);
                        }
                    });
                    if (!colaborators.length) {
                        res.status(404).json('COLABORATORS NOT FOUND');
                        return;
                    }
                    if (!fs.existsSync(downloadsPath)) {
                        fs.mkdirSync(downloadsPath);
                    }
                    if (!fs.existsSync(dateDirectoryPath)) {
                        fs.mkdirSync(dateDirectoryPath);
                    }
                    colaborators.forEach((colaborator, index) => {
                        const template = fs.readFileSync(filePath, 'utf-8');
                        const html = ejs.render(template, { colaborator: colaborator });

                        fs.writeFileSync(path.join(dateDirectoryPath, `${colaborator.name}.html`), html, 'utf-8');
                    });
                    return res.send('CRIADO COM SUCESSO!');
                } else {
                    res.status(400).json('ENTER WITH VALID DATE');
                    return;
                }
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json('SERVER ERROR');
    }
});

router.get('/cleaner', async (req, res) => {
    try {
        const downloadsPath = path.join(__dirname, '../', '../', 'public', 'downloads');
        if (fs.existsSync(downloadsPath)) {
            fs.rmSync(downloadsPath, { recursive: true, force: true });
            return res.status(200).json('REMOVED ALL FILES!');
        }

        return res.status(400).json('DONT HAVE FILES');
    } catch (err) {
        console.log(err);
        return res.status(500).json('SEVER ERROR');
    }
});

module.exports = router;

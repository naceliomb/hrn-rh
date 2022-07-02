const express = require('express');
const Colaborator = require('../colaborator/model');
const { getDoc } = require('../../services/spreadSheet');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const generatePDF = require('../../middleware/generatePDF');
const listFiles = require('../../middleware/listFiles');
const mergePDF = require('../../middleware/mergePDF');

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
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    console.log(fullUrl);
    const docId = req.params.doc;
    const date = req.query.date;
    const format = req.query.format;

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

            sheet.getRows().then(async (rows) => {
                if (date) {
                    rows.map((row) => {
                        if (row['DATA - ADMISSÃO'] == date) {
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
                        res.status(404).json('COLABORATORS NOT FOUND');
                        return;
                    }
                    if (!fs.existsSync(downloadsPath)) {
                        fs.mkdirSync(downloadsPath);
                    }
                    if (!fs.existsSync(dateDirectoryPath)) {
                        fs.mkdirSync(dateDirectoryPath);
                    }
                    colaborators.forEach(async (colaborator, index) => {
                        console.log(`COLABORATOR: ${colaborator.name}`);
                        const template = fs.readFileSync(filePath, 'utf-8');
                        const html = ejs.render(template, { colaborator: colaborator });
                        if (format == html) {
                            console.log('FORMAT: HTML');
                            fs.writeFileSync(path.join(dateDirectoryPath, `${colaborator.name}.html`), html, 'utf-8');
                        } else {
                            console.log('FORMAT: PDF');
                            const pdf = await generatePDF(html);
                            fs.writeFileSync(path.join(dateDirectoryPath, `${colaborator.name}.pdf`), pdf, 'binary');
                        }
                    });

                    return res.status(201).json({ message: 'Created sucessfully', status: 201 });
                } else {
                    res.status(504).json({ message: 'Enter date', status: 504 });
                    return;
                }
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json('SERVER ERROR');
    }
});

router.get('/archives/heroku/:doc', async (req, res) => {
    const docId = req.params.doc;
    const date = req.query.date;
    // let colaborators = [
    //     {
    //         name: 'Nacelio Moreira Barbosa',
    //         departament: 'SCIH',
    //         workSchedule: 'Comercial',
    //         diarist: true,
    //         temp: false,
    //         contact: '88999999999',
    //         status: 'OK',
    //         role: 'Auxiliar Administrativo',
    //         cpf: '000.000.000-00',
    //         email: 'naceliombdev@gmail.com',
    //         emailEnterprise: 'naceliombdev@gmail.com',
    //         admissionDate: '12/07/2022',
    //         documentStatus: 'OK',
    //         comments: 'Encaminhar Link Integração',
    //     },
    //     {
    //         name: 'Nacelio Barbosa',
    //         departament: 'SCIH',
    //         workSchedule: 'Comercial',
    //         diarist: true,
    //         temp: false,
    //         contact: '88999999999',
    //         status: 'OK',
    //         role: 'Auxiliar Administrativo',
    //         cpf: '000.000.000-00',
    //         email: 'naceliombdev@gmail.com',
    //         emailEnterprise: 'naceliombdev@gmail.com',
    //         admissionDate: '12/07/2022',
    //         documentStatus: 'OK',
    //         comments: 'Encaminhar Link Integração',
    //     },
    //     {
    //         name: 'Nacelio Moreira',
    //         departament: 'SCIH',
    //         workSchedule: 'Comercial',
    //         diarist: true,
    //         temp: false,
    //         contact: '88999999999',
    //         status: 'OK',
    //         role: 'Auxiliar Administrativo',
    //         cpf: '000.000.000-00',
    //         email: 'naceliombdev@gmail.com',
    //         emailEnterprise: 'naceliombdev@gmail.com',
    //         admissionDate: '12/07/2022',
    //         documentStatus: 'OK',
    //         comments: 'Encaminhar Link Integração',
    //     },
    // ];

    let colaborators = [];

    const filePath = path.join(__dirname, '../', '../', 'global', 'welcomeAll.ejs');
    const downloadsPath = path.join(__dirname, '../', '../', 'public', 'downloads');

    if (!fs.existsSync(downloadsPath)) {
        fs.mkdirSync(downloadsPath);
    }

    if (!docId) {
        res.status(400).json({ message: 'Enter with valid Doc Id' });
        return;
    }
    if (!date) {
        res.status(400).json({ message: 'Enter with valid date' });
        return;
    }

    try {
        getDoc(docId).then((doc) => {
            const sheet = doc.sheetsByIndex[0];
            console.log(`Conected SPREADSHEET - SHEET: ${sheet.title}`);

            sheet.getRows().then((rows) => {
                rows.map((row) => {
                    if (row['DATA - ADMISSÃO'] == date) {
                        const day = row['DATA - ADMISSÃO'].substring(0, 2);
                        const month = row['DATA - ADMISSÃO'].substring(3, 5);
                        const year = row['DATA - ADMISSÃO'].substring(row['DATA - ADMISSÃO'].length - 4);

                        const dateAd = new Date(year + '-' + month + '-' + day);

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
                            dateAd,
                            row['SITUAÇÃO - DOCUMENTOS'],
                            row['OBSERVAÇÕES']
                        );
                        console.log(`COLABORATOR: ${colaborator.name} Added`);
                        colaborators.push(colaborator)

                    }
                });
                return res.send(colaborators);
            });
        });

        // colaborators.forEach(async (colaborator) => {
        //     console.log(`COLABORATOR: ${colaborator.name}`);
        //     const template = fs.readFileSync(filePath, 'utf-8');
        //     const html = ejs.render(template, { colaborator: colaborator });

        //     const pdf = await generatePDF(html);
        //     fs.writeFileSync(path.join(downloadsPath, `${colaborator.name}.pdf`), pdf, 'binary');
        // });

        // return res.status(201).json({ message: 'created' });

        
    } catch (e) {
        console.log(e);
        return res.status(503).json({ message: 'Server Error' });
    }
});

router.get('/archives/download', async (req, res) => {
    console.log('access - http://localhost:3000/archives/download');
    const date = req.query.date;

    if (!date) {
        return res.status(504).json({ message: 'Enter with valid date', status: 504 });
    }

    const downloadsPath = path.join(__dirname, '../', '../', 'public', 'downloads');
    const dateDirectoryPath = path.join(downloadsPath, date.replace(/[/]/g, '-'));

    if (!fs.existsSync(dateDirectoryPath)) {
        return res.status(404).json({ message: 'Files not found', status: 404 });
    }

    const files = await listFiles(dateDirectoryPath);
    const merged = await mergePDF(files, dateDirectoryPath);
    const pdfMerged = fs.readFileSync(merged);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdfMerged.length });
    res.set('Content-Disposition', `attachment;filename=merged_${date.replace(/[/]/g, '-')}.pdf`);
    res.set('Content-Type', 'application/octet-stream');
    return res.status(200).send(pdfMerged);
});

router.get('/cleaner', async (req, res) => {
    try {
        const downloadsPath = path.join(__dirname, '../', '../', 'public', 'downloads');
        if (fs.existsSync(downloadsPath)) {
            fs.rmSync(downloadsPath, { recursive: true, force: true });
            return res.status(200).json({ message: 'Removed all files', status: 200 });
        }

        return res.status(404).json({ message: 'Files not found', status: 404 });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
});

module.exports = router;

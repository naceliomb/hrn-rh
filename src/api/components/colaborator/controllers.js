const express = require("express");
const Colaborator = require("./model");
const {getDoc} = require("../../services/spreadSheet");
const path = require("path");
const ejs = require("ejs");
const pdf = require("html-pdf");
const fs = require("fs");

const router = express.Router();

router.get("/colaborators/:doc", async (req, res) =>{
    console.log("access - http://localhost:3000/api/v1/colaborators/:doc");
    const docId = req.params.doc;
    let colaborators = [];
    if(!docId){
        res.status(400).json("EMPTY DOC ID");
        return;
    }
    try{
        getDoc(docId).then( async (doc) => {
            const sheet = doc.sheetsByIndex[0];
            console.log(`SHEET NAME: ${sheet.title}`);

            sheet.getRows().then(rows => {
                rows.map( row => {
                    if(row['NOME']){
                        const colaborator = new Colaborator(row['NOME'], row['SETOR'], row['ESCALA'], row['FEIRISTA'] == "TRUE" ? true : false, row['CONTATO'], row['STATUS'], row['FUNÇÃO'], row['CPF'], row['E-MAIL'], row['E-MAIL INSTITUCIONAL'], new Date(row['DATA - ADMISSÃO']), row['SITUAÇÃO - DOCUMENTOS'], row['OBSERVAÇÕES']);
                        colaborators.push(colaborator);
                    }
                });

                res.status(200).json(colaborators);
                return;
            })

        });
    }catch(err){
        console.log(err);
        res.status(500).json("SERVER ERROR");
    }

});

router.get("/colaborators/email-enterprise/:doc", async(req,res)=>{
    console.log("access - http://localhost:3000/colaborators/email-enterprise/:doc");
    const docId = req.params.doc;
    const empty = req.query.empty;
    const date = req.query.date;

    const template = req.query.template;
    let colaborators = [];
    if(!docId){
        res.status(400).json("INVALID DOC ID");
        return;
    }
    try{
        getDoc(docId).then( async (doc) => {
            const sheet = doc.sheetsByIndex[0];
            console.log(`SHEET NAME: ${sheet.title}`);

            sheet.getRows().then(rows => {
                rows.map( row => {
                    if(empty == "true" && !date ){
                        if(!row['E-MAIL INSTITUCIONAL']&&row['NOME']){
                            const colaborator = new Colaborator(row['NOME'], row['SETOR'], row['ESCALA'], row['FEIRISTA'] == "TRUE" ? true : false, row['CONTATO'], row['STATUS'], row['FUNÇÃO'], row['CPF'], row['E-MAIL'], row['E-MAIL INSTITUCIONAL'], new Date(row['DATA - ADMISSÃO']), row['SITUAÇÃO - DOCUMENTOS'], row['OBSERVAÇÕES']);
                            colaborators.push(colaborator);
                        }
                    }else if(empty == "true" && date){
                        if(!row['E-MAIL INSTITUCIONAL']&&row['NOME']&& row['TEMPORARIO'] != "TRUE" && row['DATA - ADMISSÃO'] == date){
                            const colaborator = new Colaborator(row['NOME'], row['SETOR'], row['ESCALA'], row['FEIRISTA'] == "TRUE" ? true : false, row['CONTATO'], row['STATUS'], row['FUNÇÃO'], row['CPF'], row['E-MAIL'], row['E-MAIL INSTITUCIONAL'], new Date(row['DATA - ADMISSÃO']), row['SITUAÇÃO - DOCUMENTOS'], row['OBSERVAÇÕES']);
                            colaborators.push(colaborator);
                        }

                    }else{
                        if(row['E-MAIL INSTITUCIONAL']&&row['NOME']){
                            const colaborator = new Colaborator(row['NOME'], row['SETOR'], row['ESCALA'], row['FEIRISTA'] == "TRUE" ? true : false, row['CONTATO'], row['STATUS'], row['FUNÇÃO'], row['CPF'], row['E-MAIL'], row['E-MAIL INSTITUCIONAL'], new Date(row['DATA - ADMISSÃO']), row['SITUAÇÃO - DOCUMENTOS'], row['OBSERVAÇÕES']);
                            colaborators.push(colaborator);
                        }
                    }
                });

                if(template == "true"){
                    let message = "";
                    colaborators.forEach(colaborator => {
                        message = message + `<br>NOME: ${colaborator.name}<br>CPF: ${colaborator.cpf}<br>SETOR: ${colaborator.departament}<br>FUNÇÃO: ${colaborator.role}<br>CLT OU CONTRATO: CLT<br>RAMAL: 9361<br>------------------------------`
                    });
                    res.status(200).send(message);
                    return;
                }

                res.status(200).json(colaborators);
                return;
            })

        });
    }catch(err){
        console.log(err);
        res.status(500).json("SERVER ERROR");
    }
});

router.get("/colaborators/:name/:doc", async (req,res) => {
    console.log("access - http://localhost:3000/colaborators/:name/:doc");
    const docId = req.params.doc;
    const name = req.params.name
    let colaborators = [];


    if(!docId){
        res.status(400).json("INVALID DOC ID");
        return;
    }

    try{
        getDoc(docId).then( async (doc) =>{
            const sheet = doc.sheetsByIndex[0];
            console.log(`SHEET NAME: ${sheet.title}`);

            sheet.getRows().then( rows => {
                if(name){
                    rows.map( row => {
                        if(row['NOME'].toUpperCase() == name.toUpperCase()){
                            const colaborator = new Colaborator(row['NOME'], row['SETOR'], row['ESCALA'], row['FEIRISTA'] == "TRUE" ? true : false, row['CONTATO'], row['STATUS'], row['FUNÇÃO'], row['CPF'], row['E-MAIL'], row['E-MAIL INSTITUCIONAL'], new Date(row['DATA - ADMISSÃO']), row['SITUAÇÃO - DOCUMENTOS'], row['OBSERVAÇÕES']);
                            colaborators.push(colaborator);
                            
                        }
                    });
                    if(!colaborators.length){
                        res.status(404).json("COLABORATOR NOT FOUND");
                        return;
                    }
                    res.status(200).json(colaborators);
                    return;
                }else{
                    res.status(400).json("INVALID NAME");
                    return;
                }
                

            });
        });
    }catch(err){
        console.log(err);
        res.status(500).json("SERVER ERROR");
    }
});

router.get("/archives/card/:name/:doc", async(req,res) => {
    console.log("access - http://localhost:3000/archives/card");

    const docId = req.params.doc;
    const name = req.params.name
    let colaborators = [];

    const filePath = path.join(__dirname, "../", "../", "global", "welcome.ejs");

    if(!docId){
        res.status(400).json("INVALID DOC ID");
        return;
    }

    try{
        getDoc(docId).then( async (doc) =>{
            const sheet = doc.sheetsByIndex[0];
            console.log(`SHEET NAME: ${sheet.title}`);

            sheet.getRows().then( rows => {
                if(name){
                    rows.map( row => {
                        if(row['NOME'].toUpperCase() == name.toUpperCase()){
                            const colaborator = new Colaborator(row['NOME'], row['SETOR'], row['ESCALA'], row['FEIRISTA'] == "TRUE" ? true : false, row['CONTATO'], row['STATUS'], row['FUNÇÃO'], row['CPF'], row['E-MAIL'], row['E-MAIL INSTITUCIONAL'], new Date(row['DATA - ADMISSÃO']), row['SITUAÇÃO - DOCUMENTOS'], row['OBSERVAÇÕES']);
                            colaborators.push(colaborator);
                            
                        }
                    });
                    if(!colaborators.length){
                        res.status(404).json("COLABORATOR NOT FOUND");
                        return;
                    }
                    // const template = fs.readFileSync(filePath, 'utf-8');
                    // const html = ejs.render(template, {colaborators:colaborators})

                    // fs.writeFileSync("./result.html", html, 'utf-8');

                    // return res.send(html);
                    ejs.renderFile(filePath, { colaborators:colaborators }, (err, data) => {
                        if(err){
                            console.log(err);
                            return res.status(500).json("Erro na leitura do arquivo");
                        }

                        

                        return res.send(data);
                    });
                }else{
                    res.status(400).json("INVALID NAME");
                    return;
                }
                

            });
        });
    }catch(err){
        console.log(err);
        res.status(500).json("SERVER ERROR");
    }



   

});


router.get("/archives/cards/:doc", async(req,res) => {
    console.log("access - http://localhost:3000/archives/cards");



    const docId = req.params.doc;
    const date = req.query.date;
    let colaborators = [];

    const filePath = path.join(__dirname, "../", "../", "global", "welcomeAll.ejs");
    const downloadsPath = path.join(__dirname,"../", "../", "public", "downloads");
    const dateDirectoryPath = path.join(downloadsPath, date.replace(/[/]/g,"-"));

    if(!docId){
        res.status(400).json("INVALID DOC ID");
        return;
    }

    try{
        getDoc(docId).then( async (doc) =>{
            const sheet = doc.sheetsByIndex[0];
            console.log(`SHEET NAME: ${sheet.title}`);

            sheet.getRows().then( rows => {
                if(date){
                    rows.map( row => {
                        if(row['DATA - ADMISSÃO'] == date){
                            const colaborator = new Colaborator(row['NOME'], row['SETOR'], row['ESCALA'], row['FEIRISTA'] == "TRUE" ? true : false, row['CONTATO'], row['STATUS'], row['FUNÇÃO'], row['CPF'], row['E-MAIL'], row['E-MAIL INSTITUCIONAL'], new Date(row['DATA - ADMISSÃO']), row['SITUAÇÃO - DOCUMENTOS'], row['OBSERVAÇÕES']);
                            colaborators.push(colaborator);
                            
                        }
                    });
                    if(!colaborators.length){
                        res.status(404).json("COLABORATORS NOT FOUND");
                        return;
                    }
                    if(!fs.existsSync(downloadsPath)){
                        fs.mkdirSync(downloadsPath);
                    }
                    if(!fs.existsSync(dateDirectoryPath)){
                        fs.mkdirSync(dateDirectoryPath);
                    }
                    colaborators.forEach((colaborator, index) => {
                        const template = fs.readFileSync(filePath, 'utf-8');
                        const html = ejs.render(template, {colaborator:colaborator})

                        

                        fs.writeFileSync(path.join(dateDirectoryPath, `${colaborator.name}.html`), html, 'utf-8');

                    })
                    return res.send("CRIADO COM SUCESSO!");
                    
                }else{
                    res.status(400).json("INVALID DATE");
                    return;
                }
                

            });
        });
    }catch(err){
        console.log(err);
        res.status(500).json("SERVER ERROR");
    }



   

});

module.exports = router;
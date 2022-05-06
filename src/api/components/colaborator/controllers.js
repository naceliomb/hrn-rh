const express = require("express");
const Colaborator = require("./model");
const {getDoc} = require("../../services/spreadSheet");

const router = express.Router();

router.get("/colaborators/:doc", async (req, res) =>{
    console.log("aquela");
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
    const docId = req.params.doc;
    const empty = req.query.empty;
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
                    if(empty == "true"){
                        if(!row['E-MAIL INSTITUCIONAL']&&row['NOME']){
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

module.exports = router;
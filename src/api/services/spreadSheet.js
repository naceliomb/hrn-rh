const { GoogleSpreadsheet } = require("google-spreadsheet");
// const credencials = require("../../config/credencials.json");
require("dotenv/config");
const getDoc = async (archiveId) => {
    const doc = new GoogleSpreadsheet(archiveId);
    await doc.useServiceAccountAuth({
        client_email: process.env.CLIENT_EMAIL,
        private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
    });
    await doc.loadInfo();
    console.log(`Conectado com sucesso ao arquivo: ${doc.title}`);
    return doc;
};



module.exports = {getDoc};
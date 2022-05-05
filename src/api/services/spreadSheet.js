const { GoogleSpreadsheet } = require("google-spreadsheet");
const credencials = require("../../config/credencials.json");

const getDoc = async (archiveId) => {
    const doc = new GoogleSpreadsheet(archiveId);
    await doc.useServiceAccountAuth({
        client_email: credencials.client_email,
        private_key: credencials.private_key.replace(/\\n/g, '\n')
    });
    await doc.loadInfo();
    console.log(`Conectado com sucesso ao arquivo: ${doc.title}`);
    return doc;
};



module.exports = {getDoc};
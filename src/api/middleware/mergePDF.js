const { PDFDocument } = require('pdf-lib');
const path = require('path');
const fs = require('fs');

const mergePDF = async(paths = [], pathOutput) => {
    const doc = await PDFDocument.create();
    let docs = [];
    for (let i = 0; i < paths.length; i++) {
        docs[i] = await PDFDocument.load(fs.readFileSync(paths[i]));
    }
    docs.forEach(async (pdf) => {
        let content = await doc.copyPages(pdf, pdf.getPageIndices());

        doc.addPage(content[0]);
    });
    // for(const pdf in docs){
    //     let content = await doc.copyPages(pdf, docs[0].getPageIndices());

    //     for(const page in content){
    //         doc.addPage(page);
    //     }
    // }

    fs.writeFileSync(path.join(pathOutput, `merged.pdf`), await doc.save(), 'binary');
    return path.join(pathOutput, `merged.pdf`);
}
module.exports = mergePDF;

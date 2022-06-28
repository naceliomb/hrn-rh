const puppeteer = require("puppeteer");


const generatePDF = async (content) =>{
    const browser = await puppeteer.launch({headless: true});
    const page =  await browser.newPage();
    // await page.goto('https://google.com', {waitUntil: 'networkidle0'});
    await page.setContent(content);
    const pdf = await page.pdf({format: 'A4'});
    await page.close();
    await browser.close();

    return pdf;
};

module.exports = generatePDF;
const puppeteer = require('puppeteer');

const generatePDF = async (content) => {
    // console.log(content);
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(content);
    const pdf = await page.pdf({ format: 'A4' });
    await page.close();
    await browser.close();

    return pdf;
};

module.exports = generatePDF;

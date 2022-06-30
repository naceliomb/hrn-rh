const fs = require('fs').promises;
const { sep } = require('path');


async function listarArquivosDoDiretorio(diretorio, arquivos) {

    if(!arquivos)
        arquivos = [];

    let listaDeArquivos = await fs.readdir(diretorio);
    for(let k in listaDeArquivos) {
        let stat = await fs.stat(`${diretorio}${sep}${listaDeArquivos[k]}`);
        if(stat.isDirectory())
            await listarArquivosDoDiretorio(`${diretorio}${sep}${listaDeArquivos[k]}`, arquivos);
        else
            arquivos.push(`${diretorio}${sep}${listaDeArquivos[k]}`);
    }

    return arquivos;

}
module.exports = listarArquivosDoDiretorio;
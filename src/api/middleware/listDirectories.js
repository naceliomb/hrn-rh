const fs = require('fs').promises;
const { readdir, readdirSync } = require('fs');
const { sep } = require('path');


const getDirectories = async (path) =>{
    const list = fs.readdir(path, {withFileTypes: true}, (error, files) =>{
        if(error) throw error;
        const directories = files
            .filter(item => item.isDirectory())
            .map(item => item.name);
        
        return directories;
    });

    return list;
}


module.exports = getDirectories;
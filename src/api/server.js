const express = require("express");
const app = express();
const path = require("path");
const serverIndex = require("serve-index");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname,"/public")));
app.use("/downloads", serverIndex(path.join(__dirname,"/public","downloads")));
module.exports = {
    app 
};
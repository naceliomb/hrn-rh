const {app} = require("./src/api/server");
const routes = require("./src/api/routes");


app.use("/api/v1/", routes.colaborator);
app.use("/api/v1/", routes.cards);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => { console.log(`SERVIDOR INICIADO EM http://localhost:${PORT}`) });
const usuariosRoutes = require('./routes/usuarios')
const express = require('express');
const app = express();
const port = 3000;
app.use(express.json())

app.use('/usuarios', usuariosRoutes);

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
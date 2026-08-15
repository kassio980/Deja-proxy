const express = require('express');
const { exec } = require('child_process');
const app = express();
app.use(express.static('public'));
app.listen(3000, () => console.log('DEJA PROXY Rodando na porta 3000'));

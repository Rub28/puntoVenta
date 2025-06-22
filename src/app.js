const https = require('https');
const express = require('express');
const morgan = require('morgan');
const config = require('./config');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const clientes = require('./modulos/clientes/rutas');
const usuarios = require('./modulos/Usuarios/rutas');
const movimientos = require('./modulos/Movimientos/rutas');
const auth = require('./modulos/auth/rutas');

const error = require('./Respuestas/errors')

const app = express();
  
// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
// configuracion 
app.set('port', config.app.port);

// rutas
app.use(cors());  

app.use('/api/clientes', clientes)
app.use('/api/clientes/autocomplete', clientes)
app.use('/api/clientes/todosagente', clientes)
app.use('/api/usuarios', usuarios)
app.use('/api/usuarios/validaUsuario', usuarios)
app.use('/api/movimientos', movimientos)
app.use('/api/movimientos/todosMovimientos', movimientos)
app.use('/api/auth', auth)
app.use(error);

   
// Cargar los certificados de Let's Encrypt
  
const options = {
    key: fs.readFileSync(path.join('/etc/letsencrypt/live/srv743626.hstgr.cloud/privkey.pem')),
    cert: fs.readFileSync(path.join('/etc/letsencrypt/live/srv743626.hstgr.cloud/fullchain.pem')),
  };
  
  // Crear el servidor HTTPS
  https.createServer(options, app).listen(4005, () => {
    console.log('Servidor HTTPS escuchando en el puerto 4005');
  });

module.exports =app;

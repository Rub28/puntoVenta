
require('dotenv')
module.exports = {
    app: {
        port: process.env.PORT || 4003
    },
    jwt:{
        secret: process.env.JET_SECRET || 'miconstraseña2848330'
    },
    mysql:{
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'u785010228_root',
        password: process.env.MYSQL_PASSWORD || 'rub11H28',
        database: process.env.MYSQL_DB || 'u785010228_pventa', 
        port: process.env.PORT_BD || 3306  
    }   
}     
  

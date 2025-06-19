
require('dotenv')
module.exports = {
    app: {
        port: process.env.PORT || 4002
    },
    jwt:{
        secret: process.env.JET_SECRET || 'miconstraseña2848330'
    },
    mysql:{
        host: process.env.MYSQL_HOST || '82.29.198.42',
        user: process.env.MYSQL_USER || 'u785010228_pventa',
        password: process.env.MYSQL_PASSWORD || 'rub11H28',
        database: process.env.MYSQL_DB || 'u785010228_pventa', 
        port: process.env.PORT_BD || 3306  
    }   
}     
  

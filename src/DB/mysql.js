const mysql = require('mysql2/promise');
const config = require('../config');


let conexion; 

async function conexiondb() {
    let conexion;  // Definimos la variable de conexión fuera del try-catch
    try {
        // Crear un pool de conexiones
        const pool = mysql.createPool({
            host: config.mysql.host,
            user: config.mysql.user,
            password: config.mysql.password, 
         //   port: 3306, 
            port: config.mysql.port,    
            database: config.mysql.database,
            namedPlaceholders: true
        });
        console.log(" host : ", config.mysql.host); 
        console.log(" port:  ", config.mysql.port); 
        // Obtener una conexión del pool
        conexion = await pool.getConnection();

        console.log(" DB conectada, ok ");
        return conexion;

    } catch (err) {
        console.error('Error al conectar a la base de datos --> ', err);
    } finally {
        // Asegurarse de liberar la conexión si se ha establecido
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada");
        }
    }
}

// Llamar a la función
conexiondb().then(conexion => {
    // Puedes usar la conexión para realizar consultas si la necesitas
}).catch(err => {
    console.error('Error:', err);
});

conexiondb();
/*
function todos(tabla) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} where estatus = 'A'`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    })
}*/

async function todos(tabla, data) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        // Realizar la consulta usando async/await y execute
        const [result] = await conexion.execute(
            `SELECT * FROM ${tabla} WHERE estatus = ?`,
            [data.estatus]  // Parámetro 'A' para el estatus activo
        );

        // Retornar los resultados de la consulta
        return result;

    } catch (error) {
        console.error("Error en la consulta:", error);
        throw error; // Lanzar el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión después de la consulta
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada.");
        }
    }
}


function uno(tabla, id) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} where id=${id}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    })
}

async function insertar(tabla, data) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        // Ejecutar la consulta de inserción usando placeholders con nombre
        const [result] = await conexion.execute(
            `INSERT INTO ${tabla} SET ${Object.keys(data).map(key => `${key} = :${key}`).join(', ')}`,
            data // Pasar el objeto directamente, ya que estamos usando placeholders con nombre
        );
        
        // Retornar el resultado de la inserción
        console.log( " * Nuevo Valor insertado en: ", `  ${tabla} , :` + result.insertId)
        return result;

    } catch (error) {
        console.error("Error al insertar los datos:", error);
        throw error; // Lanzamos el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras la inserción");
        }
    }
}


async function actualizar(tabla, data) {
    let conexion;
    console.log(' actualizar --> data: ', data);  

    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        // Ejecutar la consulta de actualización usando placeholders con nombre
        const [result] = await conexion.execute(
            `UPDATE ${tabla} SET ${Object.keys(data).map(key => `${key} = :${key}`).join(', ')} WHERE id = :id `, 
        data // Pasar el objeto directamente  
        ); 

        // Retornar el resultado de la actualización
        return result;

    } catch (error) {
        console.error("Error al actualizar los datos:", error);
        throw error; // Lanzamos el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras la actualización");
        }
    }
}
  
function agregar(tabla, data) {
    console.log(' data: ', data); 
    if (data && data.id == 0) {
        return insertar(tabla, data);
    } else {
        return actualizar(tabla, data);
    }
}  
    
function agregarArray(tabla, data) {

    console.log(' *  data Array : ', data); 
    const productos  =  data;  
    var resultado = "";  

    for (const producto of productos  ) { 

        if ( producto.id == 0) {
           resultado =  insertar(tabla, producto);
        } else {
           resultado =  actualizar(tabla, producto);
        }
 
    } 
    return resultado; 
}

/*
function baja(tabla, data) {
    return new Promise((resolve, reject) => {
        conexion.query(`UPDATE ${tabla} SET estatus = ? where id = ?`, [data.estatus, data.id], (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    })
}*/

async function baja(tabla, consulta) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        // Asegurarse de que consulta es un objeto con propiedades como 'user_name' y 'user_password'
        console.log(" baja --> ", consulta); 
          
        const parametros = [consulta.estatus, consulta.id];
        console.log(" parametros ", parametros)
        // Ejecutar la consulta usando los parámetros en un array
        const [result] = await conexion.execute(
            `UPDATE ${tabla} SET estatus = ? where id = ?`,
            parametros // Pasar los parámetros como un array
        );

        // Retornar el primer resultado (suponiendo que solo hay uno)
        return result || null; // Si no hay coincidencias, se devuelve null

    } catch (error) {
        console.error("Error en el login:", error);
        throw error; // Lanzamos el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras baja");
        }
    }
}
/*
function query(tabla, consulta) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla}  where ?`, consulta, (error, result) => {
            return error ? reject(error) : resolve(result[0]);
        })
    })
}*/

async function query(tabla, consulta) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        // Realizar la consulta utilizando placeholders con nombre
        const [result] = await conexion.execute(
            `SELECT * FROM ${tabla} WHERE ?`, 
            consulta  // Aquí 'consulta' es un objeto que se mapea directamente
        );

        // Retornar el primer resultado si existe
        return result.length > 0 ? result : null;

    } catch (error) {
        console.error("Error en la consulta:", error);
        throw error; // Lanzar el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión después de la consulta
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada.");
        }
    }
}

async function Movimientos(tabla, data) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        console.log(" **  Movimientos  Tipo usuario : ", data.roluser);  
  
        // Acción para el rol "AGENTE"
        if (data.roluser === "VENDEDOR") {
            const [result] = await conexion.execute(
                `  SELECT m.id, C.id as Id_cliente,  nom_cliente,  m.fh_venta, m.estatus, m.cantidad, m.imp_total,   
                          m.imp_neto, m.imp_iva, m.imp_otros,                   
                          p.id as id_pago,  p.forma_pago, e.id as id_entrega,  e.forma_entrega, pr.nombre as nom_producto,   
                          C.id_agente, concat(u.firt_name,' ',u.second_name) nom_vendedor,  m.notas  
                        FROM  pventa_movimiento AS m
                        INNER JOIN  clientes AS C
                                ON  m.id_cliente = C.id 
                        INNER JOIN users AS u 
                                ON  m.id_vendedor = u.id              
                        INNER JOIN tipo_pago AS p 
                                ON  m.id_pago = p.id             
                        INNER JOIN tipo_entrega AS e 
                                ON  m.id_entrega = e.id      
                        INNER JOIN productos AS pr 
                                ON  m.id_producto = pr.id                  
                        WHERE m.estatus = ? AND C.id_agente =  ?  
                          and u.id_sucursal =  ?  `, 
                        [data.estatus, data.id_agente, data.id_sucursal] 
            );
            return result;
        }
 
        // Acción para el rol "ADMIN"
        if (data.roluser === "ADMIN") {  
            if (data.id_sucursal === "0")  { 
                 const [result] = await conexion.execute(
                `  SELECT m.id, C.id as Id_cliente,  nom_cliente,  m.fh_venta, m.estatus, m.cantidad, m.imp_total,  
                          m.imp_neto, m.imp_iva, m.imp_otros,   
                           p.id as id_pago,  p.forma_pago, e.id as id_entrega,  e.forma_entrega, pr.nombre as nom_producto, 
                        C.id_agente, concat(u.firt_name,' ',u.second_name) nom_vendedor,  m.notas  
                        FROM  pventa_movimiento AS m
                        INNER JOIN  clientes AS C
                                ON  m.id_cliente = C.id 
                        INNER JOIN users AS u 
                                ON  m.id_vendedor = u.id              
                        INNER JOIN tipo_pago AS p 
                                ON  m.id_pago = p.id               
                        INNER JOIN tipo_entrega AS e 
                                ON  m.id_entrega = e.id      
                        INNER JOIN productos AS pr
                                ON  m.id_producto = pr.id                  
                            WHERE m.estatus = ? `,
                          [data.estatus]  // Asumimos que un ADMIN puede consultar todos los agentes con el estatus dado
            );
            return result;  
             }  else  { 
                    const [result] = await conexion.execute(
                        `  SELECT m.id, C.id as Id_cliente,  nom_cliente,  m.fh_venta, m.estatus, m.cantidad, m.imp_total,  
                                m.imp_neto, m.imp_iva, m.imp_otros,   
                                p.id as id_pago,  p.forma_pago, e.id as id_entrega,  e.forma_entrega, pr.nombre as nom_producto, 
                                C.id_agente, concat(u.firt_name,' ',u.second_name) nom_vendedor,  m.notas  
                                FROM  pventa_movimiento AS m
                                INNER JOIN  clientes AS C
                                        ON  m.id_cliente = C.id 
                                INNER JOIN users AS u 
                                        ON  m.id_vendedor = u.id              
                                INNER JOIN tipo_pago AS p 
                                        ON  m.id_pago = p.id               
                                INNER JOIN tipo_entrega AS e 
                                        ON  m.id_entrega = e.id      
                                INNER JOIN productos AS pr
                                        ON  m.id_producto = pr.id                  
                                    WHERE m.estatus = ? and u.id_sucursal = ? `,
                                    [data.estatus, data.id_sucursal]  // Asumimos que un ADMIN puede consultar todos los agentes con el estatus dado
                    );
                    return result; 

              }

        }

        // Acción para el rol "CLIENTE"  **Pendiente de definir   
        if (data.roluser === "CLIENTE") { 
            console.log(" CLiente: ", data.id_cliente)
            const [result] = await conexion.execute(
                ` SELECT m.id, c.id as Id_cliente, m.num_hit, nom_cliente, monto_entrada, fecha_entrada, valor_bcoin, precio_inicial, precio_final, m.monto_salida,
                    m.fecha_salida, m.utilidad_perdida, m.estatus, m.num_round, m.notas, c.id_agente
                    FROM  movimientos AS m
                        INNER JOIN  clientes AS c
                                ON  m.id_cliente = c.id 
                             WHERE  c.id = ? `,
                            [data.id_cliente]  // Los clientes solo pueden ver sus propios movimientos 

            );   
            return result;
        } 
     
        // Si el rol no es válido
        throw new Error("Rol no reconocido para realizar la consulta.");

    } catch (error) {
        console.error("Error en la consulta de movimientos:", error);
        throw error; // Lanza el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras la consulta.");
        }
    }
}


async function MovimientosPorPeriodo (tabla, data) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        console.log(" **  Movimientos  Tipo usuario : ", data.roluser);  

        // Acción para el rol "AGENTE"
        if (data.roluser === "VENDEDOR") {
            const [result] = await conexion.execute(
                `  SELECT m.id, C.id as Id_cliente,  nom_cliente,  m.fh_venta, m.estatus, m.cantidad, m.imp_total,   
                          m.imp_neto, m.imp_iva, m.imp_otros,                   
                          p.id as id_pago,  p.forma_pago, e.id as id_entrega,  e.forma_entrega, pr.nombre as nom_producto,   
                          C.id_agente, concat(u.firt_name,' ',u.second_name) nom_vendedor,  m.notas  
                        FROM  pventa_movimiento AS m
                        INNER JOIN  clientes AS C
                                ON  m.id_cliente = C.id 
                        INNER JOIN users AS u 
                                ON  m.id_vendedor = u.id              
                        INNER JOIN tipo_pago AS p 
                                ON  m.id_pago = p.id               
                        INNER JOIN tipo_entrega AS e 
                                ON  m.id_entrega = e.id      
                        INNER JOIN productos AS pr
                                ON  m.id_producto = pr.id                  
                        WHERE m.estatus = ? AND C.id_agente =  ?`, 
                        [data.estatus, data.id_agente]
            );
            return result;
        }

        // Acción para el rol "ADMIN"
        if (data.roluser === "ADMIN") {
            const [result] = await conexion.execute(
                `  SELECT m.id, C.id as Id_cliente,  nom_cliente,  m.fh_venta, m.estatus, m.cantidad, m.imp_total,  
                          m.imp_neto, m.imp_iva, m.imp_otros,   
                           p.id as id_pago,  p.forma_pago, e.id as id_entrega,  e.forma_entrega, pr.nombre as nom_producto, 
                        C.id_agente, concat(u.firt_name,' ',u.second_name) nom_vendedor,  m.notas  
                        FROM  pventa_movimiento AS m
                        INNER JOIN  clientes AS C
                                ON  m.id_cliente = C.id 
                        INNER JOIN users AS u 
                                ON  m.id_vendedor = u.id              
                        INNER JOIN tipo_pago AS p 
                                ON  m.id_pago = p.id               
                        INNER JOIN tipo_entrega AS e 
                                ON  m.id_entrega = e.id      
                        INNER JOIN productos AS pr
                                ON  m.id_producto = pr.id                  
                            WHERE m.estatus = ? `,
                [data.estatus]  // Asumimos que un ADMIN puede consultar todos los agentes con el estatus dado
            );
            return result;
        }  

        // Acción para el rol "CLIENTE"  **Pendiente de definir   
        if (data.roluser === "CLIENTE") { 
            console.log(" CLiente: ", data.id_cliente)
            const [result] = await conexion.execute(
                ` SELECT m.id, c.id as Id_cliente, m.num_hit, nom_cliente, monto_entrada, fecha_entrada, valor_bcoin, precio_inicial, precio_final, m.monto_salida,
                    m.fecha_salida, m.utilidad_perdida, m.estatus, m.num_round, m.notas, c.id_agente
                    FROM  movimientos AS m
                        INNER JOIN  clientes AS c
                                ON  m.id_cliente = c.id 
                             WHERE  c.id = ? `,
                            [data.id_cliente]  // Los clientes solo pueden ver sus propios movimientos 

            );   
            return result;
        } 
     
        // Si el rol no es válido
        throw new Error("Rol no reconocido para realizar la consulta.");

    } catch (error) {
        console.error("Error en la consulta de movimientos:", error);
        throw error; // Lanza el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras la consulta.");
        }
    }
}


async function ResumenMovimientos (tabla, data) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        console.log(" **  ResumenMovimientos:  ", data);  

        // Acción para el rol "AGENTE"
        if (data.roluser === "VENDEDOR") {
            const [result] = await conexion.execute(
                ` select  m.fh_venta, p.id as id_pago,  p.forma_pago,  
                        pr.nombre as nom_producto,   
                        count(m.id) as num_productos, sum(m.imp_total) as imp_total 
                        FROM  pventa_movimiento AS m
                        INNER JOIN users AS u 
                                ON  m.id_vendedor = u.id              
                        INNER JOIN tipo_pago AS p 
                                ON  m.id_pago = p.id               
                        INNER JOIN productos AS pr
                                ON  m.id_producto = pr.id    
                        where m.id > 0 
                        Group by m.fh_venta, p.id,  p.forma_pago, pr.nombre `
                       //,  [data.estatus, data.id_agente]
            );
            return result;
        }

        // Acción para el rol "ADMIN"
        if (data.roluser === "ADMIN") {
            const [result] = await conexion.execute(
                ` select  m.fh_venta, p.id as id_pago,  p.forma_pago,  
                        pr.nombre as nom_producto,   
                        count(m.id) as num_productos, sum(m.imp_total) as imp_total 
                        FROM  pventa_movimiento AS m
                        INNER JOIN users AS u 
                                ON  m.id_vendedor = u.id              
                        INNER JOIN tipo_pago AS p 
                                ON  m.id_pago = p.id               
                        INNER JOIN productos AS pr
                                ON  m.id_producto = pr.id    
                        where m.id > 0 
                        Group by m.fh_venta, p.id,  p.forma_pago, pr.nombre `
               // [data.estatus]  // Asumimos que un ADMIN puede consultar todos los agentes con el estatus dado
            );
                        
            return result;
        }

        // Acción para el rol "CLIENTE"  **Pendiente de definir   
      

        // Si el rol no es válido
        throw new Error("Rol no reconocido para realizar la consulta.");

    } catch (error) {
        console.error("Error en la consulta de movimientos:", error);
        throw error; // Lanza el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras la consulta.");
        }
    }
}


async function clientesAutocomplete(query) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        // Asegurarse de que consulta es un objeto con propiedades como 'user_name' y 'user_password'
        console.log("query", query)
        let consultas = "";
        const termino = query.query;
        if (query.roluser === "ADMIN") {
            consultas = 'SELECT id, nom_cliente FROM clientes WHERE  nom_cliente LIKE ?';
            // Ejecutar la consulta usando los parámetros en un array
            const [result] = await conexion.execute(
                consultas,
                [`%${termino}%`] // Pasar los parámetros como un array
            );

            // Retornar el primer resultado (suponiendo que solo hay uno)
            return result || null; // Si no hay coincidencias, se devuelve null
        }

        if (query.roluser === "AGENTE") {
            consultas = 'SELECT id, nom_cliente FROM clientes WHERE id_agente = ? and nom_cliente LIKE ?';
             // Ejecutar la consulta usando los parámetros en un array
             const [result] = await conexion.execute(
                consultas,
                [query.id_agente, `%${termino}%`] // Pasar los parámetros como un array
            );
             // Retornar el primer resultado (suponiendo que solo hay uno)
             return result || null; // Si no hay coincidencias, se devuelve null
        }
    } catch (error) {
        console.error("Error en el login:", error);
        throw error; // Lanzamos el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras clientesAutocomplete");
        }
    }
}


async function productoAutocomplete(tabla,query) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        // Asegurarse de que consulta es un objeto con propiedades como 'user_name' y 'user_password'
        console.log("--> query :", query)
        let consultas = "";
        const termino = query.query;
        
          //   consultas = 'SELECT id, nom_cliente FROM clientes WHERE  nom_cliente LIKE ?';
            
            // Ejecutar la consulta usando los parámetros en un array
            const [result] = await conexion.execute(
                   `SELECT * FROM ${tabla} WHERE estatus = ? and nombre like ? `,
                     [query.estatus, `%${termino}%`] // Pasar los parámetros como un array
            );
            console.log (" resultado :",  result); 
            // Retornar el primer resultado (suponiendo que solo hay uno)
            return result || null; // Si no hay coincidencias, se devuelve null 


    } catch (error) {
        console.error("Error en el login:", error);
        throw error; // Lanzamos el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras productoAutocomplete");
        }
    }
}



async function usuarioAutocomplete (tabla,query) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        // Asegurarse de que consulta es un objeto con propiedades como 'user_name' y 'user_password'
        console.log("--> query :", query)
        let consultas = "";
        const termino = query.query;
        
          //   consultas = 'SELECT id, nom_cliente FROM clientes WHERE  nom_cliente LIKE ?';
            
            // Ejecutar la consulta usando los parámetros en un array
            const [result] = await conexion.execute(
                   `SELECT * FROM ${tabla} WHERE estatus = ? and user_name like ? `,
                     [query.estatus, `%${termino}%`] // Pasar los parámetros como un array
            );
            console.log (" resultado :",  result); 
            // Retornar el primer resultado (suponiendo que solo hay uno)
            return result || null; // Si no hay coincidencias, se devuelve null 

            
    } catch (error) {
        console.error("Error en el login:", error);
        throw error; // Lanzamos el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras productoAutocomplete");
        }
    }
}


async function vendedorAutocomplete(query) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        // Asegurarse de que consulta es un objeto con propiedades como 'user_name' y 'user_password'
        console.log("query", query)
        let consultas = "";
        const termino = query.query;
        //if (query.roluser === "ADMIN"  ) {
            consultas = 'SELECT id, user_name FROM users WHERE rol_user = "VENDEDOR"  AND  user_name LIKE ?';
            // Ejecutar la consulta usando los parámetros en un array
            const [result] = await conexion.execute(
                consultas,
                [`%${termino}%`] // Pasar los parámetros como un array
            );

            // Retornar el primer resultado (suponiendo que solo hay uno)
            return result || null; // Si no hay coincidencias, se devuelve null
       // }

       /* 
        if (query.roluser === "AGENTE") {
            consultas = 'SELECT id, nom_cliente FROM clientes WHERE id_agente = ? and nom_cliente LIKE ?';
             // Ejecutar la consulta usando los parámetros en un array
             const [result] = await conexion.execute(
                consultas,
                [query.id_agente, `%${termino}%`] // Pasar los parámetros como un array
            );
             // Retornar el primer resultado (suponiendo que solo hay uno)
             return result || null; // Si no hay coincidencias, se devuelve null
        }
        */ 
    } catch (error) {
        console.error("Error en el login:", error);
        throw error; // Lanzamos el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras clientesAutocomplete");
        }
    }
}


async function todosAgente(tabla, data) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        console.log(" Data todosAgentes ", data); 

        // Si el rol del usuario es "ADMIN"
        if (data.roluser === "ADMIN") {
            const [result] = await conexion.execute(
                `SELECT * FROM ${tabla} WHERE estatus = ?`,
                [data.estatus]  // Asegúrate de pasar 'data.estatus' como array
            );
            return result;
        }

        // Si el rol del usuario es "AGENTE"
        if (data.roluser === "VENDEDOR") {
            const [result] = await conexion.execute(
                `SELECT * FROM ${tabla} WHERE estatus = ? `,
                [data.estatus]  // Pasar 'data.estatus' y 'data.id_agente' como array
            );
            return result;
        } 

        // Si el rol no es ni ADMIN ni AGENTE, podemos devolver un error o un resultado vacío
        throw new Error("Rol no válido para la consulta.");
    } catch (error) {
        console.error("Error en la consulta:", error);
        throw error;  // Lanzamos el error para que lo maneje el bloque llamante
    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras la consulta.");
        }
    }
}


async function todosAlmacenes( data) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        console.log(" Data todosAlmacenes ", data); 

        // Si el rol del usuario es "ADMIN"
        
            const [result] = await conexion.execute(
                ` SELECT a.id, a.nombre, a.tel_almacen, a.direccion, a.id_usuario, a.estatus, u.user_name as user_name 
                        FROM almacenes a 
                        LEFT JOIN users u  
                               ON u.id = a.id_usuario 
                            Where a.estatus = ? `,
                [data.estatus]  // Asegúrate de pasar 'data.estatus' como array
            );
            return result;

        // Si el rol no es ni ADMIN ni AGENTE, podemos devolver un error o un resultado vacío
        //  throw new Error("Rol no válido para la consulta.");
    } catch (error) {
        console.error("Error en la consulta:", error);
        throw error;  // Lanzamos el error para que lo maneje el bloque llamante
    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras la consulta.");
        }
    }
}

async function todosAgenteProducto(tabla, data) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        console.log(" Data todosAgentes ", data); 

        // Si el rol del usuario es "ADMIN"
        if (data.roluser === "ADMIN") {
            const [result] = await conexion.execute(
                `SELECT * FROM ${tabla} WHERE id_producto = ? and estatus = ?`,
                [data.id_producto, data.estatus]  // Asegúrate de pasar 'data.estatus' como array
            );
            return result;
        }

        // Si el rol del usuario es "AGENTE"
        if (data.roluser === "VENDEDOR") {
            const [result] = await conexion.execute(
                `SELECT * FROM ${tabla} WHERE id_producto = ? and estatus = ? AND id_agente = ?`,
                [data.id_producto, data.estatus]  // Pasar 'data.estatus' y 'data.id_agente' como array
            );
            return result;
        } 

        // Si el rol no es ni ADMIN ni AGENTE, podemos devolver un error o un resultado vacío
        throw new Error("Rol no válido para la consulta.");
    } catch (error) {
        console.error("Error en la consulta:", error);
        throw error;  // Lanzamos el error para que lo maneje el bloque llamante
    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras la consulta.");
        }
    }
}


async function todosDetalleCompra (tabla, data) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        console.log(" Data todosAgentes ", data); 

        // Si el rol del usuario es "ADMIN"
        if (data.roluser === "ADMIN") {
            const [result] = await conexion.execute(
                `SELECT * FROM ${tabla} WHERE id > 0 and id_mov = ? `,
                [data.id_mov]  // Asegúrate de pasar 'data.estatus' como array
            );
            return result;
        }

        // Si el rol del usuario es "AGENTE"
        if (data.roluser === "VENDEDOR") {
            const [result] = await conexion.execute(
                  `SELECT * FROM ${tabla} WHERE id > 0 and id_mov = ? `,
                [data.id_mov]  // Asegúrate de pasar 'data.estatus' como array
            );
            return result;
        } 

        // Si el rol no es ni ADMIN ni AGENTE, podemos devolver un error o un resultado vacío
        throw new Error("Rol no válido para la consulta.");
    } catch (error) {
        console.error("Error en la consulta:", error);
        throw error;  // Lanzamos el error para que lo maneje el bloque llamante
    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras la consulta.");
        }
    }
}


async function inventarioDetalle(tabla, data) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        console.log(" Data inventarioDetalle ", data);  

        // Si el rol del usuario es "ADMIN"
        if (data.roluser === "ADMIN") {
            const [result] = await conexion.execute( 
                `select i.id as id_detalle,  i.id_inventario,  i.registro_lote, i.num_entrada, i.id_tipo_mov,  t.des_movimiento,  
                    i.estatus  
                    from inventario_det as i 
                    INNER join tipo_movimiento t 
                            ON i.id_tipo_mov  =  t.id 
                    where  i.id_inventario = ? and i.estatus = ?  `, 
                // `SELECT * FROM ${tabla} WHERE estatus = ?`,
                [data.id_inventario, data.estatus]  // Asegúrate de pasar 'data.estatus' como array
            );
            return result;
        }

        // Si el rol del usuario es "AGENTE"
        if (data.roluser === "VENDEDOR") {
            const [result] = await conexion.execute(               
                  `select i.id as id_detalle, i.id_inventario,  i.registro_lote, i.num_entrada, i.id_tipo_mov,  t.des_movimiento,  
                          i.estatus 
                    from inventario_det as i 
                    INNER join tipo_movimiento t 
                            ON i.id_tipo_mov  =  t.id 
                    where  i.id_inventario = ? and i.estatus = ?  `, 
                [data.id_inventario, data.id_agente]  // Pasar 'data.estatus' y 'data.id_agente' como array
            );
            return result;
        } 

        // Si el rol no es ni ADMIN ni AGENTE, podemos devolver un error o un resultado vacío
        throw new Error("Rol no válido para la consulta.");
    } catch (error) {
        console.error("Error en la consulta:", error);
        throw error;  // Lanzamos el error para que lo maneje el bloque llamante
    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras la consulta.");
        }
    }
}


async function inventarioproducto(tabla, data) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        console.log(" Data inventarioProducto  ", data);  
        /* 
        // Si el rol del usuario es "ADMIN"
        if (data.roluser === "ADMIN") {
            const [result] = await conexion.execute( 
                `select i.id as id_detalle,  i.id_inventario,  i.registro_lote, i.num_entrada, i.id_tipo_mov,  t.des_movimiento,  
                    i.estatus  
                    from inventario_det as i 
                    INNER join tipo_movimiento t 
                            ON i.id_tipo_mov  =  t.id 
                    where  i.id_inventario = ? and i.estatus = ?  `, 
                // `SELECT * FROM ${tabla} WHERE estatus = ?`,
                [data.id_inventario, data.estatus]  // Asegúrate de pasar 'data.estatus' como array
            );
            return result;
        }
        */ 
            const [result] = await conexion.execute(               
                  ` select i.id, i.id_inventario_det, i.id_producto, p.nombre, i.estatus  
                      from inventario_producto i  
                     INNER join productos p 
                        ON p.id = i.id_producto  
                     where  i.id_inventario_det = ?  and  i.estatus = ?  `, 
                [data.id_inventario_det, data.estatus]  // Pasar 'data.estatus' y 'data.id_agente' como array
            );
            return result;
              
     
        // Si el rol no es ni ADMIN ni AGENTE, podemos devolver un error o un resultado vacío
        throw new Error("Rol no válido para la consulta.");
    } catch (error) {
        console.error("Error en la consulta:", error);
        throw error;  // Lanzamos el error para que lo maneje el bloque llamante
    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras la consulta.");
        }
    }
}


/*
function UsuariosAgente(tabla, data) {
    console.log("data", data)
    if (data.roluser === "ADMIN") {
        return new Promise((resolve, reject) => {
            conexion.query(`select u.*,  c.nom_cliente from users AS u
    LEFT JOIN  clientes as c
     on  u.id_cliente = c.id
    where U.ESTATUS = ?`, data.estatus,  (error, result) => {
                return error ? reject(error) : resolve(result);
            })
        })
    }

    if (data.roluser === "AGENTE") {
        return new Promise((resolve, reject) => {
            conexion.query(`select u.*,  c.nom_cliente from users AS u
    INNER JOIN  clientes as c
     on  u.id_cliente = c.id
    where c.id_agente = ? and U.ESTATUS = ?`, [data.id_agente, data.estatus], (error, result) => {
                return error ? reject(error) : resolve(result);
            })
        })
    }
}*/

async function UsuariosAgente(tabla, consulta) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        // Asegurarse de que consulta es un objeto con propiedades
        console.log("consulta.roluser", consulta.roluser)
        if (consulta.roluser === "ADMIN") {
            const parametros = [consulta.estatus];
            console.log("parametros", parametros)
            // Ejecutar la consulta usando los parámetros en un array
            const [result] = await conexion.execute(
                `select u.*,  c.nom_cliente from users AS u
                LEFT JOIN  clientes as c
                on  u.id_cliente = c.id
                where U.ESTATUS = ?`,
                 parametros // Pasar los parámetros como un array
            );

            // Retornar el primer resultado (suponiendo que solo hay uno)
            return result || null; // Si no hay coincidencias, se devuelve null
        }
        if (consulta.roluser === "AGENTE") {
            const parametros = [consulta.id_agente, consulta.estatus];
            console.log("parametros", parametros)
            // Ejecutar la consulta usando los parámetros en un array
            const [result] = await conexion.execute(
                `select u.*,  c.nom_cliente from users AS u
                INNER JOIN  clientes as c
                on  u.id_cliente = c.id
                where c.id_agente = ? and u.ESTATUS = ?`,
                parametros // Pasar los parámetros como un array
            );

            // Retornar el primer resultado (suponiendo que solo hay uno)
            return result || null; // Si no hay coincidencias, se devuelve null

        }

    } catch (error) {
        console.error("Error en el login:", error);
        throw error; // Lanzamos el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras UsuariosAgente");
        }
    }
}


/*
function validaUsuario(tabla, data) {
    console.log("data", data)
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT user_name,email, phone_number  FROM ${tabla} where user_name= ? or email = ? or phone_number = ?`, [data.user_name, data.email, data.phone_number], (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    })
}*/

async function validaUsuario(tabla, consulta) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        // Asegurarse de que consulta es un objeto con propiedades como 'user_name' y 'user_password'
        console.log("consulta", consulta)

        const parametros = [consulta.user_name, consulta.email, consulta.phone_number];
        console.log("parametros", parametros)
        // Ejecutar la consulta usando los parámetros en un array
        const [result] = await conexion.execute(
            `SELECT user_name,email, phone_number  FROM ${tabla} where user_name= ? or email = ? or phone_number = ?`,
            parametros // Pasar los parámetros como un array
        );

        // Retornar el primer resultado (suponiendo que solo hay uno)
        return result || null; // Si no hay coincidencias, se devuelve null

    } catch (error) {
        console.error("Error en el login:", error);
        throw error; // Lanzamos el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras validaUsuario");
        }
    }
}


/*
function login(tabla, consulta) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT id, user_password, user_name, rol_user, id_cliente  FROM ${tabla}  where ?`, consulta, (error, result) => {
            return error ? reject(error) : resolve(result[0]);
        })
    })
}*/

async function login(tabla, consulta) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        // Asegurarse de que consulta es un objeto con propiedades como 'user_name' y 'user_password'
        console.log("consulta", consulta)

        const parametros = [consulta.user_name];
        console.log("parametros", parametros)
        // Ejecutar la consulta usando los parámetros en un array
        const [result] = await conexion.execute(
            `SELECT id, user_password, user_name, rol_user, id_cliente, estatus, id_sucursal   
            FROM ${tabla} 
            WHERE user_name = ?`,
            parametros // Pasar los parámetros como un array
        );

        // Retornar el primer resultado (suponiendo que solo hay uno)
        return result[0] || null; // Si no hay coincidencias, se devuelve null

    } catch (error) {
        console.error("Error en el login:", error);
        throw error; // Lanzamos el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras login");
        }
    }
}

async function hitMaximo (tabla, consulta) { 
    console.log( "HitMaximo", consulta.id_cliente);  
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb(); 

        console.log("consulta", consulta)

        const parametros = [consulta.id_cliente];
        console.log("parametros", parametros)
        // Ejecutar la consulta usando los parámetros en un array
        const [result] = await conexion.execute(
            `SELECT max(num_hit) as num_hit FROM ${tabla}  where id_cliente = ?`,
            parametros // Pasar los parámetros como un array
        );
 
          /* 
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT max(num_hit) as num_hit FROM ${tabla}  where `, [consulta], (error, result) => {
            return error ? reject(error) : resolve(result[0]);
        })
    })
    */
        // Retornar el primer resultado (suponiendo que solo hay uno)
        return result[0] || null; // Si no hay coincidencias, se devuelve null

    } catch (error) {
        console.error("Error en el hitMaximo: ", error);
        throw error; // Lanzamos el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras hitMaximo ");
        }
    }; 

}


async function rendimiento (tabla, consulta) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        // Asegurarse de que consulta es un objeto con propiedades como 'user_name' y 'user_password'
        console.log(" rendimiento:  --> ", consulta); 
          
        const parametros = [consulta.precio_final, consulta.id_cliente];
        console.log(" parametros ", parametros)
        // Ejecutar la consulta usando los parámetros en un array
        const [result] = await conexion.execute(
            `UPDATE ${tabla} SET precio_final = ?, utilidad_perdida = round((valor_bcoin * precio_final) - (valor_bcoin * precio_inicial),2) 
             where  id  > 0  AND  id_cliente = ? `,
            parametros // Pasar los parámetros como un array
        );

        // Retornar el primer resultado (suponiendo que solo hay uno)
        return result || null; // Si no hay coincidencias, se devuelve null

    } catch (error) {
        console.error("Error en el login:", error);
        throw error; // Lanzamos el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras baja");
        }
    }
}
 
async function ProductosAutocomplete(query) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        // Asegurarse de que consulta es un objeto con propiedades como 'user_name' y 'user_password'
        console.log("query", query)
        let consultas = "";
        const termino = query.query;
        if (query.roluser === "ADMIN") {
            consultas = 'SELECT id, nombre as nom_cliente, precio_venta, stock_actual FROM productos WHERE nombre LIKE ?';
            // Ejecutar la consulta usando los parámetros en un array
            const [result] = await conexion.execute(
                consultas,
                [`%${termino}%`] // Pasar los parámetros como un array
            );

            // Retornar el primer resultado (suponiendo que solo hay uno)
            return result || null; // Si no hay coincidencias, se devuelve null
        }

        if (query.roluser === "VENDEDOR") {
            consultas = 'SELECT id, nombre as nom_cliente, precio_venta, stock_actual FROM productos WHERE nombre LIKE ?';
             // Ejecutar la consulta usando los parámetros en un array
             const [result] = await conexion.execute(
                consultas,
                [query.id_agente, `%${termino}%`] // Pasar los parámetros como un array
            );
             // Retornar el primer resultado (suponiendo que solo hay uno)
             return result || null; // Si no hay coincidencias, se devuelve null
        }
    } catch (error) {
        console.error("Error en el login:", error);
        throw error; // Lanzamos el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras productos autocomplete");
        }
    }
}

async function PiezasAutocomplete(query) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        // Asegurarse de que consulta es un objeto con propiedades como 'user_name' y 'user_password'
        console.log("query", query)
        let consultas = "";
        const termino = query.query;
        if (query.roluser === "ADMIN") {
            consultas = ' select id, id_producto, id_imagen, nombre_pieza, num_piezas, precio, descripcion_pieza, estatus from inventario_pieza  WHERE nombre_pieza LIKE ?';
            // Ejecutar la consulta usando los parámetros en un array
            const [result] = await conexion.execute(
                consultas,
                [`%${termino}%`] // Pasar los parámetros como un array
            );

            // Retornar el primer resultado (suponiendo que solo hay uno)
            return result || null; // Si no hay coincidencias, se devuelve null
        }

        if (query.roluser === "VENDEDOR") {            
                consultas = ' select id, id_producto, id_imagen, nombre_pieza, num_piezas, precio, descripcion_pieza, estatus from inventario_pieza  WHERE nombre_pieza LIKE ?';
             // Ejecutar la consulta usando los parámetros en un array
             const [result] = await conexion.execute(
                consultas,
                [query.id_agente, `%${termino}%`] // Pasar los parámetros como un array
            );
             // Retornar el primer resultado (suponiendo que solo hay uno)
             return result || null; // Si no hay coincidencias, se devuelve null
        }
    } catch (error) {
        console.error("Error en el login:", error);
        throw error; // Lanzamos el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras productos autocomplete");
        }
    }
}


async function InventarioAgente( consulta) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        // Asegurarse de que consulta es un objeto con propiedades
        console.log("consulta.roluser", consulta.roluser)
        if (consulta.roluser === "ADMIN") {
            const parametros = [consulta.estatus];
            console.log("parametros", parametros)
            // Ejecutar la consulta usando los parámetros en un array
            const [result] = await conexion.execute(
                `SELECT i.id, i.nombre_lote,  i.stock_total, i.fh_ingreso, i.precio_compra,
                 i.precio_compra_lote, u.nombre as Sucursal, i.estatus, u.id as IdSucursal, i.costo_transporte, i.origen_lote  
                 FROM inventario as i 
                INNER JOIN  almacenes AS u	
                    ON  i.id_almacen = u.id
                WHERE i.estatus = ?`,
                 parametros // Pasar los parámetros como un array
            );

            // Retornar el primer resultado (suponiendo que solo hay uno)
            return result || null; // Si no hay coincidencias, se devuelve null
        }
        if (consulta.roluser === "VENDEDOR") {
            const parametros = [consulta.id_agente, consulta.estatus];
            console.log("parametros", parametros)
            // Ejecutar la consulta usando los parámetros en un array
            const [result] = await conexion.execute(
                ` SELECT i.id, i.nombre_lote,  i.stock_total, i.fh_ingreso, i.precio_compra,
                 i.precio_compra_lote, u.nombre as Sucursal, i.estatus, u.id as IdSucursal, i.costo_transporte, i.origen_lote   
                    FROM inventario as i
                INNER JOIN  productos as p
                    on i.id_producto = p.id
                INNER JOIN  almacenes AS u
                    ON  i.id_ubicacion = u.id
                WHERE i.estatus = ?`,
                parametros // Pasar los parámetros como un array
            );

            // Retornar el primer resultado (suponiendo que solo hay uno)
            return result || null; // Si no hay coincidencias, se devuelve null

        }

    } catch (error) {
        console.error("Error en el login:", error);
        throw error; // Lanzamos el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras UsuariosAgente");
        }
    }
}

async function inventarioPiezas(tabla, consulta) {
    let conexion;
    try {
        // Obtener la conexión desde el pool
        conexion = await conexiondb();

        // Asegurarse de que consulta es un objeto con propiedades
        console.log("consulta.roluser", consulta.roluser)
        if (consulta.roluser === "ADMIN") {
            const parametros = [consulta.id_producto, consulta.estatus];
            console.log("parametros", parametros)
            // Ejecutar la consulta usando los parámetros en un array
            const [result] = await conexion.execute(
                ` select  id as id_pieza,  id_producto, id_imagen, nombre_pieza, num_piezas, precio, descripcion_pieza, estatus
                    from inventario_pieza
                    where  id_producto = ? and estatus = ?  `, 
                 parametros // Pasar los parámetros como un array
            );

            // Retornar el primer resultado (suponiendo que solo hay uno)
            return result || null; // Si no hay coincidencias, se devuelve null
        }
        if (consulta.roluser === "VENDEDOR") {            
            const parametros = [consulta.id_producto, consulta.estatus];
            console.log("parametros", parametros)
            // Ejecutar la consulta usando los parámetros en un array
            const [result] = await conexion.execute(
                 ` select id as id_pieza, id_producto, id_imagen, nombre_pieza, num_piezas, precio, descripcion_pieza, estatus
                     from inventario_pieza 
                    where id_producto = ? and i.estatus = ?  `, 
                parametros // Pasar los parámetros como un array
            );

            // Retornar el primer resultado (suponiendo que solo hay uno)
            return result || null; // Si no hay coincidencias, se devuelve null

        } 
 
    } catch (error) {
        console.error("Error en el login:", error);
        throw error; // Lanzamos el error para que lo maneje el bloque llamante

    } finally {
        // Liberar la conexión si se obtuvo
        if (conexion) {
            conexion.release();
            console.log("Conexión liberada tras UsuariosAgente");
        }
    }
}



module.exports = {
    todos,
    uno,
    agregar,
    agregarArray,  
    baja,
    query,
    Movimientos,
    MovimientosPorPeriodo, 
    ResumenMovimientos,  
    clientesAutocomplete,
    productoAutocomplete, 
    todosAgente,
    todosDetalleCompra,  
    UsuariosAgente,
    validaUsuario,
    login, 
    hitMaximo, 
    rendimiento, 
    vendedorAutocomplete,   
    ProductosAutocomplete, 
    usuarioAutocomplete,  
    PiezasAutocomplete, 
    InventarioAgente,  
    inventarioDetalle, 
    inventarioPiezas, 
    inventarioproducto, 
    todosAgenteProducto, 
    todosAlmacenes
}
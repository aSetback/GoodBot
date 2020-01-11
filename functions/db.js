const mysql = require('mysql');

module.exports = {
	query: (query) => {
        let connection = mysql.createConnectionSync({
            host: client.config.db.ip,
            user: client.config.db.user,
            password: client.config.db.pass,
            database: 'GoodBot'
        });
        query(connertion, query);
    
    }
}

async function query(con, query) {
    con.connect((err) => {
        if (err) { 
            console.log('MySQL Error:');
            console.log(err);
        }
        con.query(query, (err, result, fields) => {
            con.end();
            resolve(result);
        });
    });
}
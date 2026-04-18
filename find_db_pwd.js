const mysql = require('mysql2/promise');

async function checkLocal() {
    const passwords = ['', 'password', 'root', 'admin', '12345678', '1234'];
    for (const pwd of passwords) {
        try {
            console.log(`Trying password: "${pwd}"`);
            const connection = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: pwd
            });
            console.log(`✅ Success! Local MySQL root password is: "${pwd}"`);
            await connection.end();
            return;
        } catch (err) {
            console.log(`❌ Failed: ${err.message}`);
        }
    }
}

checkLocal();

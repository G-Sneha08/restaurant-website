const bcrypt = require('bcryptjs');
const fs = require('fs');

async function test() {
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);
    console.log('Generated Hash:', hash);
    const isMatch = await bcrypt.compare(password, hash);
    console.log('Match Check:', isMatch);
    fs.writeFileSync('verified_hash.txt', hash);
}

test();

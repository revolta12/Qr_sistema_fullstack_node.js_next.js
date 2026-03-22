const bcrypt = require('bcryptjs');

async function buatHash() {
    const passwordBaru = 'deonisio';
    const saltRounds = 10; // Standar keamanan

    // Proses hashing
    const hashBaru = await bcrypt.hash(passwordBaru, saltRounds);
    
    console.log('Hash untuk "deonisio":', hashBaru);
}

buatHash();

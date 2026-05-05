const bcrypt = require('bcryptjs');
const hash = '$2b$10$ljFd.5HjalSzGQKM7tfFLOB.n1YDeZv5PdpRQPaa.2xAdEKmzNbVm';
const pass = 'admin123';

bcrypt.compare(pass, hash).then(res => {
    console.log('Match:', res);
});

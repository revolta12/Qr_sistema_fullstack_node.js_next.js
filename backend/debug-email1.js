require('dotenv').config();

console.log('Debugging Email Configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-4) : 'MISSING');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);

if (!process.env.EMAIL_USER) {
    console.log('EMAIL_USER is missing in .env');
}
if (!process.env.EMAIL_PASSWORD) {
    console.log('EMAIL_PASSWORD is missing in .env');
}

console.log('Testing dotenv...');
console.log('PORT:', process.env.PORT);
console.log('DB_HOST:', process.env.DB_HOST);
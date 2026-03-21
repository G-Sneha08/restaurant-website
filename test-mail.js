// test-mail.js
require('dotenv').config();
const { sendWelcomeEmail } = require('./server/utils/sendEmail');

const testEmail = process.argv[2] || process.env.EMAIL_USER;

if (!testEmail || testEmail.includes('yourgmail')) {
    console.error('❌ Please provide a real email address as an argument or in .env (EMAIL_USER)');
    console.log('Usage: node test-mail.js recipient@example.com');
    process.exit(1);
}

async function runTest() {
    console.log(`🚀 Starting Email System Test...`);
    console.log(`📤 Recipient: ${testEmail}`);
    console.log(`🔑 Using Email: ${process.env.EMAIL_USER}`);

    try {
        const result = await sendWelcomeEmail(testEmail, 'Tester');
        if (result) {
            console.log('✅ TEST PASSED: Check your inbox/spam for the welcome email.');
        } else {
            console.log('❌ TEST FAILED: The email utility returned null. Check console above for SMTP errors.');
        }
    } catch (err) {
        console.error('❌ TEST FAILED WITH CRITICAL ERROR:', err);
    }
}

runTest();

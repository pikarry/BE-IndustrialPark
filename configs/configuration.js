require('dotenv').config();
module.exports = {
  SALT_ROUND: +10,
  SECRET_KEY: 'fdafeojjfsdjurururskd',
  DB_URL: 'mongodb://127.0.0.1:27017/HienHoang',
  USER_ADMIN: {
    email: 'hienhoang@gmail.com',
    password: 'hien123@',
    phone: '0966567778',
    address: 'Ha Noi',
    fullname: 'admin',
    gender: 'admin',
    role: 'admin',
  },
  gmail: {
    USER: process.env.EMAIL_USER,
    PASS: process.env.EMAIL_PASS,
  },
};

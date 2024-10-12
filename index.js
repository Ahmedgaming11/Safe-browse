require('dotenv').config();
const express = require('express');
const httpProxy = require('http-proxy');
const crypto = require('crypto-js');
const path = require('path');

const app = express();
const proxy = httpProxy.createProxyServer();

// قائمة بالمواقع المسموح بها
const allowedSites = ["https://www.google.com", "https://www.example.com"];

// دالة لفحص أمان الموقع
function isSecureSite(url) {
  return allowedSites.includes(url);
}

// دالة تشفير البيانات باستخدام مفتاح من .env
function encryptData(data) {
  const secretKey = process.env.SECRET_KEY;
  return crypto.AES.encrypt(data, secretKey).toString();
}

// دالة لفك تشفير البيانات
function decryptData(encryptedData) {
  const secretKey = process.env.SECRET_KEY;
  const bytes = crypto.AES.decrypt(encryptedData, secretKey);
  return bytes.toString(crypto.enc.Utf8);
}

// تقديم الملفات الثابتة من المجلد العام
app.use(express.static(path.join(__dirname, 'public')));

// توجيه الطلبات إلى الموقع المحدد بعد التحقق من الأمان
app.get('/proxy', (req, res) => {
  const targetUrl = req.query.url;
  
  if (isSecureSite(targetUrl)) {
    proxy.web(req, res, { target: targetUrl, changeOrigin: true });
  } else {
    res.status(403).send("عذرًا، هذا الموقع غير آمن ولن يُسمح بفتحه.");
  }
});

// تشفير البيانات عبر واجهة برمجية
app.get('/encrypt', (req, res) => {
  const data = req.query.data;
  const encryptedData = encryptData(data);
  res.send(`البيانات المشفرة: ${encryptedData}`);
});

// فك تشفير البيانات عبر واجهة برمجية
app.get('/decrypt', (req, res) => {
  const encryptedData = req.query.data;
  const decryptedData = decryptData(encryptedData);
  res.send(`البيانات المفككة: ${decryptedData}`);
});

// بدء الخادم على المنفذ 3000
app.listen(3000, () => {
  console.log('الخادم يعمل على http://localhost:3000');
});
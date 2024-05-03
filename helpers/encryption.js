const crypto = require('crypto');

function encrypt(text, secretKey) {
  const key = crypto.createHash('sha256').update(secretKey).digest(); 
  const iv = crypto.randomBytes(16); 

  const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return { iv: iv.toString('hex'), content: encrypted }; 
}

function decrypt(encryptedData, secretKey) {
  const key = crypto.createHash('sha256').update(secretKey).digest(); 
  const { iv, content } = encryptedData;

  const decipher = crypto.createDecipheriv('aes-256-ctr', key, Buffer.from(iv, 'hex'));

  let decrypted = decipher.update(content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

module.exports = { encrypt, decrypt };

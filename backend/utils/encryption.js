const crypto = require('crypto-js');
require('dotenv').config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

/**
 * Encrypts text using AES-256.
 * @param {string} text - The text to encrypt.
 * @returns {string} - The encrypted text.
 */
function encrypt(text) {
  return crypto.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

/**
 * Decrypts text using AES-256.
 * @param {string} ciphertext - The encrypted text.
 * @returns {string} - The decrypted text.
 */
function decrypt(ciphertext) {
  const bytes = crypto.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(crypto.enc.Utf8);
}

module.exports = { encrypt, decrypt };

var CryptoJS = require("crypto-js");

function utf8ToHex(str) {
      return Array.from(str).map(c => 
        c.charCodeAt(0) < 128 ? c.charCodeAt(0).toString(16) : 
        encodeURIComponent(c).replace(/\%/g,'').toLowerCase()
      ).join('');
}
   
function hexToUtf8 (hex) {
      return decodeURIComponent('%' + hex.match(/.{1,2}/g).join('%'));
}

String.prototype.reverse = function() {
  return this.split('').reverse().join('');
}

function EncryptBearerMessage(data, captchasecret, codeverifier) {
	return AES_Fast_Encrypt(codeverifier + captchasecret + codeverifier, data);
}

function DecryptBearerMessage(encrypteddata, captchasecret, codeverifier) {
	return AES_Fast_Decrypt(codeverifier + captchasecret + codeverifier, encrypteddata);
}

function AES_Default_Encrypt(password, data) {
	var istring = utf8ToHex(password).substring(0,5);
	var iterations = parseInt(istring,16);
	var keyBytes = CryptoJS.PBKDF2(password, CryptoJS.enc.Utf8.parse(password + password.reverse()), { hasher: CryptoJS.algo.SHA512, keySize: 48 / 4, iterations: iterations });
	var key = new CryptoJS.lib.WordArray.init(keyBytes.words, 32);
	var iv = new CryptoJS.lib.WordArray.init(keyBytes.words.splice(32 / 4), 16);
	return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), key, { iv: iv });
}

function AES_Default_Decrypt(password, encrypteddata) {
	var istring = utf8ToHex(password).substring(0,5);
	var iterations = parseInt(istring,16);
	var keyBytes = CryptoJS.PBKDF2(password, CryptoJS.enc.Utf8.parse(password + password.reverse()), { hasher: CryptoJS.algo.SHA512, keySize: 48 / 4, iterations: iterations });
	var key = new CryptoJS.lib.WordArray.init(keyBytes.words, 32);
	var iv = new CryptoJS.lib.WordArray.init(keyBytes.words.splice(32 / 4), 16);
	return CryptoJS.AES.decrypt(encrypteddata, key, { iv: iv });
}

function AES_Fast_Encrypt(password, data) {
	var istring = utf8ToHex(password).substring(0,3);
	var iterations = parseInt(istring,16);
	var keyBytes = CryptoJS.PBKDF2(password, CryptoJS.enc.Utf8.parse(password + password.reverse()), { hasher: CryptoJS.algo.SHA512, keySize: 48 / 4, iterations: iterations });
	var key = new CryptoJS.lib.WordArray.init(keyBytes.words, 32);
	var iv = new CryptoJS.lib.WordArray.init(keyBytes.words.splice(32 / 4), 16);
	return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), key, { iv: iv });
}

function AES_Fast_Decrypt(password, encrypteddata) {
	var istring = utf8ToHex(password).substring(0,3);
	var iterations = parseInt(istring,16);
	var keyBytes = CryptoJS.PBKDF2(password, CryptoJS.enc.Utf8.parse(password + password.reverse()), { hasher: CryptoJS.algo.SHA512, keySize: 48 / 4, iterations: iterations });
	var key = new CryptoJS.lib.WordArray.init(keyBytes.words, 32);
	var iv = new CryptoJS.lib.WordArray.init(keyBytes.words.splice(32 / 4), 16);
	return CryptoJS.AES.decrypt(encrypteddata, key, { iv: iv });
}

export { EncryptBearerMessage, DecryptBearerMessage };

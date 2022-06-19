function HexaEightCaptcha(){
}

HexaEightCaptcha.prototype = (function() {

	var codeverifier = generateCodeVerifier();
	var codechallenge = generateCodeChallenge(codeverifier);
	var email = "";
	var emailsha512hash = "";
	var qrcodecaptcharesp = "";
	var defaultkeyBytes;
	var fastkeyBytes;



        function generateCodeChallenge(code_verifier) {
            return base64URL(CryptoJS.SHA256(code_verifier))
        }

        function base64URL(string) {
            return string.toString(CryptoJS.enc.Base64).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
        }

        async function SetUserSecret(code) {
	    var dstring = utf8ToHex(code).substring(0,5);
	    var diterations = parseInt(dstring,16);
	    defaultkeyBytes = CryptoJS.PBKDF2(password, CryptoJS.enc.Utf8.parse(code + code.reverse()), { hasher: CryptoJS.algo.SHA512, keySize: 48 / 4, iterations: diterations });
	    if (codechallenge != "") {
	            var fsecret = codeverifier + password + codeverifier;
		    var fstring = utf8ToHex(fsecret).substring(0,3);
		    var fiterations = parseInt(fstring,16);
		    fastkeyBytes = CryptoJS.PBKDF2(fsecret, CryptoJS.enc.Utf8.parse(fsecret + fsecret.reverse()), { hasher: CryptoJS.algo.SHA512, keySize: 48 / 4, iterations: fiterations });
	    }
        }

        function SetTokenServerInitialResponse(code) {
            qrcodecaptcharesp=code;
        }

        function FetchQRCodeForDisplay() {
            var code = qrcodecaptcharesp.split("|");
            return 'Hexa8BCODE|' + code[1] + '|' + code[2];
        }

	function FetchEncryptedCodeVerifier() {
		return AES_Default_Encrypt(email + codeverifier);			
	}

        function SetUserEmail(emailid) {
            email = emailid;
	    		  emailsha512hash = CryptoJS.SHA512(email.trim()).toString();
        }

        function FetchCaptchaRetrivalCode() {
	    return emailsha512hash + "|" + codechallenge.trim();
        }

	function FetchQRCodeFromTokenServer(tokenserverurl) {
		var retrivalcode = FetchCaptchaRetrivalCode();

        	return fetch(tokenserverurl + "/api/fetch-captcha", {
                	method: 'POST',
	                headers: {
        	            'Content-Type': 'application/text',
                	    'Access-Control-Allow-Origin': '*',
	                    'Access-Control-Allow-Methods': 'POST',
        	            'Access-Control-Allow-Headers': 'access-control-allow-headers,access-control-allow-methods,access-control-allow-origin'
	                },
        	        body: retrivalcode
	            })
        	    .then((res) => {
                	if (res.status == 200) {
	                    return res.text()
        	        } else {
                	    throw Error(res.statusText)
	             	}
	            })
	            .then(response => {
			SetTokenServerInitialResponse(response);
        	    })
	            .catch(function() {
        	        console.error();
	            });
	}

        function generateCodeVerifier() {
            return generateRandomString(128);
        }

	function generateRandomString(length) {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
            for (var i = 0; i < length; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        }

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

	function EncryptBearerMessage (data) {
		return FetchEncryptedCodeVerifier() + AES_Fast_Encrypt(data);
	}

	function DecryptBearerMessage (encrypteddata) {
		return AES_Fast_Decrypt(encrypteddata);
	}

	function AES_Default_Encrypt(data) {
		var key = new CryptoJS.lib.WordArray.init(defaultkeyBytes.words, 32);
		var iv = new CryptoJS.lib.WordArray.init(defaultkeyBytes.words.splice(32 / 4), 16);
		return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), key, { iv: iv });
	}

	function AES_Default_Decrypt(encrypteddata) {
		var key = new CryptoJS.lib.WordArray.init(defaultkeyBytes.words, 32);
		var iv = new CryptoJS.lib.WordArray.init(defaultkeyBytes.words.splice(32 / 4), 16);
		return CryptoJS.AES.decrypt(encrypteddata, key, { iv: iv });
	}

	function AES_Fast_Encrypt(data) {
		var key = new CryptoJS.lib.WordArray.init(fastkeyBytes.words, 32);
		var iv = new CryptoJS.lib.WordArray.init(fastkeyBytes.words.splice(32 / 4), 16);
		return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), key, { iv: iv });
	}

	function AES_Fast_Decrypt(encrypteddata) {
		var key = new CryptoJS.lib.WordArray.init(fastkeyBytes.words, 32);
		var iv = new CryptoJS.lib.WordArray.init(fastkeyBytes.words.splice(32 / 4), 16);
		return CryptoJS.AES.decrypt(encrypteddata, key, { iv: iv });
	}

	return {
		SetUserEmail: SetUserEmail,
		FetchQRCodeFromTokenServer: FetchQRCodeFromTokenServer,
		FetchQRCodeForDisplay: FetchQRCodeForDisplay,
		SetUserSecret: SetUserSecret,
		EncryptBearerMessage: EncryptBearerMessage,
		DecryptBearerMessage: DecryptBearerMessage
	};

})();


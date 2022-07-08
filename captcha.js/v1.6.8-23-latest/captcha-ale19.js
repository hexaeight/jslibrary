function HexaEightCaptcha(){
}

HexaEightCaptcha.prototype = (function() {

	var codeverifier = generateCodeVerifier();
	var codechallenge = generateCodeChallenge(codeverifier);
	var email = "";
	var emailsha512hash = "";
	var qrcodecaptcharesp = "";
	var defaultkey;
	var defaultiv;
	var fastkey;
	var fastiv;
	var aleconfig = "";

	var bearertoken ="";


        function SetALEMode(mode) {
		aleconfig=mode;
	}

        function generateCodeChallenge(code_verifier) {
            return base64URL(CryptoJS.SHA256(code_verifier))
        }

        function base64URL(string) {
            return string.toString(CryptoJS.enc.Base64).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
        }

        async function SetUserSecret(code) {
	    var hexsecret = "";
	    if (aleconfig == "Quick") {
		    hexsecret = utf8ToHex(code).substring(0,3);
	    }
	    else {
		    hexsecret = utf8ToHex(code).substring(0,5);
	    }
	    var niterations = parseInt(hexsecret,16);
	    defaultBytes = new CryptoJS.PBKDF2(code, CryptoJS.enc.Utf8.parse(code + code.reverse()), { hasher: CryptoJS.algo.SHA512, keySize: 48 / 4, iterations: niterations });
	    defaultkey = new CryptoJS.lib.WordArray.init(defaultBytes.words, 32);
	    defaultiv = new CryptoJS.lib.WordArray.init(defaultBytes.words.splice(32 / 4), 16);

	    if (codechallenge != "") {
	      	    var fsecret = codeverifier + code + codeverifier;
		    var fstring = utf8ToHex(fsecret).substring(0,3);
		    var fiterations = parseInt(fstring,16);
		    fastBytes = new CryptoJS.PBKDF2(fsecret, CryptoJS.enc.Utf8.parse(fsecret + fsecret.reverse()), { hasher: CryptoJS.algo.SHA512, keySize: 48 / 4, iterations: fiterations });
		    fastkey = new CryptoJS.lib.WordArray.init(fastBytes.words, 32);
		    fastiv = new CryptoJS.lib.WordArray.init(fastBytes.words.splice(32 / 4), 16);
	    }
        }

        function SetTokenServerInitialResponse(code) {
            qrcodecaptcharesp=code;
	    try {
		    var respcode = qrcodecaptcharesp.split("|");
		    if (respcode[3] == "Q") {
		    	aleconfig="Quick";
		    }
		    else {
		    	aleconfig="Default";
		    }
	    }
	    catch {aleconfig = "Default"; }
        }

        function FetchQRCodeForDisplay() {
            var code = qrcodecaptcharesp.split("|");
            return 'Hexa8BCODE|' + code[1] + '|' + code[2];
        }

	function FetchEncryptedCodeVerifier() {
		return AES_Default_Encrypt(email.trim() + "|" + codeverifier.toString());			
	}


	function GetSessionAccessToken() {
		return bearertoken;			
	}


        function SetUserEmail(emailid) {
            email = emailid;
	    emailsha512hash = CryptoJS.SHA512(email.trim()).toString();
        }

        function FetchCaptchaRetrivalCode() {
	    return emailsha512hash + "|" + codechallenge.trim();
        }

        function FetchCaptchaRetrivalCodeForEmail() {
	    return email + "|" + codechallenge.trim();
        }


	async function FetchQRCodeFromTokenServer(tokenserverurl) {
		var retrivalcode = FetchCaptchaRetrivalCode();

        	return await fetch(tokenserverurl + "/api/fetch-captcha", {
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

	async function FetchQRCodeFromTokenServerUsingEmail(tokenserverurl) {
		var retrivalcode = FetchCaptchaRetrivalCodeForEmail();
		if (tokenserverurl.includes("http://")) {
			tokenserverurl.replace("http://","https://");
		}
        	return await fetch(tokenserverurl + "/api/fetch-captcha-for-email", {
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


	async function FetchSessionAccessToken(tokenserverurl) {
		var coderesp = qrcodecaptcharesp.split("|");
		var verificationcode = email + "|" + codeverifier.trim() + "|" + coderesp[0];
		var everificationcode = emailsha512hash + "|" + AES_Default_Encrypt(verificationcode);
        	return await fetch(tokenserverurl + "/api/verify-captcha", {
                	method: 'POST',
	                headers: {
        	            'Content-Type': 'application/text',
                	    'Access-Control-Allow-Origin': '*',
	                    'Access-Control-Allow-Methods': 'POST',
        	            'Access-Control-Allow-Headers': 'access-control-allow-headers,access-control-allow-methods,access-control-allow-origin'
	                },
        	        body: everificationcode 
	            })
        	    .then((res) => {
                	if (res.status == 200) {
	                    return res.text()
        	        } else {
                	    throw Error(res.statusText)
	             	}
	            })
	            .then(response => {
			bearertoken=response;
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
		if (aleconfig == "Quick") {
			return FetchEncryptedCodeVerifier() + "." + AES_Fast_Encrypt(data) + ".Q";
		}
		else {
			return FetchEncryptedCodeVerifier() + "." + AES_Fast_Encrypt(data) + ".D";
		}
	}

	function DecryptBearerMessage (encrypteddata) {
		return AES_Fast_Decrypt(encrypteddata);
	}


	function AES_Default_Encrypt(data) {
		return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), defaultkey, { iv: defaultiv, mode: CryptoJS.mode.CBC });
	}

	function AES_Default_Decrypt(encrypteddata) {
		return CryptoJS.AES.decrypt(encrypteddata, defaultkey, { iv: defaultiv, mode: CryptoJS.mode.CBC });
	}


	function AES_Fast_Encrypt(data) {
		return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), fastkey, { iv: fastiv, mode: CryptoJS.mode.CBC });
	}

	function AES_Fast_Decrypt(encrypteddata) {
		return CryptoJS.AES.decrypt(encrypteddata, fastkey, { iv: fastiv, mode: CryptoJS.mode.CBC });
	}

	return {
		SetUserEmail: SetUserEmail,
		FetchQRCodeFromTokenServer: FetchQRCodeFromTokenServer,
		FetchQRCodeFromTokenServerUsingEmail: FetchQRCodeFromTokenServerUsingEmail,
		FetchQRCodeForDisplay: FetchQRCodeForDisplay,
		SetUserSecret: SetUserSecret,
		FetchSessionAccessToken: FetchSessionAccessToken,
		GetSessionAccessToken: GetSessionAccessToken,
		EncryptBearerMessage: EncryptBearerMessage,
		DecryptBearerMessage: DecryptBearerMessage,
		AES_Default_Encrypt:AES_Default_Encrypt,
		AES_Default_Decrypt:AES_Default_Decrypt,
		AES_Fast_Encrypt:AES_Fast_Encrypt,
		AES_Fast_Decrypt:AES_Fast_Decrypt

	};

})();

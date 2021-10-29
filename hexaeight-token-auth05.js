(function () {

    var jQuery;

    if (window.jQuery === undefined) {
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src",
            "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js");
        if (script_tag.readyState) {
            script_tag.onreadystatechange = function () {
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    scriptLoadHandler();
                }
            };
        } else {
            script_tag.onload = scriptLoadHandler;
        }
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    } else {
        jQuery = window.jQuery;
        main();
    }

    function scriptLoadHandler() {
        jQuery = window.jQuery.noConflict(true);
        main();
    }

    function generateCodeVerifier() {
        var code_verifier = generateRandomString(32);
        return code_verifier;
    }

    function generateRandomString(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    async function generateCodeChallenge(code_verifier) {
        return code_challenge = base64URL(CryptoJS.SHA256(code_verifier));
    }

    function base64URL(string) {
        return string.toString(CryptoJS.enc.Base64).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    }

    async function postdata(url, postdata) {
        fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/text',
            },
            body: postdata,
        }).then(response => {
            console.log("Data Posted successfully.");
        }).catch(err => {
            console.log("Posting Data unsuccessful."+err);
	    alert("Error Encountered");
        });
    }



    function main() {



        jQuery(document).ready(function ($) {

            $(document).ready(function () {

                $.when(
                    $.getScript("https://cdnjs.cloudflare.com/ajax/libs/jquery.qrcode/1.0/jquery.qrcode.min.js"),
                    $.getScript("https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.min.js"),
                    //$.getScript( "https://unpkg.com/peerjs@1.3.1/dist/peerjs.min.js" ),
                    $.getScript("https://cdn.jsdelivr.net/clipboard.js/1.5.10/clipboard.min.js"),
                    $.Deferred(function (deferred) {
                        $(deferred.resolve);
                    })
                ).done(function () {

                    var servername = $('#hexaeightclient').attr("servername");
                    var path = $('#hexaeightclient').attr("path");
                    var redirecturl = $('#hexaeightclient').attr("redirecturl");
                    var clientappcode = $('#hexaeightclient').attr("clientappcode");
                    var datasinkprotocol = $('#hexaeightclient').attr("datasinkprotocol");
                    var datasinkurl = $('#hexaeightclient').attr("datasinkurl");

                    var postdataurl = generateRandomString(16);
                    var recievedataurl = generateRandomString(16);
                    var qrcodeid = generateRandomString(5);


                    if (servername === undefined || servername == "") {
                        servername = location.hostname;
                    }

                    if (path === undefined || servername == "") {
                        path = "/";
                    }

                    if (datasinkprotocol  === undefined || datasinkprotocol  == "") {
                        console.log("Missing DataSinkProtocol. Contact Resource Owner with this error message.");
                    }

                    if (datasinkurl   === undefined || datasinkurl   == "") {
                        console.log("Missing DataSinkUrl. Contact Resource Owner with this error message.");
                    }


                    if (clientappcode === undefined || clientappcode == "") {
                        console.log("Missing Client App Code. Contact Resource Owner with this error message.");
                    }


                    if (redirecturl === undefined || redirecturl == "") {
                        console.log("Redirect URL not defined. Set the redirect url to redirect this page upon login");
                    } else {

                        var clipboard = new Clipboard('button');
                        clipboard.on('success', function (e) {
                            //console.log(e);
                        });
                        clipboard.on('error', function (e) {
                            console.log(e);
                        });

                        $.ajaxSetup({
                            xhrFields: {
                                withCredentials: true
                            }
                        });

                        document.getElementById("scan-hexaeight-qrcode").setAttribute("data-clipboard-text", "Empty");

                        window.HexaEightAuthResponse = "";

                       $("#scan-hexaeight-qrcode").click(function (e) {
                            if (document.getElementById("scan-hexaeight-qrcode").getAttribute("data-clipboard-text") != "Empty") {
                                var url = "https://www.hexaeight.com/qrcode/" + document.getElementById("scan-hexaeight-qrcode").getAttribute("data-clipboard-text").replace("|", "%7c");
                                window.location = url;
                            }
                        });

                        let cv = generateCodeVerifier();
                        console.log("Generated Verification Code:" + cv);
                        let cc = generateCodeChallenge(cv);
                        let qrcodedata = "";


                        
                        $("#login-hexaeight-button").click(function (e) {

			        fetch(location.protocol + "//" + servername + path + "login", {
				   method: 'POST',
				   mode: 'no-cors',
			           headers: {
			                'Content-Type': 'application/text',
			            },
			            body: recievedataurl + "|" + cv,
			        }).then(response => {
				        setTimeout(()=>{
					            console.log("Processing Login Request... Please Wait");
					        ;} , 3000
				        );

			            console.log("Data Posted successfully.");
        		            $.get(location.protocol + "//" + servername + path + "login", function (resp, status) {
	                	                document.getElementById("display-hexaeight-qrcode").innerHTML = "";
		                	        if (resp.includes("SessionResponse: User Authenticated Successfully.")) {
		                                    window.location.href = "https://" + window.location.hostname + redirecturl;
			                        }
						else
						{
							 location.reload();
						}
					});

			        }).catch(err => {
			            console.log("Posting Data unsuccessful."+err);
			        });
    
                        });


                   
                    var request = "";
                    $.get(location.protocol + "//" + servername + path + "login", function (resp, status) {

                        if (resp.includes("SessionResponse: User Authenticated Successfully.")) {
                            window.location.href = "https://" + window.location.hostname + redirecturl;
                        }
                        else
                        {

                            console.log("Starting User Authentication Process");
                            cc.then(function (challenge) {
                                console.log("Generated Challenge Code");
                                let url = 'https://hexaeight.com/get-new-pretoken';
                                fetch(url, {
                                    method: 'post',
                                    body: challenge + "|" + clientappcode,
                                }).then(response => response.text()).then(response => {
                                    let qresp = postdata(datasinkprotocol +"://" + datasinkurl + "/" +postdataurl, "HEToken|" + response);
                                    qresp.then(function () {
                                        qrcodedata = "Hexa8UAUTH|" + qrcodeid + "|" + datasinkprotocol + "|" + datasinkurl + "/" + postdataurl + "|" + datasinkurl + "/" + recievedataurl;
                                        console.log("Generated QRCode");
                                        document.getElementById("display-hexaeight-qrcode").innerHTML = "";
                                        $('#display-hexaeight-qrcode').qrcode({
                                            text: qrcodedata
                                        });
                                        var codebutton = document.getElementById("scan-hexaeight-qrcode");
                                        codebutton.setAttribute("data-clipboard-text", qrcodedata);
                                        codebutton.disabled = false;
                                    });
                                  });

                                });
                            }

                        });

                    }
                });
            });
        });
    }
})();

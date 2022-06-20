var timer;
var HexaEight = new HexaEightCaptcha();
$("button").on('click', function() {
    $(this).addClass('opacity');
    var customCss = "<style>div#qrcode div {  text-align: center; } div#qrcode div button { margin-top: 20px; } .opacity { pointer-events: none; opacity: 0.5; }div img { margin: 0 auto; margin-top: 30px; }div#qrcode span {min-width: 256px;background: #000;display: inline-block;color: #fff;padding: 10px;font-size: 20px;margin-top: 2px;margin-bottom:20px;}</style>"
    $('head').append(customCss);
    var me = document.querySelector('script[fetchurl][verifyurl]');
    var fetchCaptcha = me.getAttribute('fetchurl');
    var captchaValidation = me.getAttribute('verifyurl');
    var captchaButtonSuccessUrl = $(this).attr('data-hexaeight-success-url');
    var captchaButtonRequestMessage = $(this).attr('data-hexaeight-request-message');

    var inputid = $(this).attr('data-hexaeight-input');
    var protect = $(this).attr('data-hexaeight-protect');


    if (typeof inputid !== typeof undefined && inputid !== false && typeof protect !== typeof undefined && protect !== false) {
        if (protect == 'true' || protect == 'TRUE') {
            widgetQRCode(this, fetchCaptcha, captchaValidation, captchaButtonSuccessUrl, captchaButtonRequestMessage, inputid);
        }
    }
});

$("#myModal .close").on('click', function() {
    $('input.form-control').val('');
    clearTimeout(timer);
});

function widgetQRCode(_this, _fetchCaptchaUrl, _captchaValidationUrl, _captchaButtonSuccessUrl, _captchaButtonRequestMessage, inputid) {
    let inputBox = document.getElementById(inputid);
    if (inputBox.value != '') {
        $(inputBox).prop('disabled', true);
        $('.loader').show();
	HexaEight.SetUserEmail(inputBox.value);
	const qrcoderequest = this.HexaEight.FetchQRCodeFromTokenServer(_fetchCaptchaUrl);
	qrcoderequest.then(resp => {
                	var qrcode = this.HexaEight.FetchQRCodeForDisplay();
			console.log(qrcode);
	        	        var urlcode = 'https://www.hexaeight.com/qrcode/' + qrcode;
        		        $('.loader').hide();
	        	        var modalpopup = "<div id='myModal' class='modal fade' role='dialog'><div class='modal-dialog'><div class='modal-content'><div class='modal-header d-block'><h4 class='modal-title text-center'>Use <a href='https://www.hexaeight.com/help/how-to-create-your-first-digital-token.html' target='_blank'>HexaEight Digital Token</a> To Scan This QR Code</h4></div><div class='modal-body'><div class='loader'></div><div id='qrcode'></div></div></div></div></div>";
		                $('body').append(modalpopup);
		                $('#myModal').modal({
        		            backdrop: 'static',
                		    keyboard: false
		                });
        		        $("#myModal").modal('show');
                		var displayQR = document.getElementById("qrcode");
				displayQR.innerHTML = '';
		                var qrcode = new QRCode(displayQR, {
        		            text: qrcode,
                		    colorDark: "#000000",
		                    colorLight: "#ffffff",
        		            correctLevel: QRCode.CorrectLevel.H
                		});
	                	var scanMe = "<div><span> <a href='" + urlcode + "' target='_blank'>Scan Me</a></span></div>";
	        	        displayQR.insertAdjacentHTML("beforeend", scanMe);
		                var fName = "<div><div>EnterCaptcha: </div><input type=\"password\" class=\"fieldname text-center\" /></div>";
        		        var button = "<div><button id=\"submitQRCode\" class=\"btn btn-primary\">OK</button></div>";
				displayQR.insertAdjacentHTML("beforeend", fName);
				setTimeout(function() {
				displayQR.insertAdjacentHTML("beforeend", button);
				displayQR.lastChild.children[0].addEventListener("click", function() {
        	                	captchaValidation(_captchaValidationUrl, _captchaButtonSuccessUrl, _captchaButtonRequestMessage, inputid, _this);
	                	    });
	                	}, 3000);
		                var timer = setTimeout(function() {
        		            $("#myModal").modal('hide');
		                    $(_this).removeClass('opacity');
        		            $(inputBox).prop('disabled', false);
	        	            $('#myModal').remove();
        	        	    $('.modal-backdrop').remove();
	                	    $('body').removeClass('modal-open');
		                }, 120000);
		     })
        	    .catch(function() {
                	console.error;
			alert('A Valid Captcha was not Found. Generate a new Captcha using Captcha Server Token and try again');
        	        $('.loader').hide();
                	$(_this).removeClass('opacity');
	                $(inputBox).prop('disabled', false);
        	    })
    } else {
       	alert('Please enter the input value');
        $(_this).removeClass('opacity');
    }
}
	

function captchaValidation(_captchaValidationUrl, _captchaButtonSuccessUrl, _captchaButtonRequestMessage, inputid, _this) {
    let inputBox = document.getElementById(inputid);
    let accesstoken = "";
    if ($('.fieldname').val() != '') {
        var captchaValue = $('.fieldname').val();
	const setrequest = this.HexaEight.SetUserSecret($('.fieldname').val());
	setrequest.then(resp => {
		const trequest = this.HexaEight.FetchSessionAccessToken(_captchaValidationUrl);
		trequest.then(resp => {
			accesstoken = this.HexaEight.GetSessionAccessToken()
			console.log(accesstoken);

			if (accesstoken != '') {
				    var encryptedmessage = this.HexaEight.EncryptBearerMessage(_captchaButtonRequestMessage);
		                    fetch(_captchaButtonSuccessUrl, {
                		            method: 'POST',
		                            headers: {
						'Authorization': 'Bearer ' + accesstoken,
		                                'Content-Type': 'application/text',
                		                'Access-Control-Allow-Origin': '*',
		                                'Access-Control-Allow-Methods': 'POST',
		                                'Access-Control-Allow-Headers': 'access-control-allow-headers,access-control-allow-methods,access-control-allow-origin'
                		            },
		                            body: encryptedmessage
					})
		                        .then((res) => {
		                            if (res.status == 200) {
		                                return res.text()
		                            } else {
		                                throw Error(res.statusText)
		                            }
		                        })
		                        .then(response => {
					    console.log("Resp:"+ response);
                		            if (response == 'Ok') {
		                                $("#myModal").modal('hide');
		                                $('#myModal').remove();
		                                $('.modal-backdrop').remove();
		                                $('input').val('');
		                                $(inputBox).prop('disabled', false);
		                                $('body').removeClass('modal-open');
		                                $(_this).removeClass('opacity');
		                                clearTimeout(timer);
		                                var successFunction = $(_this).attr('data-hexaeight-success-function');
		                                setTimeout(successFunction, 5000);
		                            }
		                        })
		                        .catch(console.error)
			}
			else {
			        alert('A Valid Captcha was not Found. Please ensure you have generated a Captcha using Captcha Server Token');
			}

		})
	 	.catch(function() {
			console.error("Unable To Verify Captcha. Try again");
                	$('.loader').hide();
	                $(_this).removeClass('opacity');
        	        $(inputBox).prop('disabled', false);
		})

	})
 	.catch(function() {
		console.error("Captcha Verification Failed. Try again");
                $('.loader').hide();
                $(_this).removeClass('opacity');
                $(inputBox).prop('disabled', false);
	})
	
    } else {
        alert('Please enter Captcha Value');
    }
}

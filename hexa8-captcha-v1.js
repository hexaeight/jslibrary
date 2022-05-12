var timer;
$("button").on('click',function() {
    $(this).addClass('opacity');
    $(this).css('pointer-events','none');
    $(this).css('opacity','0.5');
    var me = document.querySelector('script[fetchurl][verifyurl]');
    var fetchCaptcha = me.getAttribute('fetchurl');
    var captchaValidation = me.getAttribute('verifyurl');

    var attr = $(this).attr('data-hexaeight-input');
    if(typeof attr !== typeof undefined && attr !== false) {
        widgetQRCode(this,fetchCaptcha,captchaValidation);
    }
});

$("#myModal .close").on('click',function(){
    $('input.form-control').val('');
    clearTimeout(timer);
});

function widgetQRCode(_this,_fetchCaptchaUrl,_captchaValidationUrl) {
    if(_this.previousElementSibling.value  != '') {
        $(_this.previousElementSibling).prop('disabled', true);
        $('.loader').show();
        fetch(_fetchCaptchaUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/text',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'access-control-allow-headers,access-control-allow-methods,access-control-allow-origin'
            },
            body: _this.previousElementSibling.value  
            })
            .then((res) => {
                if (res.status == 200) {
                    return res.text()
                } else {
                    throw Error(res.statusText)
                }
            })
            .then(response => {
                var split = response.split('|');
                var qrcode = 'Hexa8BCODE|'+split[1]+'|'+split[2];
                captchaUrl1 = split[0];
                captchaUrl2 = split[3]+'|'+split[4];
                $('.loader').hide();
                var modalpopup = "<div id='myModal' class='modal fade' role='dialog'><div class='modal-dialog'><div class='modal-content'><div class='modal-header'><h4 class='modal-title'>QR Code and Captacha Validation</h4></div><div class='modal-body'><div class='loader'></div><div id='qrcode'></div></div></div></div></div>"; 
                $('body').append(modalpopup);
                $('#myModal').modal({backdrop: 'static', keyboard: false});
                $("#myModal").modal('show');
                var displayQR = document.getElementById("qrcode");                
                displayQR.innerHTML = '';
                var qrcode = new QRCode(displayQR, {
                    text: qrcode,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });          
                var scanMe = "<div><span>Scan Me</span></div>";
                displayQR.insertAdjacentHTML("beforeend",scanMe);  
                var fName = "<div><label>EnterCaptcha: </label><input type=\"text\" class=\"fieldname\" /></div>";
                var button = "<div><button id=\"submitQRCode\" >OK</button></div>";
                displayQR.insertAdjacentHTML("beforeend",fName);  
                setTimeout(function(){ 
                    displayQR.insertAdjacentHTML("beforeend",button); 
                    displayQR.lastChild.children[0].addEventListener("click", function() {
                        captchaValidation(captchaUrl1,captchaUrl2,_captchaValidationUrl,_this);
                    });   
                }, 3000);  
                var timer  = setTimeout(function() {
                    $("#myModal").modal('hide');
                    $(_this).removeClass('opacity');                    
                    $(_this).css('pointer-events','cursor');
                    $(_this).css('opacity','');
                    $(_this.previousElementSibling).prop('disabled', false);
                    $('#myModal').remove();
                    $('.modal-backdrop').remove();
                    $('body').removeClass('modal-open');
                }, 120000);
            })
            .catch(function(){
                console.error;
                $('.loader').hide();
                $(_this).removeClass('opacity');               
                $(_this).css('pointer-events','cursor');
                $(_this).css('opacity','');
                $(_this.previousElementSibling).prop('disabled', false);
            })
        } else {
            alert('Please enter the input value');
            $(_this).removeClass('opacity');               
            $(_this).css('pointer-events','cursor');
            $(_this).css('opacity','');
        }
}
function captchaValidation(captchaUrl1,captchaUrl2,_captchaValidationUrl,_this) {
    if($('.fieldname').val() != '') {
        var captchaValue = $('.fieldname').val();
        var captchaFullUrl = captchaUrl1+'|'+captchaValue+'|'+captchaUrl2;
        fetch(_captchaValidationUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/text',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'access-control-allow-headers,access-control-allow-methods,access-control-allow-origin'
            },
            body: captchaFullUrl 
        })
        .then((res) => {
            if (res.status == 200) {
                return res.text()
            } else {
                throw Error(res.statusText)
            }
        })
        .then(response => {
            if(response != 'Email Failed Verification') {
                $("#myModal").modal('hide');
                $('input.form-control').val('');
                $(_this.previousElementSibling).prop('disabled', false);
                $('#myModal').remove();
                $('.modal-backdrop').remove();
                $('body').removeClass('modal-open');
                clearTimeout(timer);
                $(_this).removeClass('opacity');               
                $(_this).css('pointer-events','cursor');
                $(_this).css('opacity','');
            }
        })
        .catch(console.error)
    } else {
        alert('Please enter Captcha Value');
    }
}

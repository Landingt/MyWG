 //登录
document.getElementsByTagName("form")[0].onsubmit = function () {
    return false;
}

document.querySelectorAll('[data-action="loginOnKey"]').item(0).onkeypress = onkeyiptEvent;

document.querySelectorAll('[data-action="loginAdvanced"]').item(0).onclick = onAdvanced;

document.querySelectorAll('[data-action="loginSumit"]').item(0).onclick = onSumitLogining; 
window.onload = function () {
    $('.loadin-center2').show();
    var s = location.hash.split('#')[1];
    if(s=='clean'){
        window.localStorage.LOGIN_TIME='';
    }
    if(window.localStorage.LOGIN_TIME&&window.localStorage.LOGIN_TIME!=''){
         var dt1 = new Date(window.localStorage.LOGIN_TIME);
         var dt2 = new Date();
         if(dt1>dt2){
            $.ajax({
                    url : window.localStorage.http_agree+'://'+window.localStorage.service_url+'/GWServices.asmx/AssemblyInfor',
                    timeout: 5000,
                    type: 'post',
                    error : function() {
                        $('.loadin-center2').html('服务器未开启或连接失败！');
                        setTimeout(function(){
                            $('.loadin-center2').hide();
                            $(".signin-content").show();
                            $('.loadin-center2').html('正在进入，请稍后…');
                        },1500);
                    },
                    success : function(e) {
                        window.location.href=window.localStorage.SERVICE_PATH;
                    }
                });
         }
         else{
            $('.loadin-center2').hide();
            $(".signin-content").show();
         }
    }
    else{
        $('.loadin-center2').hide();
        $(".signin-content").show();
    }

	var hg = ($(document).height() / 2 - $(".signin-content").height() / 2) - 50;
    $(".signin-content").css("top", hg + "px");

    var wd = ($(document).width() / 2 - 70 / 2);
    $("#loading-center-absolute").css("left", wd + "px");
    //$(".loading-text").css("left", (wd + 6) + "px");
	
    if (!window.localStorage.service_url) {
        document.getElementById("service_url").style.display = "block";
    }
    else {
        document.getElementById("inputServiceURL").value = window.localStorage.service_url;
    }
    if (window.localStorage.userName) {
        document.getElementById("inputName").value = window.localStorage.userName;
    }
    if (window.localStorage.userPWD) {
        document.getElementById("inputPassword").value = unEncrypt(window.localStorage.userPWD);
    }
}

window.onresize = function () {
    var hg = ($(document).height() / 2 - $(".signin-content").height() / 2) - 50;
    $(".signin-content").css("top", hg + "px");
}
var httpAgree;
var numbToService = 0;
var strServiceURLs = '';
function onSumitLogining() {
    numbToService = 0;
    $('.loading-text').html('正在连接…');
    if (!this.tagName) {
        document.querySelectorAll('[data-action="loginSumit"]').item(0).onclick = null;
    }
    var strServiceURL = document.getElementById("inputServiceURL").value;
    var strName = document.getElementById("inputName").value;
    var strPWD = document.getElementById("inputPassword").value;
    if (strName == "") {
        document.getElementById("message").innerHTML = "用户名不能为空！";
    }
    else if (strPWD == "") {
        document.getElementById("message").innerHTML = "密码不能为空！";
    }
    else if (strServiceURL == "") {
        document.getElementById("message").innerHTML = "服务器地址不能为空！";
    }
    else {
		window.localStorage.service_url = strServiceURL;
        window.localStorage.userName = strName;
        window.localStorage.userPWD = Encrypt(strPWD);
        strServiceURLs = strServiceURL;
        setTimeout(serviceHttpAgree, 2000);
		setTimeout(function () {
            document.getElementsByTagName("form")[0].style.display = "none";
            document.getElementById("loading-center").style.display = "block";
            setTimeout(function () {
                document.getElementById("loading-center-absolute").style.transform = "rotate(720deg)";
                //setTimeout(serviceHttpAgree, 2000);
            }, 1000);
        }, 1000);
    }
}

//回车事件
function onkeyiptEvent(event) {
    if (event.keyCode == 13) {
        onSumitLogining();
    }
}

//高级配置服务器地址
function onAdvanced() {
    $("#service_url").slideToggle("slow");
}

//判断连接方式为http
function serviceHttpAgree() {
        window.localStorage.strServiceURL = strServiceURLs;
        $.ajax({
            type: 'post',
            url: 'http://' + strServiceURLs + '/GWServices.asmx/AssemblyInfor',
            timeout: 5000,
            async: true,
            success: function (dt) {
                var datas = $(dt).find("string").text();
                if (datas != null && datas != "" && datas != "false") {
                    httpAgree = 'http';
                    window.localStorage.http_agree=httpAgree;
                    ajaxGWServiceInit();
                }
                else {
                    serviceHttpAgrees();
                }
            },
            error: function () {
                serviceHttpAgrees();
            }
        });
}
//判断连接方式为https
function serviceHttpAgrees(){
    $.ajax({
            type: 'post',
            url: 'https://' + strServiceURLs + '/GWServices.asmx/AssemblyInfor',
            timeout: 5000,
            async: true,
            success: function (dt) {
                var datas = $(dt).find("string").text();
                if (datas != null && datas != "" && datas != "false") {
                    httpAgree = 'https';
                    window.localStorage.http_agree=httpAgree;
                    ajaxGWServiceInit();
                }
                else {
                    $('.loading-text').html('IIS无法连接！');
                    setTimeout(function () {
                        document.getElementsByTagName("form")[0].className = "";
                        document.getElementsByTagName("form")[0].style.display = "block";
                        document.getElementById("loading-center").style.display = "none";
                        document.getElementById("loading-center-absolute").style.transform = "";
                        document.getElementById("message").innerHTML = "IIS无法连接";
                    }, 2500);
                }
            },
            error: function () {
                $('.loading-text').html('IIS无法连接！');
                                setTimeout(function () {
                                    document.getElementsByTagName("form")[0].className = "";
                                    document.getElementsByTagName("form")[0].style.display = "block";
                                    document.getElementById("loading-center").style.display = "none";
                                    document.getElementById("loading-center-absolute").style.transform = "";
                                    document.getElementById("message").innerHTML = "IIS无法连接";
                                }, 2500);
            }
        });
}

//登录服务器
function ajaxGWServiceInit() {
	var strServiceURLIP = strServiceURLs.split(':')[0];
    numbToService++;
    $('.loading-text').html('正在连接服务器…');
    $.ajax({
        type: 'post',
        url: httpAgree + '://' + strServiceURLs + '/GWServices.asmx/InitEnsureRunProxy',
        timeout: 5000,
        async: true,
        data: "pageUserNm="+document.getElementById("inputName").value+"&&wcfIP=" + strServiceURLIP,
        success: function (dt) {
            var datas = $(dt).find("string").text();
            if (datas != null && datas != "" && datas != "false") {
                $('.loading-text').html('已连接服务器…');
                ajaxGWLogin();
            }
            else {
                console.log("服务器连接错误！(101)");
                if (numbToService <= 1) {
                    ajaxGWServiceInit();
                }
                else {
                    $('.loading-text').html('服务器无法连接…');
                    setTimeout(function () {
                        document.getElementsByTagName("form")[0].className = "";
                        document.getElementsByTagName("form")[0].style.display = "block";
                        document.getElementById("loading-center").style.display = "none";
                        document.getElementById("loading-center-absolute").style.transform = "";
                        document.getElementById("message").innerHTML = "服务器无法连接";
                    }, 2500);
                }
            }
        },
        error: function (qXHR, textStatus, errorThrown) {
            console.log("服务器连接错误！(102)");
            if (numbToService <= 1) {
                ajaxGWServiceInit();
            }
            else {
                $('.loading-text').html('服务器无法连接…');
                setTimeout(function () {
                    document.getElementsByTagName("form")[0].className = "";
                    document.getElementsByTagName("form")[0].style.display = "block";
                    document.getElementById("loading-center").style.display = "none";
                    document.getElementById("loading-center-absolute").style.transform = "";
                    if (textStatus == "timeout") {
                        document.getElementById("message").innerHTML = "服务器连接超时！";
                    } else {
                        document.getElementById("message").innerHTML = "服务器错误编码：" + qXHR.readyState + "," + qXHR.status;
                    }
                }, 2500);
            }
        }
    });
}
//获取几天之后的日期
function GetDateStr(AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;//获取当前月份的日期
    var d = dd.getDate();
    if (m < 10) {
        m = '0' + m;
    }
    if (d < 10) {
        d = '0' + d;
    }
    return y + "-" + m + "-" + d;
}

//验证用户名和密码
function ajaxGWLogin() {
	var strServiceURLIP = strServiceURLs.split(':')[0];
    var strName = document.getElementById("inputName").value;
    var strPWD = document.getElementById("inputPassword").value;
    $('.loading-text').html('正在登录…');
    $.ajax({
        type: 'post',
        url: httpAgree + '://' + strServiceURLs + '/GWServices.asmx/Login',
        timeout: 5000,
        async: true,
        data: "nameKey=" + strName + "&&passwordKey=" + strPWD,
        success: function (dt) {
            var datas = $(dt).find("string").text();
            $('.loading-text').html('获取登录结果…');
            if (datas != null && datas != "" && datas != "false") {
                console.log("登陆成功！");
                var times=GetDateStr(7);
                var serivces=httpAgree + "://" + strServiceURLs + "/Views/Mobile/home.html";
                try{
                    //var json='{"USER_ID":"'+strName+'","LOGIN_TIME":"'+times+'","SERVICE_PATH":"'+serivces+'"}'
                    window.localStorage.LOGIN_TIME = times;
                    window.localStorage.SERVICE_PATH = serivces;
                    myJavaFun.SetAlias(strName);
                }
                catch(ex){
                }
                window.location.href = httpAgree + "://" + strServiceURLs + "/Views/Mobile/home.html?terminal=Mobile.App&userName=" + strName + "&service_url=" + strServiceURLIP;
            }
            else {
                $('.loading-text').html('登陆失败…');
                console.log("登陆失败！(101)");
                setTimeout(function () {
                    document.getElementsByTagName("form")[0].className = "";
                    document.getElementsByTagName("form")[0].style.display = "block";
                    document.getElementById("loading-center").style.display = "none";
                    document.getElementById("loading-center-absolute").style.transform = "";
                    document.getElementById("message").innerHTML = "用户名或密码错误";
                }, 2500);
            }
        },
        error: function (qXHR, textStatus, errorThrown) {
            console.log("登陆失败！(102)");
            $('.loading-text').html('登陆失败…');
            setTimeout(function () {
                document.getElementsByTagName("form")[0].className = "";
                document.getElementsByTagName("form")[0].style.display = "block";
                document.getElementById("loading-center").style.display = "none";
                document.getElementById("loading-center-absolute").style.transform = "";
                if (textStatus == "timeout") {
                    document.getElementById("message").innerHTML = "登录超时！";
                } else {
                    document.getElementById("message").innerHTML = "登录错误编码：" + qXHR.readyState + "," + qXHR.status;
                }
            }, 2500);
        }
    });
}

//加密与解密
function Encrypt(Text) {
    output = new String;
    alterText = new Array();
    varCost = new Array();
    TextSize = Text.length;
    for (i = 0; i < TextSize; i++) {
        idea = Math.round(Math.random() * 111) + 77;
        alterText[i] = Text.charCodeAt(i) + idea;
        varCost[i] = idea;
    }
    for (i = 0; i < TextSize; i++) {
        output += String.fromCharCode(alterText[i], varCost[i]);
    }
    return output;
}
function unEncrypt(Text) {
    output = new String;
    alterText = new Array();
    varCost = new Array();
    TextSize = Text.length;
    for (i = 0; i < TextSize; i++) {
        alterText[i] = Text.charCodeAt(i);
        varCost[i] = Text.charCodeAt(i + 1);
    }
    for (i = 0; i < TextSize; i = i + 2) {
        output += String.fromCharCode(alterText[i] - varCost[i]);
    }
    return output;
}
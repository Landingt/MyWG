var alarmccenterContext;
var show_num = [];
//登录
document.getElementsByTagName("form")[0].onsubmit = function() {
    return false;
}
document.body.addEventListener('touchmove', function(e){
        e.preventDefault();
    }, { passive: false });
document.querySelectorAll('[data-action="loginOnKey"]').item(0).onkeypress = onkeyiptEvent;
document.querySelectorAll('[data-action="loginAdvanced"]').item(0).onclick = onAdvanced;
document.querySelectorAll('[data-action="loginSumit"]').item(0).onclick = onSumitLogining;
// setVerticalPosition();
// window.onresize = function() {
//     setVerticalPosition();
// }
window.onload = function() {
    $("html").height(window.screen.height);
    var exitString = "",
        serviceUrl = window.localStorage.service,
        username = window.localStorage.userName,
        password = window.localStorage.password;
    try {
        exitString = window.document.location.href.split('#')[1];
    } catch (e) {
        console.log(e);
    }
   	draw(show_num); //初始化验证码
    if (exitString == "clean") {
        hideLoading();
        window.localStorage.lastLoginTime = "";
    } else {
        serviceUrl ? beOverdue(serviceUrl, username, password) : hideLoading();
    }
    function ct() {
  return document.compatMode == "BackCompat" ? document.body.clientHeight : document.documentElement.clientHeight;
}

}
function verificationCode(){
	draw(show_num);
	}

function beOverdue(serviceUrl, username, password) {
    if (AlarmCenterV2Context.isLogin()) { //判断cookie是否过期
        loginAuthentication(serviceUrl, username, password);
    } else {
        hideLoading();
    }
}

function loginAuthentication(serviceUrl, username, password) {
    showLoading();

    alarmccenterContext = AlarmCenterV2Context;
    alarmccenterContext.service = serviceUrl;
    alarmccenterContext.userName = username;
    alarmccenterContext.password = password;
    alarmccenterContext.tryConnect().done(function(n) {
        //先用最新API登陆
        alarmccenterContext.loginMD5Encrypt().done(function(n) {
           loginInfoHandle(alarmccenterContext,n,serviceUrl, username, password);
        }).fail(function() {
            //最后用之前API登陆
            alarmccenterContext.login().done(function(n) {
              loginInfoHandle(alarmccenterContext,n,serviceUrl, username, password);
            }).fail(function() {
                hideLoading();
                loginErrorInit(serviceUrl, username, password)
                showMessage("登陆失败!");
            });
        });
    }).fail(function() {
        //使用旧版接口
        console.log("尝试连接第一个版");
        alarmccenterContext = AlarmCenterV1Context;
        alarmccenterContext.service = serviceUrl;
        alarmccenterContext.userName = username;
        alarmccenterContext.password = password;
        alarmccenterContext.tryConnect().done(function(n) {
            alarmccenterContext.login().done(function(n) {
                var res = $(n).find("string").text();
                if (res != null && res != "" && res != "false") {
                    alarmccenterContext.saveCookie();
                    alarmccenterContext.gotoHome();
                } else {
                    hideLoading();
                    loginErrorInit(serviceUrl, username, password)
                    showMessage("登陆失败! 原因:用户名或者密码错误.");
                }
            }).fail(function() {
                hideLoading();
                loginErrorInit(serviceUrl, username, password)
                showMessage("登陆失败! 服务错误.");
            })
        }).fail(function() {
            hideLoading();
            loginErrorInit(serviceUrl, username, password)
            showMessage("连接服务失败！");
        });
    });
}

function loginInfoHandle(alarmccenterContext,n,serviceUrl, username, password){
    var res = n.HttpData;
    if (res.code == 200) {
        alarmccenterContext.appkey = res.data.appkey;
        alarmccenterContext.infokey = res.data.infokey;
        alarmccenterContext.saveCookie();
        alarmccenterContext.gotoHome();
    } else {
        hideLoading();
        loginErrorInit(serviceUrl, username, password)
        showMessage("登陆失败! 原因:" + res.message);
    }
}


function onSumitLogining() {
    //var serviceUrl = document.getElementById("inputServiceURL").value;
    //var username = document.getElementById("inputName").value;
    //var password = document.getElementById("inputPassword").value;
    var val=document.getElementById("verificationCode").value;
    	var num = show_num.join("");
    var serviceUrl = $("#httpType option:selected").text() + "://" + $("#inputServiceURL").val();
    var username = $("#inputName").val();
    var password = $("#inputPassword").val();
    if(val==''){
                    alert('请输入验证码！');
                }else if(val == num){
    				if (username == "") {
                            showMessage("用户名不能为空！");
                        } else if (password == "") {
                            showMessage("密码不能为空！");
                        } else if ($("#inputServiceURL").val() == "") {
                            showMessage("服务器地址不能为空！");
                        } else {

                            loginAuthentication(serviceUrl, username, password);
                        }

                }else{
                    alert('验证码错误！\n你输入的是:  '+val+"\n正确的是:  "+num+'\n请重新输入！');
                    document.getElementById("verificationCode").value='';
                    draw(show_num);
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
//登陆错误初始化文本框
function loginErrorInit(serviceUrl, username, password){
    var ipStr =serviceUrl;
    try{ipStr = serviceUrl.split("://")[1];}catch(e){}
     $("#inputServiceURL").val(ipStr);
     $("#inputName").val(username);
     $("#inputPassword").val(password);

}

function showMessage(msg) {
    $('#message').html(msg);
}

function showLoadingMessage(msg) {
    $('.loading-text').html(msg);
}

function showLoading() {
    $(".signin-content").hide();
    $("#loading-center").show();
    $("#loading-center-absolute").css({
        "transform": "rotate(720deg)"
    });
}

function hideLoading() {
    $(".signin-content").show();
    $("#loading-center").hide();
    $("#loading-center-absolute").css({
        "transform": ""
    });
    //缓存内容
    if (window.localStorage.service) {
        var splitHttpString = window.localStorage.service.split("//")[0].replace(":", "");
        $("#httpType option[value='" + splitHttpString + "']").attr("selected", "selected");
        $("#inputServiceURL").val(window.localStorage.service.split("//")[1]);
        $("#inputServiceURL").val(window.localStorage.service.split("//")[1]);
        $("#inputName").val(window.localStorage.userName);
        $("#inputPassword").val(window.localStorage.password);
    }
}

function setVerticalPosition() {
    var hg = ($(document).height() / 2 - $(".signin-content").height() / 2) - 50;
    $(".signin-content").css("top", hg + "px");
}
var AlarmCenterV2Context = {
    service: "",
    userName: "",
    password: "",
    version: "v2",
    appkey: "",
    infokey: "",
    tryConnect: function() {
        return this.getServerVersion()
    },
    getServerVersion: function() {
        return this.httpGet("/api/server/version", {
            data: ""
        })
    },
    login: function() {
        return this.httpPost("/api/server/getkey", {
            data: {
                username: this.userName,
                userpwd: this.password
            }
        })
    },
    loginMD5Encrypt: function(){
         return this.httpPost("/api/server/getkey_mobile", {
            data: {
                username: this.userName,
                userpwd: md5(this.password)
            }
        })
    },
    saveCookie: function() {
        try {
            window.localStorage.alarmcenterVersion = this.version;
            window.localStorage.appkey = this.appkey;
            window.localStorage.infokey = this.infokey;
            window.localStorage.service = this.service;
            window.localStorage.userName = this.userName;
            window.localStorage.password = this.password;
            window.localStorage.lastLoginTime = new Date().getTime();
        } catch (ex) {
            console.log(ex);
        }
    },
    loadCookie: function() {
        try {
            this.version = window.localStorage.alarmcenterVersion;
            this.appkey = window.localStorage.appkey;
            this.infokey = window.localStorage.infokey;
            this.service = window.localStorage.service;
            this.userName = window.localStorage.userName;
            this.password = window.localStorage.password;
        } catch (ex) {
            console.log(ex);
        }
    },
    isLogin: function() {
        try {
            var ver = window.localStorage.alarmcenterVersion;
            var lastLoginTime = window.localStorage.lastLoginTime;
            var now = new Date().getTime();
            var ms = now - lastLoginTime;
            return ver === this.version && ms < 7 * 24 * 60 * 60 * 1000;
        } catch (ex) {
            console.log(ex);
            return false;
        }
    },
    gotoHome: function() {

        window.location.href = this.service + "/Views/Mobile/home.html?terminal=Mobile.App&userName=" + this.userName
        + "&service_url=" + this.getServerHostName() + "&appkey=" + this.appkey + "&infokey=" + this.infokey;
    },
    getServerHostName: function() {
        var wcf = this.service.split('://')[1];
        wcf = wcf.split(":")[0];
        return wcf;
    },
    httpPost: function(url, n) {
        var i = $.Deferred();
        return $.ajax({
                url: (n.baseUri || this.service) + url,
                data: n.data,
                type: "POST",
                dataType: "JSON",
                async: !1 !== n.async,
                timeout: n.timeout || 5000,
                success: function(e) {
                    i.resolveWith(this, [e])
                },
                error: function(e, n) {
                    i.rejectWith(this, ["网络异常，请稍候重试"])
                }
            }),
            i.promise()
    },
    httpGet: function(url, n) {
        var i = $.Deferred();
        $.ajax({
            url: (n.baseUri || this.service) + url,
            data: $.param(n.data),
            type: "GET",
            dataType: "JSON",
            async: !1 !== n.async,
            timeout: n.timeout || 5000,
            success: function(e) {
                i.resolveWith(this, [e])
            },
            error: function(e, n) {
                i.rejectWith(this, ["网络异常，请稍候重试"]);
            }
        });
        return i.promise()
    }
}
var AlarmCenterV1Context = {
    service: "",
    userName: "",
    password: "",
    version: "v1",
    tryConnect: function() {
        return this.httpPost("/GWServices.asmx/AssemblyInfor", {
            data: {}
        })
    },
    login: function() {
        var wcf = this.service.split('://')[1];
        wcf = wcf.split(":")[0];
        return $.when(this.httpPost("/GWServices.asmx/InitEnsureRunProxy", {
            data: {
                pageUserNm: this.userName,
                wcfIP: wcf
            },
            async: false
        }), this.httpPost("/GWServices.asmx/Login", {
            data: {
                nameKey: this.userName,
                passwordKey: this.password
            },
            async: false
        }))
    },
    gotoHome: function() {
        window.location.href = this.service + "/Views/Mobile/home.html?terminal=Mobile.App&userName=" + this.userName +
         "&service_url=" + this.getServerHostName();
    },
    getServerHostName: function() {
        var wcf = this.service.split('://')[1];
        wcf = wcf.split(":")[0];
        return wcf;
    },
    saveCookie: function() {
        try {
            window.localStorage.alarmcenterVersion = this.version;
            window.localStorage.service = this.service;
            window.localStorage.userName = this.userName;
            window.localStorage.lastLoginTime = new Date().getTime();
        } catch (ex) {
            console.log(ex);
        }
    },
    loadCookie: function() {
        try {
            this.version = window.localStorage.alarmcenterVersion;
            this.service = window.localStorage.service;
            this.userName = window.localStorage.userName;
        } catch (ex) {
            console.log(ex);
        }
    },
    isLogin: function() {
        try {
            var ver = window.localStorage.alarmcenterVersion;
            var lastLoginTime = window.localStorage.lastLoginTime;
            var now = new Date().getTime();
            var ms = now - lastLoginTime;
            return ver === this.version && ms < 7 * 24 * 60 * 60 * 1000;
        } catch (ex) {
            console.log(ex);
            return false;
        }
    },
    httpPost: function(url, n) {
        var i = $.Deferred();
        return $.ajax({
                url: (n.baseUri || this.service) + url,
                data: n.data,
                type: "POST",
                dataType: "JSON",
                async: !1 !== n.async,
                timeout: n.timeout || 5000,
                success: function(e) {
                    i.resolveWith(this, [e])
                },
                error: function(e, n) {
                    i.rejectWith(this, ["网络异常，请稍候重试"])
                }
            }),
            i.promise()
    },
    httpGet: function(url, n) {
        var i = $.Deferred();
        $.ajax({
            url: (n.baseUri || this.service) + url,
            data: $.param(n.data),
            type: "GET",
            dataType: "JSON",
            async: !1 !== n.async,
            timeout: n.timeout || 5000,
            success: function(e) {
                i.resolveWith(this, [e])
            },
            error: function(e, n) {
                i.rejectWith(this, ["网络异常，请稍候重试"])
            }
        });
        return i.promise()
    }

}
//获取key
function getServerKey() {
    $.ajax({
        type: 'post',
        url: '/api/server/getkey_pc',
        dataType: "json",
        data: {
            username: $('#inputName').val(),
            userpwd: RSAEncrypt($('#inputPassword').val()),
            verificationCode: $("#verificationCode").val()
        },
        // url: '/api/server/getkey_mobile',
        // dataType: "json",
        // data: {
        //     username: $('#inputName').val(),
        //     userpwd: md5($('#inputPassword').val())
        // },
        success: function(dt) {
            $('.loading-text').html('获取登录结果…');
            if (dt.HttpStatus == 200) {
                var dts = dt.HttpData;
                if (dts.code == 200) {
                    var getkeys = dts.data;
                    window.localStorage.userName = $('#inputName').val();
                    window.localStorage.ac_appkey = getkeys.appkey;
                    window.localStorage.ac_infokey = getkeys.infokey;
                    window.localStorage.terminal = terminal + ".Web";
                    setTimeout(function() {
                        if (urlSearch == '' || urlSearch == undefined || urlSearch == null) {
                            window.location.href = "/Views/" + terminal + "/home.html";
                        } else {
                            window.location.href = urlSearch;
                        }
                    }, 1500);
                } else {
                    $('.loading-text').html(dts.message);
                    setTimeout(function() {
                        document.getElementById("loginFormBoxId").className = "";
                        document.getElementById("loginFormBoxId").style.display = "block";
                        document.getElementById("loading-center").style.display = "none";
                        document.getElementById("loading-center-absolute").style.transform = "";
                        document.getElementById("message").innerHTML = "code:" + dts.code;
                        getVerification();
                    }, 2500);
                }
            } else {
                $('.loading-text').html('HttpStatus:' + dt.HttpStatus);
                setTimeout(function() {
                    document.getElementById("loginFormBoxId").className = "";
                    document.getElementById("loginFormBoxId").style.display = "block";
                    document.getElementById("loading-center").style.display = "none";
                    document.getElementById("loading-center-absolute").style.transform = "";
                    document.getElementById("message").innerHTML = "code:" + dt.HttpStatus;
                    getVerification();
                }, 2500);
            }
        },
        error: function(e) {
            getVerification();
        }
    });
}
function JQajaxoLogin(_type, _url, _asycn, _data, _success, _error) {
    var ajaxs = $.ajax({
        type: _type,
        url: _url,
        timeout: 5000,
        xhrFields: {
            withCredentials: true
        },
        async: _asycn,
        data: _data,
        success: _success,
        complete: function(XMLHttpRequest, status) { //请求完成后最终执行参数
            if (status == 'timeout' || status == 'error') { //超时,status还有success,error等值的情况
                ajaxs.abort();
                alertMsgError.open();
            }
            XMLHttpRequest = null;
        },
        error: _error
    });
}
function draw(show_num) {
	var canvas_width=document.getElementById('canvas').clientWidth;
	var canvas_height=document.getElementById('canvas').clientHeight;
	var canvas = document.getElementById("canvas");//获取到canvas的对象，演员
	var context = canvas.getContext("2d");//获取到canvas画图的环境，演员表演的舞台
	canvas.width = canvas_width;
	canvas.height = canvas_height;
	var sCode = "A,B,C,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,W,X,Y,Z,1,2,3,4,5,6,7,8,9,0,q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h,j,k,l,z,x,c,v,b,n,m";
	var aCode = sCode.split(",");
	var aLength = aCode.length;//获取到数组的长度

	for (var i = 0; i <= 3; i++) {
		var j = Math.floor(Math.random() * aLength);//获取到随机的索引值
		var deg = Math.random() * 30 * Math.PI / 180;//产生0~30之间的随机弧度
		var txt = aCode[j];//得到随机的一个内容
		show_num[i] = txt;
		var x = 10 + i * 20;//文字在canvas上的x坐标
		var y = 20 + Math.random() * 8;//文字在canvas上的y坐标
		context.font = "bold 23px 微软雅黑";

		context.translate(x, y);
		context.rotate(deg);

		context.fillStyle = randomColor();
		context.fillText(txt, 0, 0);

		context.rotate(-deg);
		context.translate(-x, -y);
	}
	for (var i = 0; i <= 5; i++) { //验证码上显示线条
		context.strokeStyle = randomColor();
		context.beginPath();
		context.moveTo(Math.random() * canvas_width, Math.random() * canvas_height);
		context.lineTo(Math.random() * canvas_width, Math.random() * canvas_height);
		context.stroke();
	}
	for (var i = 0; i <= 30; i++) { //验证码上显示小点
		context.strokeStyle = randomColor();
		context.beginPath();
		var x = Math.random() * canvas_width;
		var y = Math.random() * canvas_height;
		context.moveTo(x, y);
		context.lineTo(x + 1, y + 1);
		context.stroke();
	}
}
function randomColor() {//得到随机的颜色值
	var r = Math.floor(Math.random() * 256);
	var g = Math.floor(Math.random() * 256);
	var b = Math.floor(Math.random() * 256);
	return "rgb(" + r + "," + g + "," + b + ")";
}
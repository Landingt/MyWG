var alarmccenterContext;
//登录
document.getElementsByTagName("form")[0].onsubmit = function() {
    return false;
}
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
    if (exitString == "clean") {
        hideLoading();
        window.localStorage.lastLoginTime = "";
    } else {
        serviceUrl ? beOverdue(serviceUrl, username, password) : hideLoading();
    }
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
    var serviceUrl = $("#httpType option:selected").text() + "://" + $("#inputServiceURL").val();
    var username = $("#inputName").val();
    var password = $("#inputPassword").val();
    if (username == "") {
        showMessage("用户名不能为空！");
    } else if (password == "") {
        showMessage("密码不能为空！");
    } else if ($("#inputServiceURL").val() == "") {
        showMessage("服务器地址不能为空！");
    } else {

        loginAuthentication(serviceUrl, username, password);
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
        window.location.href = this.service + "/Views/Mobile/home.html?terminal=Mobile.App&userName=" + this.userName + "&service_url=" + this.getServerHostName() + "&appkey=" + this.appkey + "&infokey=" + this.infokey;
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
        window.location.href = this.service + "/Views/Mobile/home.html?terminal=Mobile.App&userName=" + this.userName + "&service_url=" + this.getServerHostName();
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
//app.js
//初始化leancloud服务
const AV = require('libs/av-weapp.js');

App({
  onLaunch: function () {
    AV.init({ 
      appId: 'cd8pCmtptSQrz4jK4tDKLqlU-gzGzoHsz', 
      appKey: 'UBHMQf1tpcnUpSSjSB3NygkW', 
      });

    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    this.getUserInfo(
      function (userInfo) {
        
      }
    )
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function (res_login) {
          wx.getUserInfo({
            withCredentials: true,
            success: function (res_user) {
              var requestUrl = "/weapp/user/info";
              var jsonData = {
                code: res_login.code,
                encryptedData: res_user.encryptedData,
                iv: res_user.iv
              };
              wx.request({
                url: that.globalData.host + requestUrl,
                method: 'POST',
                header: {
                  'content-type': 'application/json'
                },
                data: jsonData,
                success: function (res) {    // 保存3rdSession到storage中
                  if (res.data.code === 1000) {
                    that.globalData.appAccessToken = res.data.data.token;
                    that.globalData.userInfo = res_user.userInfo
                    typeof cb == "function" && cb(that.globalData.userInfo)
                  } else {
                    wx.showToast({
                      title: res.data.message,
                      icon: 'loading',
                      duration: 2000
                    });
                  }
                },
                fail: function (res) {
                  console.log(res);
                }
              })
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo: null,
    appAccessToken: null,
    host: 'https://api.ywhub.com/api'
  }
})
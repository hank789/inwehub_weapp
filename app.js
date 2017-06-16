//app.js
//初始化leancloud服务
const AV = require('libs/av-weapp.js');
var request = require("utils/request.js");

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
        //更新数据
        this.setData({
          userInfo: userInfo
        });
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
          console.log(res_login);
          wx.getUserInfo({
            withCredentials: true,
            success: function (res_user) {
              console.log(res_user);
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
                  console.log(res);
                },
                fail: function (res) {
                  console.log(res);
                }
              })
              that.globalData.userInfo = res_user.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:null,
    host: 'http://api.ywhub.com/api'
  }
})
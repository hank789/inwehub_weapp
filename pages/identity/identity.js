// pages/identity/identity.js
//获取应用实例
var app = getApp();
Page({
  data:{
    userInfo: {}
  },
  onLoad:function(options){
    this.setData({
      userInfo: app.globalData.userInfo
    })
    if (app.globalData.userInfo.status === 0) {
      wx.redirectTo({
        url: '../register/register'
      });
    }
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  goToSubmit: function () {
    wx.navigateTo({
      url: '../post/post'
    })
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  }
})
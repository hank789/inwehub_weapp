// pages/detail/detail.js
//获取应用实例
var app = getApp();
//查询用户信息
var request = require("../../utils/request.js");

Page({
  data:{
    isLoading: true,//是否显示加载数据提示
    demand: {},
    demand_id: 0
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        demand_id: options.id
      });
      // 查询对象
      request.httpsPostRequest('/weapp/demand/detail', { id: options.id }, function (res_data) {
        if (res_data.code === 1000) {
          that.setData({
            demand: res_data.data
          });
          
        } else {
          wx.showToast({
            title: res_data.message,
            icon: 'success',
            duration: 2000
          });
        }
      });
    });
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
  navToChat: function (e) {
    wx.navigateTo({
      url: '../chat/chat?id=' + e.currentTarget.dataset.id
    });
  },
  goContact: function (e) {
    request.httpsPostRequest('/im/createRoom', { source_id: this.data.demand_id,source_type: 2,contact_id: this.data.demand.publisher_user_id }, function (res_data) {
      if (res_data.code === 1000) {
        wx.navigateTo({
          url: '../chat/chat?id=' + res_data.data.id
        });
      } else {
        wx.showToast({
          title: res_data.message,
          icon: 'success',
          duration: 2000
        });
      }
    });
  },
  authEditDemand: function (e) {
    wx.navigateTo({
      url: '../post/post?id=' + this.data.demand_id
    });
  },
  authCloseDemand: function (e) {
    request.httpsPostRequest('/weapp/demand/close', { id: this.data.demand_id }, function (res_data) {
      if (res_data.code === 1000) {
        wx.navigateTo({
          url: '../myDemand/myDemand',
          success: function (e) {
            wx.showToast({
              title: '需求已关闭',
              icon: 'success',
              duration: 2000
            });
          }
        });
      } else {
        wx.showToast({
          title: res_data.message,
          icon: 'success',
          duration: 2000
        });
      }
    });
  },
  onShareAppMessage: function() {
    return{
      title:this.data.demand.title,
      path:"/pages/detail/detail?id=" + this.data.demand_id
    }
  },
  showShareMenu: function (e) {
    console.log(1);
    wx.showShareMenu({
      withShareTicket: true
    })
  }
})
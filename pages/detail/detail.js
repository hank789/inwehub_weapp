// pages/detail/detail.js
//获取应用实例
var app = getApp();
//查询用户信息
var request = require("../../utils/request.js");

Page({
  data:{
    isLoading: true,//是否显示加载数据提示
    demand: {},
    demand_id: 0,
    shareOption: {
      object_id: 0,
      object_type: 1,
      title: "",
      content: "",
      from: "",
      params: ""
    }
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
    //获得share组件
    this.shareView = this.selectComponent("#component-share-demand");
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
  navToRooms: function (e) {
    wx.navigateTo({
      url: '../demandRooms/demandRooms?id=' + this.data.demand_id
    });
  },
  navToHome: function (e) {
    wx.switchTab({
      url: '../index/index'
    });
  },
  navToMyHistory: function (e) {
    wx.navigateTo({
      url: '../myHistory/myHistory'
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
    var that = this
    wx.showModal({
      title: '需求关闭',
      content: '确认关闭此需求？',
      confirmText: "确定",
      cancelText: "取消",
      success: function (res) {
        console.log(res);
        if (res.confirm) {
          console.log('用户点击确定')
          request.httpsPostRequest('/weapp/demand/close', { id: that.data.demand_id }, function (res_data) {
            if (res_data.code === 1000) {
              wx.redirectTo({
                url: '../myHistory/myHistory',
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
          //
        }else{
          console.log('用户点击取消作')
        }
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
  },
  saveToShare: function (e) {
    this.setData({
      shareOption: {
        object_id: this.data.demand_id,
        object_type: 1,
        title: this.data.demand.title,
        content: this.data.demand.description,
        from: this.data.demand.publisher_name,
      }
    });
    this.shareView.show()
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  }
})
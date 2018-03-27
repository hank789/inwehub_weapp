// pages/mine/mine.js
var app = getApp();

//查询用户信息
var request = require("../../utils/request.js");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadData();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadData();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
  loadData: function () {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      request.httpsPostRequest('/weapp/user/info', { }, function(res_data) {
        if (res_data.code === 1000) {
          that.setData({
            userInfo: res_data.data
          })
          app.globalData.userInfo = res_data.data
        } else {
          wx.showToast({
            title: res_data.message,
            icon: 'loading',
            duration: 2000
          });
        }
      });
    });
  },
  navToMessages: function (e) {
    console.log('navToMyHistory')
    wx.navigateTo({
        url: '../messages/messages'
    });
  },
  navToMyHistory: function (event) {
    console.log('navToMyHistory')
    wx.navigateTo({
        url: '../myHistory/myHistory'
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  tapViewInfo: function (e) {
    if (this.data.userInfo.status === 1) {
      wx.navigateTo({
        url: '../identity/identity'
      })
    } else {
      wx.navigateTo({
        url: '../register/register'
      })
    }
  },
  tapMyHistory: function (e) {
    wx.navigateTo({
      url: '../myHistory/myHistory'
    })
  },
  tapMyMessages: function (e) {
    wx.navigateTo({
      url: '../messages/messages'
    })
  },
  navToTuCao: function (e) {
    wx.navigateToMiniProgram({
      appId: 'wx8abaf00ee8c3202e',
      extraData: {
        id: '26280',
        customData: {
          clientInfo: ' iPhone OS 10.3.1 / 3.2.0.43 / 0 ',
          imei: ' 7280BECE2FC29544172A2B858E9E90D0 '
        }
      }
    })
  }
})
//获取应用实例
var app = getApp();
var request = require("../../utils/request.js");

Page({
  data:{
    userInfo: {},
    bottomId: 0,
    topId: 0,
    questions: []
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      });
      that.loadQuestionList(that.data.bottomId);
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
  navToPost: function () {
    wx.navigateTo({
      url: '../post/post'
    });
  },
  onPullDownRefresh: function () {
    // 下拉刷新
    this.loadQuestionList(this.data.topId);
    wx.stopPullDownRefresh();
  },
  navToDetail: function (event) {
    var objId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../detail/detail?objId=' + objId
    });
  },
  loadQuestionList: function (bottomId) {
    var that = this;
    request.httpsPostRequest('/weapp/question/myList', { bottom_id: bottomId }, function(res_data) {
      console.log(res_data);
      wx.hideLoading();
      if (res_data.code === 1000) {
        that.data.questions = that.data.questions.concat(res_data.data);
        var length = that.data.questions.length;
        that.setData({
          questions: that.data.questions,
          bottomId: that.data.questions[length-1].id,
          topId: that.data.questions[0].id
        });
      } else {
        wx.showToast({
          title: res_data.message,
          icon: 'loading',
          duration: 2000
        });
      }
    });
  }
})
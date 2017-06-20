//获取应用实例
var app = getApp();
var request = require("../../utils/request.js");

Page({
  data:{
    userInfo: {},
    bottomId: 0,
    topId: 0,
    questions: [],
    isLoading: true,//是否显示加载数据提示
    isMore: true
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
      that.loadQuestionList(0,0);
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
    this.loadQuestionList(this.data.topId,0);
    wx.stopPullDownRefresh();
  },
  //底部更多加载
  onReachBottom: function () {
    if (this.data.isMore) {
      this.setData({
        isLoading: true
      });
      this.loadQuestionList(0, this.data.bottomId);
    }
  },
  navToDetail: function (event) {
    var objId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../detail/detail?objId=' + objId
    });
  },
  loadQuestionList: function (topId, bottomId) {
    var that = this;
    request.httpsPostRequest('/weapp/question/myList', {top_id: topId, bottom_id: bottomId }, function(res_data) {
      console.log(res_data);
      if (res_data.code === 1000) {
        var isMore = that.data.isMore;
        
        if (topId === 0) {
          that.data.questions = that.data.questions.concat(res_data.data);
          if (res_data.data.length < 10){
            isMore = false;
          }
        } else {
          that.data.questions = res_data.data.concat(that.data.questions);
        }
        var length = that.data.questions.length;
        var newBottomId = 0;
        var newTopId = 0;
        if (length > 0){
          newBottomId = that.data.questions[length - 1].id;
          newTopId = that.data.questions[0].id;
        }

        that.setData({
          questions: that.data.questions,
          bottomId: newBottomId,
          topId: newTopId,
          isLoading: false,
          isMore: isMore
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
//获取应用实例
var app = getApp();
var request = require("../../utils/request.js");
Page({
  data:{
    closedDemandId: 0,
    userInfo: {},
    list: [],
    page: 1,
    isLoading: true,//是否显示加载数据提示
    isMore: true
  },
  onLoad:function(options){
    // 页面显示
    var that = this;
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      });
      that.loadList(1);
    });
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    if (this.data.isLoading === false) {
      // 页面显示
      var that = this;
      app.getUserInfo(function(userInfo){
        //更新数据
        that.setData({
          userInfo:userInfo
        });
      });
    }
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  formSubmitToPost: function (e) {
    request.httpsPostRequest('/weapp/user/saveFormId', { formId: e.detail.formId }, function(res_data) {
      console.log(res_data);
      if (res_data.code === 1000) {
        wx.navigateTo({
          url: '../post/post?id=0'
        });
      } else {
        wx.showToast({
          title: res_data.message,
          icon: 'loading',
          duration: 2000
        });
      }
    });
  },
  onPullDownRefresh: function () {
    console.log('pull')
    // 下拉刷新
    this.data.page = 1;
    this.loadList(1);
    wx.stopPullDownRefresh();
  },
  //底部更多加载
  onReachBottom: function () {
    if (this.data.isMore) {
      this.setData({
        isLoading: true
      });
      this.loadList(this.data.page);
    }
  },
  navToMessages: function () {
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
  navToDetail: function (event) {
    wx.navigateTo({
      url: '../detail/detail?id=' + event.currentTarget.dataset.id
    });
  },
  // 申请成为招募者
  formSubmitToRegister: function (e) {
    request.httpsPostRequest('/weapp/user/saveFormId', { formId: e.detail.formId }, function(res_data) {
      console.log(res_data);
      if (res_data.code === 1000) {
        wx.navigateTo({
          url: '../register/register'
        });
      } else {
        wx.showToast({
          title: res_data.message,
          icon: 'loading',
          duration: 2000
        });
      }
    });
  },
  navToDemandRooms: function (event) {
    wx.navigateTo({
      url: '../demandRooms/demandRooms?id=' + event.currentTarget.dataset.id
    });
  },
  loadList: function (page) {
    var that = this;
    request.httpsPostRequest('/weapp/demand/list', { page: page, type: 'mine' }, function(res_data) {
      console.log(res_data);
      if (res_data.code === 1000) {
        var isMore = that.data.isMore;
        var nextPage = page + 1;
        if (page === 1) {
          that.data.list = res_data.data.data;
        } else {
          that.data.list = that.data.list.concat(res_data.data.data);
        }
        if (!res_data.data.next_page_url) {
          isMore = false;
        }

        that.setData({
          closedDemandId: that.data.closedDemandId > 0 ? that.data.closedDemandId :  res_data.data.closedDemandId,
          list: that.data.list,
          page: nextPage,
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
// pages/detail/detail.js
//获取应用实例
var app = getApp();
//查询用户信息
var util = require('../../utils/util.js');
var request = require("../../utils/request.js");

Page({
  data:{
    isShow: false,//控制emoji表情是否显示
    isLoad: true,//解决初试加载时emoji动画执行一次
    content: "",//评论框的内容
    isLoading: true,//是否显示加载数据提示
    disabled: true,
    cfBg: false,
    question: {},
    question_id: 0,
    comments: [],
    images: [],
    bottomId: 0,
    isMoreComment: true
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo,
        question_id: options.objId
      });
      // 查询对象
      request.httpsPostRequest('/weapp/question/info', { id: options.objId }, function (res_data) {
        if (res_data.code === 1000) {
          that.setData({
            question: res_data.data.question
          });
          
        } else {
          wx.showToast({
            title: res_data.message,
            icon: 'success',
            duration: 2000
          });
        }
      });
      //回复
      that.loadComments(0,0);
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
  loadComments: function(topId,bottomId) {
    var that = this;
    request.httpsPostRequest('/weapp/question/loadAnswer', { top_id: topId, bottom_id: bottomId, question_id: this.data.question_id }, function (res_data) {
      if (res_data.code === 1000) {
        var length = res_data.data.length;
        var bottomId = that.data.bottomId;
        var isMoreComment = true;
        if (length>0){
          bottomId = res_data.data[length - 1].id;
        }else {
          isMoreComment = false;
        }
        that.setData({
          comments: that.data.comments.concat(res_data.data),
          isLoading: false,
          bottomId: bottomId,
          isMoreComment: isMoreComment
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
  //底部更多加载
  onReachBottom: function () {
    var conArr = [], that = this;
    that.data.cfBg = false;
    console.log("onReachBottom");
    if (this.data.isMoreComment){
      this.loadComments(0, this.data.bottomId);
    }
  },
  commentSubmit: function(e) {
      var that = this, conArr = [];
      //此处延迟的原因是 在点发送时 先执行失去文本焦点 再执行的send 事件 此时获取数据不正确 故手动延迟100毫秒
      setTimeout(function () {
          if (that.data.content.trim().length > 0) {
              conArr.push({
                user_name: app.globalData.userInfo.nickName,
                user_avatar_url: app.globalData.userInfo.avatarUrl,
                created_at: util.formatTime(new Date()),
                content: that.data.content
              });

              var commentData = {
                question_id: that.data.question.id,
                description: that.data.content
              };
              request.httpsPostRequest('/weapp/answer/store', commentData, function (res_data) {
                console.log(res_data);
                wx.hideLoading();
                if (res_data.code === 1000) {
                  that.setData({
                    comments: conArr.concat(that.data.comments),
                    content: "",//清空文本域值
                    isShow: false,
                    cfBg: false
                  });

                } else {
                  wx.showToast({
                    title: res_data.message,
                    icon: 'success',
                    duration: 2000
                  });
                }
              });

          } else {
              that.setData({
                  content: ""//清空文本域值
              })
          }
      }, 100)
  },
  //文本域失去焦点时 事件处理
  textAreaBlur: function (e) {
      //获取此时文本域值
      console.log(e.detail.value)
      this.setData({
          content: e.detail.value
      })

  },
  //文本域获得焦点事件处理
  textAreaFocus: function () {
      this.setData({
          isShow: false,
          cfBg: false
      })
  },
  onShareAppMessage: function() {
    return{
      title:"快来帮我解决问题",
      path:"./page/user?id=123"
    }
  }
})
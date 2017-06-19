// pages/detail/detail.js
//获取应用实例
var app = getApp();
//查询用户信息
var util = require('../../utils/util.js');
var request = require("../../utils/request.js");

Page({
  data:{
    scrollX: true,
    scrollY: true,
    userInfo: {},
    question: {},
    comments: [],
    commentObj: {}
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
      // 查询单个对象
      request.httpsPostRequest('/weapp/question/info', { id: options.objId }, function (res_data) {
        console.log(res_data);
        wx.hideLoading();
        if (res_data.code === 1000) {
          that.setData({
            question: res_data.data.question,
            comments: res_data.data.comments
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
  commentInput: function(e){
    this.data.commentObj.author = this.data.userInfo;
    this.data.commentObj.commentStr = e.detail.value;
    this.data.commentObj.createAt = new Date();
    this.data.commentObj.formatDate = util.formatTime(this.data.commentObj.createAt);
  },
  commentSubmit: function(e) {
    if(!this.data.commentObj.commentStr || this.data.commentObj.commentStr === ''){
      wx.showToast({
        title: '评论为空',
        duration: 2000
      });
      return false;
    }
    this.data.comments.unshift(this.data.commentObj);

    var order = AV.Object.createWithoutData('orders', this.data.order.id);
    order.set('comments', this.data.comments);
    order.save().then(order => {
      wx.redirectTo({
        url: './detail?objId=' + this.data.order.id 
      });
    }, (error) => {
        throw error;
    });
  },
  showQRCode: function(e) {
    this.setData({
      QRCodeShow: e.target.dataset.qrcode,
      QRCodeShowFlag: true
    });
  },
  hideQRCode: function(e){
    if(e.target.id === 'QRCode-container') {
      this.setData({
        QRCodeShow: '',
        QRCodeShowFlag: false
      });
    }
  },
   onShareAppMessage:function(){
    return{
      title:"快来帮我拼单",
      path:"./page/user?id=123"
    }
  }
})
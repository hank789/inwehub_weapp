//index.js
//获取应用实例
var app = getApp();
//查询用户信息
const AV = require('../../libs/av-weapp.js');
var orderFormat = require('../../utils/orderFormat.js');

function orderRefresh(e, that) {
//查询多个数据，即首页数据列表查询
  var orders = new AV.Query('orders');
    if(e.hasOwnProperty('user')){
      orders.equalTo('author.nickName', e.user);
      that.setData({
        manage: {
          user:e.user,
          display:false
          }
      });
    }
    orders.descending('createdAt').find().then(function (results) {
      results = results.map((curvalue) => {
        return orderFormat.orderFormat(curvalue);
      });
      that.setData({
        orders: results
      });
    }, function (error) {
      
    });
}

Page({
  data: {
    userInfo: {},
    orders: [],
    manage:{}
  },
  //事件处理函数
  navToPost: function() {
    wx.navigateTo({
      url: '../post/post'
    });
  },
  onLoad: function (e) {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      });
    });
    orderRefresh(e, that);
  },
  onShow: function(){
    orderRefresh({}, this);
  },
  navToDetail: function(event) {
    var objId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../detail/detail?objId=' + objId 
    });
  },
  manageOrder:function(e){
    var that =this
    that.data.manage.display = !that.data.manage.display;
    that.data.manage.orderId = e.currentTarget.id;
    if(that.data.manage.display){
      that.data.manage.do = ['删除','分享']
    }else{
      delete that.data.manage.do
    }   
    that.setData({
      manage:that.data.manage
    });
  },
  chooseCircle: function(){
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function(res) {
        var latitude = res.latitude
        var longitude = res.longitude
        wx.openLocation({
          latitude: latitude,
          longitude: longitude,
          scale: 28
        });
      },
      fail: function(e) {
        console.log(e);
      }
    });
  },
  scanqr:function(){
    wx.scanCode({
      success: function(res){
        // success
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
  },
  onShareAppMessage:function(){
    return{
      title:"解惑助手",
      path:"./page/user?id=123"
    }
  }
})

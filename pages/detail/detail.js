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
    shareTip: 0,
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
    var scene = decodeURIComponent(options.scene)
    var demand_id = options.id;
    if (scene !== 'undefined') {
      demand_id = scene.split("=")[1];
    }
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        demand_id: demand_id,
        shareTip: options.share?options.share:0
      });
      // 查询对象
      request.httpsPostRequest('/weapp/demand/detail', { id: demand_id }, function (res_data) {
        if (res_data.code === 1000) {
          that.setData({
            demand: res_data.data,
            isLoading: false
          });
          if (that.data.shareTip) {
            wx.showModal({
              content: '分享你的招募，让更多的朋友看到~',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {

                }
              }
            });
          }
          
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
  authReopenDemand: function (e) {
    var that = this
    wx.showModal({
      title: '需求重新发布',
      content: '确认重新发布此需求？',
      confirmText: "确定",
      cancelText: "取消",
      success: function (res) {
        console.log(res);
        if (res.confirm) {
          console.log('用户点击确定')
          request.httpsPostRequest('/weapp/demand/reopen', { id: that.data.demand_id }, function (res_data) {
            if (res_data.code === 1000) {
              wx.redirectTo({
                url: '../detail/detail?id='+that.data.demand_id+'&share=1',
                success: function (e) {
                  wx.showToast({
                    title: '发布成功',
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
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  saveToShare: function (e) {
    //获得share组件
    this.shareView = this.selectComponent("#component-share-demand");
    this.setData({
      shareOption: {
        object_id: this.data.demand_id,
        object_type: 1,
        title: this.data.demand.title,
        content: this.data.demand.description,
        from: this.data.demand.publisher_name,
      }
    });
    console.log(this.shareView)
    this.shareView.show()
  },
  getShareBigImage: function (e) {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    request.httpsPostRequest('/weapp/demand/getShareImage', { id: this.data.demand_id, type: 1 }, function (res_data) {
      if (res_data.code === 1000) {
        wx.hideLoading();
        wx.previewImage({
          current: res_data.data.url, // 当前显示图片的http链接
          urls: [res_data.data.url]
        })

      } else {
        wx.showToast({
          title: res_data.message,
          icon: 'success',
          duration: 2000
        });
      }
    });
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  }
})
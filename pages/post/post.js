// pages/detail/detail.js
//获取应用实例
var app = getApp();

//查询用户信息
var request = require("../../utils/request.js");
Page({
  data:{
    showTopTips: false,
    errorMsg: '',
    author: {},
    content: '',
    title: '',
    address: '',
    rate: '',
    countries: ["中国", "美国", "英国"],
    industry_select: [],
    project_cycle_select: [
      {value:1,text:"小于1周"},
      {value:2,text:"1-2周"},
      {value:3,text:"2-4周"},
      {value:4,text:"1-2月"},
      {value:5,text:"2-4月"},
      {value:6,text:"4-6月"},
      {value:7,text:"半年以上"},
      {value:8,text:"不确定"},
      {value:9,text:"其他"}
      ],
    countryIndex: 0,
    industryIndex: 0,
    projectCycleIndex: 0,
    projectBeginTimeIndex: "2018-01-01",
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      if (!app.globalData.appAccessToken) {
        wx.showModal({
          content: '您的认证信息还未完善，前往完善信息',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.redirectTo({
                url: '../register/register'
              });
            }
          }
        });
      }
      //更新数据
      that.data.author = userInfo;
      request.httpsPostRequest('/tags/load', {tag_type: 3 }, function(res_data) {
        if (res_data.code === 1000) {
          var isMore = that.data.isMore;
          that.setData({
            industry_select: res_data.data.tags
          })
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
  contentEventFunc: function(e) {
    if(e.detail && e.detail.value) {
        this.data.content = e.detail.value;
    }
  },
  isPublicEventFunc: function (e) {
    if (e.detail && e.detail.value) {
      this.data.isPublic = e.detail.value;
    }
  },
  showTopTips: function (msg) {
    var that = this;
    this.setData({
      showTopTips: true,
      errorMsg: msg
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 3000);
  },
  bindCountryChange: function (e) {
    console.log('picker country 发生选择改变，携带值为', e.detail.value);

    this.setData({
      countryIndex: e.detail.value
    })
  },
  bindIndustryChange: function (e) {
    console.log(e.detail.value)
    this.setData({
      industryIndex: e.detail.value
    })
  },
  bindProjectCycleChange: function (e) {
    console.log(this.data.project_cycle_select[e.detail.value].value);
    this.setData({
      projectCycleIndex: e.detail.value
    })
  },
  bindProjectBeginTimeChange: function (e) {
    console.log(e.detail.value)
    this.setData({
      projectBeginTimeIndex: e.detail.value
    })
  },
  formSubmit: function(e) {
    if (this.data.content === '') {
      this.showTopTips('内容不能为空');
      return false;
    } else {
        var jsonData = {
          description: this.data.content,
          is_public: this.data.isPublic,
          images: this.data.pictures
        };
        var requestUrl = '/weapp/question/store';
        var that = this;
        var doResponse = function (res_data) {
          wx.hideLoading();
          if (res_data.data.code === 1000) {
          
          } else {
            wx.showToast({
              title: res_data.message,
              icon: 'success',
              duration: 2000
            });
          }
        };
        if (this.data.pictures.length >=1){
          wx.showLoading({
            title: "请求处理中"
          });
          request.httpsUpload(requestUrl, jsonData, 'image_file' , this.data.pictures[0], function (res_data) {
            console.log(res_data);
            wx.hideLoading();
            if (res_data.data.code === 1000){
              if (isset(that.data.pictures[1])) {
                addQuestionImage(res_data.data.data.id, that.data.pictures[1], doResponse);
              }
              if (isset(that.data.pictures[2])) {
                addQuestionImage(res_data.data.data.id, that.data.pictures[2], doResponse);
              }
              wx.switchTab({
                url: '/pages/mine/mine'
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
          request.httpsPostRequest(requestUrl, jsonData, function (res_data) {
            console.log(res_data);
            wx.hideLoading();
            if (res_data.code === 1000) {
              // 成功保存之后，执行其他逻辑.
              wx.showToast({
                title: "提问成功",
                icon: 'success',
                duration: 2000
              });
              wx.switchTab({
                url: '/pages/mine/mine'
              });
            } else {
              wx.showToast({
                title: res_data.message,
                icon: 'success',
                duration: 2000
              });
            }
          });
        }
        
    }
  }
})
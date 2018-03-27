// pages/register/register.js
//获取应用实例
var app = getApp();
//查询用户信息
var request = require("../../utils/request.js");
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    code: '',
    disabledSendPhoneCode: false,
    sendCodeLabel: "获取验证码"
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
    wx.stopPullDownRefresh();
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  count_down: function (e) {

  },
  /**
   * 发送验证码
   * @param e
   */
  tapSendCode: function (e) {
    var phone = this.data.phone;
    if (!phone || phone.length !== 11) {
      this.setData({
        phoneError: true
      });
      return;
    }
    this.setData({
      phoneError: false
    });
    var total_second = 120;
    this.setData({
      disabledSendPhoneCode: true
    })
    var requestUrl = '/auth/sendPhoneCode';
    var that = this;

    request.httpsPostRequest(requestUrl, { mobile: phone,type: 'weapp_register' }, function (res_data) {
      console.log(res_data);
      wx.hideLoading();
      if (res_data.code !== 1000) {
        wx.showToast({
          title: res_data.message,
          icon: 'none',
          duration: 2000
        });
      } else {
        util.countDown(that, total_second);
      }
    });
  },
  bindNameBlur: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  bindCompanyBlur: function (e) {
    this.setData({
      company: e.detail.value
    })
  },
  bindTitleBlur: function (e) {
    this.setData({
      title: e.detail.value
    })
  },
  bindEmailBlur: function (e) {
    this.setData({
      email: e.detail.value
    })
  },
  bindPhoneBlur: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  bindCodeBlur: function (e) {
    this.setData({
      code: e.detail.value
    })
  },
  formSubmit: function (e) {
    if (this.data.name === '') {
      wx.showToast({
        title: '请填写姓名',
        icon: 'none' ,
        duration: 2000
      })
      return false;
    }
    if (this.data.company === '') {
      wx.showToast({
        title: '请填写公司',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (this.data.title === '') {
      wx.showToast({
        title: '请填写职位',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (this.data.email === '') {
      wx.showToast({
        title: '请填写邮箱',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (this.data.phone === '') {
      wx.showToast({
        title: '请填写手机号',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (this.data.code === '') {
      wx.showToast({
        title: '请填写验证码',
        icon: 'none',
        duration: 2000
      })
      return false;
    }

    var jsonData = {
      name: this.data.name,
      mobile: this.data.phone,
      title: this.data.title,
      company: this.data.company,
      email: this.data.email,
      code: this.data.code,
      formId: e.detail.formId
    };
    var requestUrl = '/auth/weapp/register';
    var that = this;

    request.httpsPostRequest(requestUrl, jsonData, function (res_data) {
      console.log(res_data);
      wx.hideLoading();
      if (res_data.code === 1000) {
        // 成功保存之后，执行其他逻辑.
        app.globalData.userInfo.id = res_data.data.id;
        wx.showToast({
          title: "提交成功",
          icon: 'success',
          duration: 2000
        });
        wx.switchTab({
          url: '/pages/mine/mine'
        });
      } else {
        wx.showToast({
          title: res_data.message,
          icon: 'none',
          duration: 2000
        });
      }
    });


  }
})
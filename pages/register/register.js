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
    showTopTips: false,
    errorMsg: '',
    name: '',
    nameError: false,
    title: '',
    titleError: false,
    company: '',
    companyError: false,
    email: '',
    emailError: false,
    phone: '',
    phoneError: false,
    code: '',
    codeError: false,
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
    util.countDown(this, total_second);
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
      }
    });
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
      this.setData({
        nameError: true
      });
      return false;
    }
    this.setData({
      nameError: false
    });
    if (this.data.company === '') {
      this.setData({
        companyError: true
      });
      return false;
    }
    this.setData({
      companyError: false
    });
    if (this.data.title === '') {
      this.setData({
        titleError: true
      });
      return false;
    }
    this.setData({
      titleError: false
    });
    if (this.data.email === '') {
      this.setData({
        emailError: true
      });
      return false;
    }
    this.setData({
      emailError: false
    });
    if (this.data.phone === '') {
      this.setData({
        phoneError: true
      });
      return false;
    }
    this.setData({
      phoneError: false
    });
    if (this.data.code === '') {
      this.setData({
        codeError: true
      });
      return false;
    }
    this.setData({
      codeError: false
    });

    var jsonData = {
      name: this.data.name,
      mobile: this.data.phone,
      title: this.data.title,
      company: this.data.company,
      email: this.data.email,
      code: this.data.code,
      openid: app.globalData.userOpenid
    };
    var requestUrl = '/auth/weapp/register';
    var that = this;

    request.httpsPostRequest(requestUrl, jsonData, function (res_data) {
      console.log(res_data);
      wx.hideLoading();
      if (res_data.code === 1000) {
        // 成功保存之后，执行其他逻辑.
        app.globalData.appAccessToken = res_data.data.token;
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
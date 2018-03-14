// pages/detail/detail.js
//获取应用实例
var app = getApp();

//查询用户信息
var request = require("../../utils/request.js");
Page({
  data:{
    showTopTips: false,
    demand: {
      id: '',
      title: '',
      address: '',
      salary: '',
      project_begin_time: '2018-01-01',
      description: '',
      industry: 0,
      project_cycle: 0
    },
    errorMsg: '',
    author: {},
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
    projectCycleIndex: 0,
    industryIndex: 0
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    //更新数据
    that.setData({
      'demand.id': options.id
    });
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
      request.httpsPostRequest('/tags/load', {tag_type: 3 }, function(tag_data) {
        if (tag_data.code === 1000) {
          var isMore = that.data.isMore;
          that.setData({
            industry_select: tag_data.data.tags
          })
          if (that.data.demand.id) {
            request.httpsPostRequest('/weapp/demand/detail', { id: that.data.demand.id }, function (res_data) {
              if (res_data.code === 1000) {
                var tagLength = tag_data.data.tags.length;
                for (let i = 0; i<tagLength; i++) {
                  if (tag_data.data.tags[i].value == res_data.data.industry.value) {
                    that.data.industryIndex = i;
                    break;
                  }
                }
                that.setData({
                  industryIndex: that.data.industryIndex,
                  projectCycleIndex: res_data.data.project_cycle.value - 1,
                  'demand.title': res_data.data.title,
                  'demand.address': res_data.data.address,
                  'demand.salary' : res_data.data.salary,
                  'demand.project_begin_time' : res_data.data.project_begin_time,
                  'demand.description' : res_data.data.description,
                  'demand.industry' : res_data.data.industry.value,
                  'demand.project_cycle' : res_data.data.project_cycle.value
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
        } else {
          wx.showToast({
            title: tag_data.message,
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
  bindDescriptionBlur: function(e) {
    this.setData({
      'demand.description': e.detail.value
    })
  },
  bindTitleBlur: function (e) {
    this.setData({
      'demand.title': e.detail.value
    })
  },
  bindAddressBlur: function (e) {
    this.setData({
      'demand.address': e.detail.value
    })
  },
  bindSalaryBlur: function (e) {
    this.setData({
      'demand.salary': e.detail.value
    })
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
  bindIndustryChange: function (e) {
    console.log(e.detail.value)
    this.setData({
      industryIndex: e.detail.value,
      'demand.industry': this.data.industry_select[e.detail.value].value
    })
  },
  bindProjectCycleChange: function (e) {
    console.log(this.data.project_cycle_select[e.detail.value].value);
    this.setData({
      projectCycleIndex: e.detail.value,
      'demand.project_cycle':this.data.project_cycle_select[e.detail.value].value
    })
  },
  bindProjectBeginTimeChange: function (e) {
    console.log(e.detail.value)
    this.setData({
      'demand.project_begin_time': e.detail.value
    })
  },
  formSubmit: function(e) {
    if (this.data.demand.title === '') {
      this.showTopTips('标题不能为空');
      return false;
    }
    if (this.data.demand.address === '') {
      this.showTopTips('地点不能为空');
      return false;
    }
    if (this.data.demand.salary === '') {
      this.showTopTips('薪资不能为空');
      return false;
    }
    if (this.data.demand.description === '') {
      this.showTopTips('描述不能为空');
      return false;
    }
    wx.showLoading({
      title: '提交中...',
      mask: true
    });

    var requestUrl = '/weapp/demand/store';
    var title = '发布成功';
    if (this.data.demand.id) {
      requestUrl = '/weapp/demand/update';
      title = '修改成功';
    }

    var that = this;
    request.httpsPostRequest(requestUrl, this.data.demand, function (res_data) {
      console.log(res_data);
      wx.hideLoading();
      if (res_data.code === 1000) {
        wx.redirectTo({
          url: '../myDemand/myDemand',
          success: function (e) {
            wx.showToast({
              title: title,
              icon: 'success',
              duration: 2000
            });
          }
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
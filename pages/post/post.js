// pages/detail/detail.js
//获取应用实例
var app = getApp();

//查询用户信息
var request = require("../../utils/request.js");
var commonCityData = require('../../utils/city.js')

Page({
  data:{
    showTopTips: false,
    disabledSubmitButton: false,
    demand: {
      id: '',
      title: '',
      address: '',
      salary: '',
      salary_type: 0,
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
    salary_type: [
        {value:1,text:"元/天"},
        {value:2,text:"元/月"},
    ],
    salary_typeIndex: 0,
    projectCycleIndex: 0,
    industryIndex: 0,
    provinces:[],
    citys:[],
    districts:[],
    selProvince:'请选择',
    selCity:'请选择',
    selDistrict:'请选择',
    selProvinceIndex:0,
    selCityIndex:0,
    selDistrictIndex:0
  },
  onLoad:function(options){
    this.initCityData(1);
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    //更新数据
    that.setData({
      'demand.id': options.id
    });
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      if (!userInfo.id) {
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
                  selProvince: res_data.data.address.selProvince,
                  selCity: res_data.data.address.selCity,
                  selDistrict: res_data.data.address.selDistrict,
                  'demand.title': res_data.data.title,
                  'demand.address': res_data.data.address,
                  'demand.salary' : res_data.data.salary,
                  'demand.project_begin_time' : res_data.data.project_begin_time,
                  'demand.description' : res_data.data.description,
                  'demand.industry' : res_data.data.industry.value,
                  'demand.project_cycle' : res_data.data.project_cycle.value
                });
                that.setDBSaveAddressId(res_data.data.address);
                wx.setNavigationBarTitle({ title: '编辑需求' });
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
  bindDataCycleChange: function (e) {
      console.log(e)
      this.setData({
        'demand.salary_type': e.detail.value
      })
  },
  bindIndustryChange: function (e) {
    console.log(e.detail.value)
    console.log(this.data.industry_select[e.detail.value].value)
    this.setData({
      industryIndex: e.detail.value,
      'demand.industry': this.data.industry_select[e.detail.value].value
    })
  },
  bindProjectCycleChange: function (e) {
    console.log('周期' + this.data.project_cycle_select[e.detail.value].value);
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
      wx.showToast({
        title: '标题不能为空',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (this.data.selProvince == "请选择" || this.data.selCity == "请选择") {
      wx.showToast({
        title: '请选择地区',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (this.data.demand.salary === '') {
      wx.showToast({
        title: '薪资不能为空',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (this.data.demand.description === '') {
      wx.showToast({
        title: '描述不能为空',
        icon: 'none',
        duration: 2000
      })
      return false;
    }

    if (this.data.industryIndex === 0) {
      this.data.demand.industry = this.data.industry_select[this.data.industryIndex].value;
    }
    if (this.data.projectCycleIndex === 0) {
      this.data.demand.project_cycle = this.data.project_cycle_select[this.data.projectCycleIndex].value;
    }

    wx.showLoading({
      title: '提交中...',
      mask: true
    });
    this.setData({
      disabledSubmitButton: true
    });

    var cityId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].id;
    var provinceId = commonCityData.cityData[this.data.selProvinceIndex].id;
    var districtId;
    if (this.data.selDistrict == "请选择" || !this.data.selDistrict){
      districtId = '';
      this.data.selDistrict = '';
    } else {
      districtId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[this.data.selDistrictIndex].id;
    }

    var requestUrl = '/weapp/demand/store';
    var title = '发布成功';
    if (this.data.demand.id) {
      requestUrl = '/weapp/demand/update';
      title = '修改成功';
    }
    this.data.demand.address = {
      provinceId: provinceId,
      cityId: cityId,
      districtId: districtId,
      selProvince: this.data.selProvince,
      selCity: this.data.selCity,
      selDistrict: this.data.selDistrict,
      selProvinceIndex: this.data.selProvinceIndex,
      selCityIndex: this.data.selCityIndex,
      selDistrictIndex: this.data.selDistrictIndex
    };

    var that = this;
    request.httpsPostRequest(requestUrl, this.data.demand, function (res_data) {
      console.log(res_data);
      wx.hideLoading();
      if (res_data.code === 1000) {
        wx.redirectTo({
          url: '../myHistory/myHistory',
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
      that.setData({
        disabledSubmitButton: false
      });
    });
  },
  initCityData:function(level, obj){
    if(level == 1){
      var pinkArray = [];
      for(var i = 0;i<commonCityData.cityData.length;i++){
        pinkArray.push(commonCityData.cityData[i].name);
      }
      this.setData({
        provinces:pinkArray
      });
    } else if (level == 2){
      var pinkArray = [];
      var dataArray = obj.cityList
      for(var i = 0;i<dataArray.length;i++){
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        citys:pinkArray
      });
    } else if (level == 3){
      var pinkArray = [];
      var dataArray = obj.districtList
      for(var i = 0;i<dataArray.length;i++){
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        districts:pinkArray
      });
    }

  },
  bindPickerProvinceChange:function(event){
    var selIterm = commonCityData.cityData[event.detail.value];
    this.setData({
      selProvince:selIterm.name,
      selProvinceIndex:event.detail.value,
      selCity:'请选择',
      selCityIndex:0,
      selDistrict:'请选择',
      selDistrictIndex: 0
    })
    this.initCityData(2, selIterm)
  },
  bindPickerCityChange:function (event) {
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[event.detail.value];
    this.setData({
      selCity:selIterm.name,
      selCityIndex:event.detail.value,
      selDistrict: '请选择',
      selDistrictIndex: 0
    })
    this.initCityData(3, selIterm)
  },
  bindPickerChange:function (event) {
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[event.detail.value];
    if (selIterm && selIterm.name && event.detail.value) {
      this.setData({
        selDistrict: selIterm.name,
        selDistrictIndex: event.detail.value
      })
    }
  },
  setDBSaveAddressId: function(data) {
    var retSelIdx = 0;
    for (var i = 0; i < commonCityData.cityData.length; i++) {
      if (data.provinceId == commonCityData.cityData[i].id) {
        this.data.selProvinceIndex = i;
        for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
          if (data.cityId == commonCityData.cityData[i].cityList[j].id) {
            this.data.selCityIndex = j;
            for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
              if (data.districtId == commonCityData.cityData[i].cityList[j].districtList[k].id) {
                this.data.selDistrictIndex = k;
              }
            }
          }
        }
      }
    }
  },
})
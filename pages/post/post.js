// pages/detail/detail.js
//获取应用实例
var app = getApp();

//查询用户信息
var request = require("../../utils/request.js");
var pictures = [];
Page({
  data:{
    showTopTips: false,
    author: null,
    errorMsg: '',
    pictures: [],
    author: {},
    content: '',
    isPublic: false
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.data.pictures = [];
    pictures = [];//防止缓存影响
    
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.data.author = userInfo;
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
  },
  addQuestionImage: function (id, imagePath, res_func) {
    request.httpsUpload('/weapp/question/add_image', { id: id }, 'image_file', imagePath, function (res_data) {
      console.log(res_data);
      typeof res_func == "function" && res_func(res_data);
    });
  },
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.pictures // 需要预览的图片http链接列表
    })
  },
  chooseImage: function() {
      //上传图片相关
      var that = this;
      wx.chooseImage({
          count: 1, // 默认9
          sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success: function (res) {
              // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
              let tempFilePaths = res.tempFilePaths;
              
              tempFilePaths.forEach(function(url, index){
                //   pictures.push(url);
                //   that.setData({
                //       pictures: pictures
                //   });
                let strRegex = "(.jpg|.png|.gif|.jpeg)$"; //用于验证图片扩展名的正则表达式
                let re=new RegExp(strRegex);
                if (re.test(url.toLowerCase())){
                    let name = '' + index + '.' + url.split('.')[url.split('.').length - 1],localFile = url;
                    pictures.push(url);
                    that.setData({
                      pictures: pictures
                    });
                }else {
                    throw "选择的不是图片";
                }
               
              });
          }
      });
  }
})
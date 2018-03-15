var app = getApp();
//远程请求
var __httpsRequest = {
  //http 请求
  https_request: function (obj) {
    wx.request(obj);
  },
  //文件上传
  upload_request: function (dataSource) {
    wx.uploadFile(dataSource);
  }
};
module.exports = {
  //执行异步请求get
  httpsRequest: function (obj) {
    var jsonUrl = {};
    jsonUrl.url = obj.url;
    if (obj.header) jsonUrl.header = obj.header;
    if (obj.type)
      jsonUrl.method = obj.type;
    else
      jsonUrl.method = "GET";
    if (obj.data) jsonUrl.data = obj.data;
    obj.dataType ? (jsonUrl.dataType = obj.dataType) : (jsonUrl.dataType = "json");
    jsonUrl.success = obj.success;
    __httpsRequest.https_request(jsonUrl);
  },
  //get 请求
  httpsGetRequest: function (req_url, req_obj, res_func) {
    var jsonUrl = {
      url: app.globalData.host + req_url,
      header: {
        'content-type': 'application/json',
        'Authorization': 'bearer ' + app.globalData.appAccessToken
      },
      dataType: "json",
      method: "GET",
      success: function (res) {
        typeof res_func == "function" && res_func(res.data);
      }
    }
    if (req_obj) {
      jsonUrl.data = req_obj;
    }
    __httpRequest.https_request(jsonUrl);
  },
  //post 请求
  httpsPostRequest: function (req_url, req_obj, res_func) {
    var jsonUrl = {
      url: app.globalData.host + req_url,
      header: {
        'content-type': 'application/json',
        'Authorization': 'bearer ' + app.globalData.appAccessToken
      },
      dataType: "json",
      method: "POST",
      success: function (res) {
        typeof res_func == "function" && res_func(res.data);
      }
    }
    if (req_obj) {
      jsonUrl.data = req_obj;
    }
    __httpsRequest.https_request(jsonUrl);
  },
  //文件上传
  httpsUpload: function (req_url, formData, fileFieldName, fileDataSource, res_func) {
    var dataSource = {
      url: app.globalData.host + req_url,
      header: {
        "Content-Type": "multipart/form-data",
        'Authorization': 'bearer ' + app.globalData.appAccessToken
      },
      dataType: "json",
      formData: formData,
      filePath: fileDataSource,
      name: fileFieldName,
      success: function (res) {
        typeof res_func == "function" && res_func(JSON.parse(res.data));
      }
    }
    __httpsRequest.upload_request(dataSource);
  }
};
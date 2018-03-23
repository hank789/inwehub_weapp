//logs.js
var request = require("../../utils/request.js");
Page({
  data: {
    demand_id: 0,
    demand: {},
    list: [],
    page: 1,
    isLoading: true,//是否显示加载数据提示
    isMore: true
  },
  onLoad: function (options) {
    this.setData({
      demand_id: options.id
    })
    this.loadList(1);
  },
  onPullDownRefresh: function () {
    // 下拉刷新
    this.data.page = 1;
    this.loadList(1);
    wx.stopPullDownRefresh();
  },
  //底部更多加载
  onReachBottom: function () {
    if (this.data.isMore) {
      this.setData({
        isLoading: true
      });
      this.loadList(this.data.page + 1);
    }
  },
  navToRoom: function (e) {
    wx.navigateTo({
      url: '../chat/chat?id=' + e.currentTarget.dataset.id
    });
  },
  loadList: function (page) {
    var that = this;
    request.httpsPostRequest('/weapp/demand/getRooms', { id: this.data.demand_id, page: this.data.page }, function(res_data) {
      console.log(res_data);
      if (res_data.code === 1000) {
        var isMore = that.data.isMore;
        var nextPage = page + 1;
        if (page === 1) {
          that.data.list = res_data.data.data;
        } else {
          that.data.list = that.data.list.concat(res_data.data.data);
        }
        if (!res_data.data.next_page_url) {
          isMore = false;
        }

        that.setData({
          demand: res_data.data.demand,
          list: that.data.list,
          page: nextPage,
          isLoading: false,
          isMore: isMore
        });
      } else {
        wx.showToast({
          title: res_data.message,
          icon: 'loading',
          duration: 2000
        });
      }
    });
  }
})

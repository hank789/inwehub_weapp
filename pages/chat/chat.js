import Echo from '../../libs/echo';
var app = getApp();
var request = require("../../utils/request.js");
var nextMsgUuid = 0;
var EchoIo = new Echo({
  broadcaster: 'socket.io',
  host: app.globalData.sockHost,
  auth: {
    headers: {
      'Authorization': 'Bearer ' + 'nb35mdq2ca9828qgl4sgjf4imil5811sn41qsmcaph0p3h6sa5ht8hoktdeg'
    }
  }
});
function msgUuid() {
  return ++nextMsgUuid;
}

function createSystemMessage(content) {
  return { id: msgUuid(), type: 'system', data: {text: content}};
}

Page({
  data: {
    minutes: 0,//分钟间隔
    typers: [],
    isTyping: false,
    systemMessages: [],
    messages: [],
    inputContent: '',
    lastMessageId: 0,
    userInfo: {},
    page: 1,
    room: {},
    room_id: 0,
    isLoading: true,//是否显示加载数据提示
    isMore: true
  },
  onLoad:function(options){
    this.pushMessage(createSystemMessage('正在建立连接...'));
    this.setData({
      room_id: options.id,
    });
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo: userInfo
      });
      that.connect()
    });
  },
  navToDetail: function (event) {
    wx.navigateTo({
      url: '../detail/detail?id=' + event.currentTarget.dataset.id
    });
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },
  onReady() {
    var that = this;
    // 查询对象
    request.httpsPostRequest('/im/getRoom', { room_id: this.data.room_id }, function (res_data) {
      if (res_data.code === 1000) {
        that.setData({
          room: res_data.data
        });
        wx.setNavigationBarTitle({ title: that.data.room.r_name });
        that.amendMessage(createSystemMessage('薪资：'+ that.data.room.source.salary + '元/天\n行业：'+that.data.room.source.industry.text+
          '\n地点：'+that.data.room.source.address.selProvince+that.data.room.source.address.selCity+(that.data.room.source.address.selDistrict?that.data.room.source.address.selDistrict:'')+
        '\n周期：'+that.data.room.source.project_cycle.text+'\n项目开始时间：'+that.data.room.source.project_begin_time));
        that.pushMessage(createSystemMessage('您正在与'+that.data.room.contact.name+'聊天'));
        that.loadMessages();
      } else {
        wx.showToast({
          title: res_data.message,
          icon: 'success',
          duration: 2000
        });
      }
    });

  },

  onShow() {

  },

  onHide() {

  },
  upper: function(e) {
    if (this.data.isMore && !this.data.isLoading) {
      console.log(e)
      this.loadMessages();
    }
  },
  connect() {
    var that = this;
    EchoIo.options.auth.headers['Authorization'] = 'Bearer ' + app.globalData.appAccessToken
    // 监听通知事件
    EchoIo.private('room.'+ this.data.room_id +'.user.' + app.globalData.userInfo.id)
      .notification(function(n) {
        console.log(n);
        that.pushMessage({id: n.message_id, avatar: n.avatar, data: n.body, created_at: n.created_at});
      })
    EchoIo.private('chat.room.' + this.data.room_id)
      .listenForWhisper('typing', (user) => {
        this.startedTyping(user.username)
      }).listenForWhisper('finished-typing', (user) => {
      this.finishedTyping(user.username)
    })
  },
  /**
   * Broadcast "typing".
   *
   * @return void
   */
  whisperTyping () {
    console.log('chat.room whisperTyping() fired roomId:' + this.data.room_id);
    var roomId = this.data.room_id;
    if (this.data.isTyping) return
    console.log('chat.room roomId:' + roomId)
    EchoIo.private('chat.room.' + roomId).whisper('typing', {
      username: this.data.userInfo.name
    })
    this.setData({
      isTyping: true
    });
  },
  /**
   * Broadcast "finished-typing".
   *
   * @return void
   */
  whisperFinishedTyping () {
    var roomId = this.data.room_id;
    console.log('chat.room roomId:' + roomId)
    EchoIo.private('chat.room.' + roomId).whisper('finished-typing', {
      username: this.data.userInfo.name
    })
    this.setData({
      isTyping: false
    });
  },
  startedTyping (username) {
    let index = this.data.typers.indexOf(username)

    if (index === -1) {
      this.data.typers.push(username)
      this.setData({
        typers: this.data.typers,
        lastMessageId: this.data.lastMessageId + 1
      })
    }
  },
  finishedTyping (username) {
    let index = this.data.typers.indexOf(username)

    if (index !== -1) {
      this.data.typers.splice(index, 1)
      this.setData({
        typers: this.data.typers,
        lastMessageId: this.data.lastMessageId - 1
      })
    }
  },
  updateMessages(updater, messageType) {
    if (messageType === 'system') {
      updater(this.data.systemMessages);
    } else {
      updater(this.data.messages);
    }
    var length = this.data.messages.length;
    this.setData({
      messages: this.data.messages,
      systemMessages: this.data.systemMessages,
      lastMessageId: length > 0 ? this.data.messages[length - 1].id : 0
    });
  },

  pushMessage(message) {
    this.updateMessages(messages => messages.push(message), message.type);
  },

  amendMessage(message) {
    this.updateMessages(messages => messages.splice(-1, 1, message), message.type);
  },
  popMessage() {
    this.updateMessages(messages => messages.pop(), message.type);
  },

  changeInputContent(e) {
    this.setData({ inputContent: e.detail.value });
  },
  loadMessages() {
    var that = this;
    this.setData({
      isLoading: true
    });
    request.httpsPostRequest('/im/messages', { page:this.data.page, room_id: this.data.room_id }, function (res_data) {
      if (res_data.code === 1000) {
        var resLength = res_data.data.data.length;
        if (resLength > 0) {
          var messages = res_data.data.data.concat(that.data.messages);
          var nextPage = that.data.page + 1;
          that.setData({
            contact: res_data.data.contact,
            page: nextPage,
            isMore: true,
            messages: messages,
            isLoading: false,
            lastMessageId: that.data.page>=2 ? messages[0].id : messages[messages.length - 1].id
          });
        } else {
          that.setData({
            isMore: false,
            isLoading: false
          })
        }
      } else {
        wx.showToast({
          title: res_data.message,
          icon: 'success',
          duration: 2000
        });
      }
    });
  },
  sendSystemTime() {
    //获取当前时间
    var myDate = new Date();
    var timestamp = Date.parse(myDate);
    var hours = myDate.getHours().toString();       //获取当前小时数(0-23)
    var minutes = myDate.getMinutes().toString();     //获取当前分钟数(0-59)
    var mydata = (hours[1]?hours:('0'+hours)) + ':' + (minutes[1]?minutes:('0'+minutes));
    var length = this.data.messages.length;
    //如果两次时间间隔大于3分钟
    if (length === 0 || (timestamp - this.data.messages[length-1].created_at_timestamp >= 180)) {
      this.data.messages.push(createSystemMessage(mydata));
      this.setData({
        messages: this.data.messages,
        lastMessageId: length > 0 ? this.data.messages[length - 1].id : this.data.lastMessageId
      });
    }
    this.setData({
      minutes: minutes
    })

  },
  sendMessage(e) {
    if (e.detail.value) {
      this.setData({ inputContent: '' });
      this.whisperFinishedTyping();
      var that = this
      request.httpsPostRequest('/im/message-store', { text:e.detail.value,contact_id:this.data.room.contact.id, room_id: this.data.room_id }, function (res_data) {
        if (res_data.code === 1000) {
          that.sendSystemTime();
          that.pushMessage(res_data.data);
        } else {
          wx.showToast({
            title: res_data.message,
            icon: 'success',
            duration: 2000
          });
        }
      });
    }
  },
  chooseImage: function() {
    //上传图片相关
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        that.whisperFinishedTyping();
        var tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths[0])
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        request.httpsUpload('/im/message-store', { img:1,contact_id:that.data.room.contact.id, room_id: that.data.room_id },'img_file', tempFilePaths[0], function (res_data) {
          console.log(res_data);
          if (res_data.code === 1000) {
            that.sendSystemTime();
            var message = res_data.data;
            message.data.img = tempFilePaths[0]
            that.pushMessage(message)
          } else {
            wx.showToast({
              title: res_data.data.message,
              icon: 'success',
              duration: 2000
            });
          }
        });
      }
    });
  },
  previewImage: function(e){
    wx.previewImage({
      current: e.currentTarget.dataset.url, // 当前显示图片的http链接
      urls: [e.currentTarget.dataset.url]
    })
  }
});
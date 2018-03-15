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
  return 'msg_' + ++nextMsgUuid;
}

function createSystemMessage(content) {
  return { id: msgUuid(), type: 'system', data: {text: content}};
}

Page({
  data: {
    messages: [],
    inputContent: '大家好啊',
    lastMessageId: 'none',
    userInfo: {},
    page: 1,
    room: {},
    room_id: 0
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
    });
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
        that.amendMessage(createSystemMessage('薪资：'+ that.data.room.source.salary + '元/天；行业：'+that.data.room.source.industry.text+'；地点：'+that.data.room.source.address));
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
    this.connect();
  },

  onHide() {

  },

  connect() {
    var that = this;
    EchoIo.options.auth.headers['Authorization'] = 'Bearer ' + app.globalData.appAccessToken
    // 监听通知事件
    EchoIo.private('room.'+ this.data.room_id +'.user.' + app.globalData.userInfo.id)
      .notification(function(n) {
        console.log(n);
        that.pushMessage({avatar: n.avatar, data: n.body, created_at: n.created_at});
      })
  },

  updateMessages(updater) {
    var messages = this.data.messages;
    updater(this.data.messages);
    this.setData({
      messages: this.data.messages,
      lastMessageId: messages.length && messages[messages.length - 1].id
    });
  },

  pushMessage(message) {
    this.updateMessages(messages => messages.push(message));
  },

  amendMessage(message) {
    this.updateMessages(messages => messages.splice(-1, 1, message));
  },
  concatMessage(messageArr) {
    var messages = this.data.messages;
    messages = messages.concat(messageArr);
    this.setData({
      messages: messages,
      lastMessageId: messages.length && messages[messages.length - 1].id
    });
  },
  popMessage() {
    this.updateMessages(messages => messages.pop());
  },

  changeInputContent(e) {
    this.setData({ inputContent: e.detail.value });
  },
  loadMessages() {
    var that = this;
    request.httpsPostRequest('/im/messages', { page:this.data.page, room_id: this.data.room_id }, function (res_data) {
      if (res_data.code === 1000) {
        that.concatMessage(res_data.data.data)
        that.setData({
          page: that.data.page + 1,
          contact: res_data.data.contact
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
  sendMessage(e) {
    setTimeout(() => {
      if (this.data.inputContent) {
        var that = this
        request.httpsPostRequest('/im/message-store', { text:this.data.inputContent,contact_id:this.data.room.contact.id, room_id: this.data.room_id }, function (res_data) {
          if (res_data.code === 1000) {
            that.pushMessage(res_data.data)

          } else {
            wx.showToast({
              title: res_data.message,
              icon: 'success',
              duration: 2000
            });
          }
        });
        this.setData({ inputContent: '' });
      }
    });
  },
});
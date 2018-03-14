import Echo from '../../libs/echo';
var app = getApp();
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
  return { id: msgUuid(), type: 'system', content };
}

Page({
  data: {
    messages: [],
    inputContent: '大家好啊',
    lastMessageId: 'none',
  },

  onReady() {
    wx.setNavigationBarTitle({ title: '三木聊天室' });
  },

  onShow() {
    this.pushMessage(createSystemMessage('正在登陆...'));
    this.connect();
  },

  onHide() {
    if (this.tunnel) {
      this.tunnel.close();
    }
  },

  connect() {
    this.amendMessage(createSystemMessage('正在加入群聊...'));
    console.log('listen notification');
    EchoIo.options.auth.headers['Authorization'] = 'Bearer ' + app.globalData.appAccessToken
    // 监听通知事件
    EchoIo.channel('notification.user.' + app.globalData.userInfo.id)
      .notification(function(n) {
        console.log(n);
      })
  },

  updateMessages(updater) {
    var messages = this.data.messages;
    updater(this.data.messages);
    this.setData({
      messages,
      lastMessageId: messages.length && messages[messages.length - 1].id
    });
  },

  pushMessage(message) {
    this.updateMessages(messages => messages.push(message));
  },

  amendMessage(message) {
    this.updateMessages(messages => messages.splice(-1, 1, message));
  },

  popMessage() {
    this.updateMessages(messages => messages.pop());
  },

  changeInputContent(e) {
    this.setData({ inputContent: e.detail.value });
  },

  sendMessage(e) {
    if (!this.tunnel || !this.tunnel.isActive()) {
      this.pushMessage(createSystemMessage("您还没有加入群聊，请稍后重试"));
      return;
    }
    setTimeout(() => {
      if (this.data.inputContent && this.tunnel) {
        this.tunnel.emit('speak', { word: this.data.inputContent });
        this.setData({ inputContent: '' });
      }
    });
  },
});
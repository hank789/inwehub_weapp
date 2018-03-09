function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function countDown(that, second) {
  if (second <= 0) {
    that.setData({
      sendCodeLabel: "重新发送",
      disabledSendPhoneCode: false
    });
    // timeout则跳出递归
    return;
  }

  // 渲染倒计时时钟
  that.setData({
    sendCodeLabel: second + " 秒"
  });

  setTimeout(function () {
    // 放在最后--
    second -= 1;
    countDown(that, second);
  }, 1000)
}

module.exports = {
  formatTime: formatTime,
  countDown: countDown
}

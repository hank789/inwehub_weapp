// components/share/share.js
var request = require("../../utils/request.js");
Component({
  options: {},
  /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  properties: {
    option :{
      type : Object ,
      value : {
        object_id: 0,
        object_type: 1,
        title: '',
        from: '',
        content: ''
      }
    }
  },

  /**
   * 私有数据,组件的初始数据
   * 可用于模版渲染
   */
  data: {
    // 弹窗显示控制
    isShow:false,
    x: 0
  },

  /**
   * 组件的方法列表
   * 更新属性和数据的方法与更新页面数据的方法类似
   */
  methods: {
    /*
     * 公有方法
     */

    canvasIdErrorCallback(e) {
      console.log(e)
    },
    moveStart(e) {
      this.x = e.touches[0].clientY
    },
    moveEnd(e) {
      let changedX = e.changedTouches[0].clientX - this.x
      if (Math.abs(changedX) > 80) this.isShow = false;
    },
    save() {
      try {
        console.log('save img')
        this.canvasToTmp("canvasShare")
        wx.showToast({
          title: '图片保存成功，请到朋友圈分享',
          icon: 'success',
          duration: 2000
        });
      } catch (err) {
        console.log(err)
        wx.showToast({
          title: '图片保存失败',
          icon: 'warn',
          duration: 2000
        });
      }
      this.setData({
        isShow: false
      })
    },
    canvasToTmp(canvasId) {
      console.log(canvasId)
      wx.canvasToTempFilePath({
        canvasId: canvasId,
        success: function(res) {
          console.log(res.tempFilePath)
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
          });
        },
        fail: function(res) {
          console.log(res)
        }
      },this)
    },
    show() {
      if (this.isShow) return;
      this.setData({
        isShow: true
      });

      try {
        const title = this.data.option.title
        const from = this.data.option.from
        const content = "  " + this.data.option.content.trim()
        const params = this.data.option.params
        // 获取canvas对象
        const ctx = wx.createCanvasContext("canvasShare",this);
        // 绘制背景
        ctx.rect(0, 0, 250, 333)
        ctx.setFillStyle('#ffffff')
        ctx.fill()
        // 基础设置
        ctx.setFillStyle('#000000')
        let lineHeight = 15
        let y = 10;
        // 绘制标题
        ctx.setFontSize(12);
        for (let i = 0; i < title.length / 15 && i < 2; i++) {
          y += lineHeight;
          ctx.fillText(title.substr(i * 15, 15), 10, y);
        }
        // 绘制来源 标签
        ctx.setFontSize(10);
        if (from != "") {
          console.log(from)
          ctx.setFillStyle('#888888')
          y += 8
          y += lineHeight;
          ctx.fillText(from.substr(0, 15), 10, y);
        }
        // 绘制content
        ctx.setFillStyle('#000000')
        y += 8
        for (let i = 0; i < content.length / 18 && i < 7; i++) {
          y += lineHeight;
          ctx.fillText(content.substr(i * 18, 18), 10, y);
        }
        // 绘制左下角引导语
        ctx.setFontSize(12);
        y += lineHeight + 8
        ctx.fillText("长按识别顾问助手", 10, y + lineHeight * 2 + 5);
        ctx.fillText("查看完整内容", 10, y + lineHeight * 3 + 5);
        // 绘制右下角小程序码
        request.httpsPostRequest('/weapp/user/getQrCode', { object_id: this.data.option.object_id,object_type: this.data.option.object_type }, function (res_data) {
          if (res_data.code === 1000) {
            console.log(res_data.data);
            ctx.drawImage(res_data.data.qrcode, 110, y, 80, 80);
            ctx.draw();
          } else {
            wx.showToast({
              title: res_data.message,
              icon: 'success',
              duration: 2000
            });
          }
        });

      } catch (error) {
        console.log(error);
        wx.showToast({
          title: '绘制分享图片失败！',
          icon: 'warn',
          duration: 2000
        });
        this.setData({
          isShow: false
        })
      }
    }
  }
})
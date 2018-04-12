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
    x: 0,
    screenWidth: 0,
    windowWidth: 0,
    windowHeight: 0,
    contentHeight: 0,
    footer: '',
    offset: 0,
    lineHeight: 30
  },
  ready: function () {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          screenWidth: res.screenWidth,
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
          offset: 15
        });
      }
    });
  },

  /**
   * 组件的方法列表
   * 更新属性和数据的方法与更新页面数据的方法类似
   */
  methods: {
    /*
     * 公有方法
     */

    drawSquare: function (ctx, height) {
      ctx.rect(0, 50, this.data.windowWidth, height);
      ctx.setFillStyle("#f5f6fd");
      ctx.fill()
    },

    drawFont: function (ctx, content, height) {
      ctx.setFontSize(16);
      ctx.setFillStyle("#484a3d");
      ctx.fillText(content, this.data.offset, height);
    },

    drawLine: function (ctx, height) {
      ctx.beginPath();
      ctx.moveTo(this.data.offset, height);
      ctx.lineTo(this.data.windowWidth - this.data.offset, height);
      ctx.stroke('#eee');
      ctx.closePath();
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

        let i = 0;
        let lineNum = 1;
        let thinkStr = '';
        let thinkList = [];
        for (let item of content) {
          if (item === '\n') {
            thinkList.push(thinkStr);
            thinkList.push('a');
            i = 0;
            thinkStr = '';
            lineNum += 1;
          } else if (i === 22) {
            thinkList.push(thinkStr);
            i = 1;
            thinkStr = item;
            lineNum += 1;
          } else {
            thinkStr += item;
            i += 1;
          }
        }
        thinkList.push(thinkStr);

        // 获取canvas对象
        const ctx = wx.createCanvasContext("canvasShare",this);
        let contentHeight = lineNum * this.data.lineHeight + 180;
        this.drawSquare(ctx, contentHeight);
        this.setData({ contentHeight: contentHeight });
        let height = 100;
        for (let item of thinkList) {
          if (item !== 'a') {
            this.drawFont(ctx, item, height);
            height += this.data.lineHeight;
          }
        }
        this.drawLine(ctx, lineNum * this.data.lineHeight + 120);
        this.drawFont(ctx, this.data.footer, lineNum * this.data.lineHeight + 156);
        let that = this;
        // 绘制右下角小程序码
        request.httpsPostRequest('/weapp/user/getQrCode', { object_id: this.data.option.object_id,object_type: this.data.option.object_type }, function (res_data) {
          if (res_data.code === 1000) {
            console.log(res_data.data);
            ctx.drawImage(res_data.data.qrcode, that.data.windowWidth - that.data.offset - 50, lineNum * that.data.lineHeight + 125, 50, 50);
            ctx.draw();
            wx.canvasToTempFilePath({
              canvasId: 'canvasShare',
              success: function(res) {
                console.log(res.tempFilePath)
                wx.previewImage({
                  current: res.tempFilePath, // 当前显示图片的http链接
                  urls: [res.tempFilePath]
                })
              },
              fail: function(res) {
                console.log(res)
              }
            },that)
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
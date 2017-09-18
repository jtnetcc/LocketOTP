let TOTP = require('../../utils/totp')
let util = require('../../utils/util')
let digits = []
let tokens = []
let percentage = 0

Page({
  data: {
    tokens: digits,
    animationData: {}
  },

  onShareAppMessage: function (res) {
    return {
      title: 'LocketOTP - 便携的身份验证器',
      path: '/pages/token/token',
      imageUrl: '/utils/icon/demo.png',
      success: function (res) { },
      fail: function (res) { }
    }
  },

  onShow: function (options) {
    let self = this

    let sc_width = 0
    wx.getSystemInfo({
      success: function (res) {
        sc_width = res.windowWidth
      },
    })

    let animation = wx.createAnimation({
      duration: 1000,
      timingFunction: "linear",
      delay: 0,
    })
    setInterval(function () {
      let i = util.getSeconds() % 30 + 1
      animation.width((sc_width / 30 * i)).step()

      self.setData({
        animationData: animation.export()
      })
      if (1 == i) {
        self.updateDigits(self)
      }
    }, 1000)

    self.updateDigits(self)
  },

  tokenOperation: function (e) {
    console.log(e.currentTarget.id)
    wx.showActionSheet({
      itemList: ["编辑", "删除"],
      itemColor: '#000000',
      success: function (res) {
        if (0 == res.tapIndex) {
          console.log("编辑" + e.currentTarget.id)
          wx.navigateTo({
            url: '../edit/edit?token_id=' + e.currentTarget.id
          })
        } else if (1 == res.tapIndex) {
          console.log("删除" + e.currentTarget.id)
          util.removeToken(e.currentTarget.id)
        }
      }
    })
  },


  showActionSheet: function () {
    wx.scanCode({
      onlyFromCamera: true,
      success: function (res) {
        console.log(res.result)
        let url_obj = util.parseURL(res.result)
        let url_params = url_obj.params
        if (null == url_params) {
          wx.showToast({
            title: '二维码无效',
            image: '/utils/icon/x.png',
            duration: 2000
          })
        } else {
          let values = {
            issuer: "issuer" in url_params ? url_params.issuer : "",
            remark: "remark" in url_params ? url_params.remark : "",
            secret: "secret" in url_params ? url_params.secret : ""
          }
          util.addToken(values, "scan")
          console.log(values)
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  updateDigits: function (self) {
    wx.getStorage({
      key: 'token',
      success: function (res) {
        tokens = res.data
        digits = []
        for (let i = 0; i < tokens.length; i++) {
          let secret = TOTP.now(tokens[i].secret)
          let digit_obj = {
            issuer: tokens[i].issuer,
            remark: tokens[i].remark,
            secret: secret
          }
          digits.push(digit_obj)
        }
        console.log(digits)
        self.setData({
          tokens: digits
        })
      },
      fail: function (res) {
        console.log(res)
      },
    })
  }
})
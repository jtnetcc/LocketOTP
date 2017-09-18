let token = []
let token_id
Page({

  data: {
    issuer: '',
    remark: ''
  },

  onLoad: function (options) {
    let self = this
    console.log(options.token_id)
    token_id = options.token_id
    wx.getStorage({
      key: 'token',
      success: function (res) {
        token = res.data
        let target_token = token[token_id]
        self.setData({
          issuer: target_token.issuer,
          remark: target_token.remark
        })
      }
    })
  },

  keySubmit: function (e) {
    let values = e.detail.value
    token[token_id].issuer = values.issuer
    token[token_id].remark = values.remark

    wx.setStorage({
      key: 'token',
      data: token,
      success: function (res) {
        wx.navigateBack({
          delta: 1,
        })
      }
    })
  }

})
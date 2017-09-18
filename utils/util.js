let TOTP = require('totp')

function getSeconds() {
  let now = new Date()
  return now.getSeconds()
}

function parseURL(url) {
  let url_a = url.split("?")
  if (1 == url_a.length) {
    return {
      params: null
    }
  } else {
    let search = url_a[1]
    return {
      params: (function () {
        var ret = {},
          seg = search.replace(/^\?/, '').split('&'),
          len = seg.length,
          i = 0,
          s;
        for (; i < len; i++) {
          if (!seg[i]) {
            continue;
          }
          s = seg[i].split('=');
          ret[s[0]] = s[1];
        }
        return ret;
      })()
    }
  }
}

function addToken(values, path) {
  let token = []
  let token_obj = {
    issuer: values.issuer,
    remark: values.remark,
    secret: values.secret
  }
  console.log(token_obj)
  wx.getStorage({
    key: 'token',
    success: function (res) {
      token = res.data
      token.push(token_obj)
      wx.setStorage({
        key: 'token',
        data: token,
        success: function (res) {
          console.log(res)
        },
        fail: function (res) {
          console.log(res)
        },
      })
    },
    fail: function (res) {
      token.push(token_obj)
      wx.setStorage({
        key: 'token',
        data: token,
        success: function (res) {
          console.log(res)
        },
        fail: function (res) {
          console.log(res)
        },
      })
    },
    complete: function () {
      if ("man" == path) {
        wx.navigateBack({
          delta: 1,
        })
      } else if ("scan" == path) {
        wx.reLaunch({
          url: 'token',
        })
      }
    }
  })
}

function removeToken(token_id) {
  let token = []
  wx.showModal({
    content: '确定删除这条记录吗？',
    showCancel: true,
    cancelText: '取消',
    confirmText: '确定',
    success: function (res) {
      if (res.confirm) {
        wx.getStorage({
          key: 'token',
          success: function (res) {
            token = res.data
            token.splice(token_id, 1)
            wx.setStorage({
              key: 'token',
              data: token,
              success: function (res) {
                console.log(res)
              },
              fail: function (res) {
                console.log(res)
              }
            })
          },
          complete: function (res) {
            wx.reLaunch({
              url: 'token',
            })
          }
        })
      } else if (res.cancel) {
        console.log("cancelled")
      }
    }
  })
}

module.exports = {
  getSeconds: getSeconds,
  addToken: addToken,
  removeToken: removeToken,
  parseURL: parseURL
}
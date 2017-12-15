const util= require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    getUserInfoFail:false
  },
  login: function () {
    var that = this
    if (typeof success == "function") {
      this.data.getUserInfoSuccess = success
    }
    wx.login({
      success: function (res) {
        var code = res.code;
        wx.getUserInfo({
          success: function (res) {
            //平台登录
            let app = getApp();
             
           
            
            app.globalData.userInfo = res.userInfo;
          
            wx.switchTab({
              url: '../index/index',
            });
          },
          fail: function (res) {
            that.setData({
              getUserInfoFail: true
            })
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.login()
  },
  authorize:function(){
    let that=this;
    wx.openSetting({
      success: function (res) {
        //尝试再次登录
        console.log(res)
        that.login()
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})
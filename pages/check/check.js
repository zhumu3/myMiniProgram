const app=getApp();
const util=require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
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
    
  },
  formSubmit:function(e){
    console.log(e.detail.value.input);
    const message = e.detail.value.input;
    if(message==''||message=={}||message==[]){
      wx.showModal({
        title: '输入为空哦~',
        showCancel: false,
    })
    return;
    }
    //拿到数据成功之后
    app.globalData.isCheckDone=true;
    app.globalData.isDone = true;
    // let info={
    //   iconUrl:app.globalData.userInfo.avatarUrl,
    //   inde: 30,
    //   name: app.globalData.userInfo.nickName,
    //   time:'2017-09-09',
    //   info:e.detail.value.input
    // };
    // app.globalData.checkList.unshift(info);

    util.ajax(app.globalData.baseURL+'api/yx/addSay',{
      student_id: app.globalData.userInfo.student_id,
      activity_id: app.globalData.activityInfo.activity_id,
      say:message,
      session_id: app.globalData.userInfo.true_session_id
    },(res)=>{
      let d=new Date();
      let str = util.formulaTime(d);
        app.globalData.checkInfo={
          time:str,
          info:message
        };
        wx.switchTab({
          url: '../index/index'
        })
      if(res.data.code!=11999999){
        console.log(res);
        wx.showModal({
          title: res.data.message,
          showCancel:false
        })
      }
    })
    // console.log(info);
    // 切换回主页
    
  }
})
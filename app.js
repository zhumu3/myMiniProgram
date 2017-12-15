const util = require('utils/util.js');
//app.js
App({

  globalData: {
    baseURL:'https://t-mtiku.gaodun.com/',
    userInfo: null,
    isCheckDone: false,
    isDone:false,
    student_id: 1,
    checkList: [],
    examList: []
  },
  onLaunch: function(res){
    //记录用户打开小程序
    let openTime = wx.getStorageSync('openTime');
    if (openTime || openTime==0) {
      openTime++;
      wx.setStorage({
        key: 'openTime',
        data: openTime,
      });
      this.globalData.openTime = openTime;
    } else {
      wx.setStorage({
        key: 'openTime',
        data: 0,
      });
      this.globalData.openTime = 0;
    }
  },
})
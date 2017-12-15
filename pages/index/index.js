//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js');
Page({
  data: {
    student_id: 1,
    activity_id: 1,
    // 获取到student_id
    reqTime:0,
    pageIndex:1,
    motto: 'Hello World',
    currentInd:0,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    checkList: [],
    workInfo: [
      {
        title: '今日作业',
        content: '',
        type: 1,
        isDone: false
      }
    ],//轮播图,
    globalData: app.globalData,
    nowCheck: 2,
    allCheck: 20
  },
  //事件处理函数
  
  onLoad: function (res) {
  


    wx.showShareMenu({
      withShareTicket: false
    })
    let that = this;
    wx.login({
      success: (res) => {
        var code = res.code;
        wx.getStorage({
          key: 'userInfo',
          success: (res) => {
            // 有缓存
            console.log(res);
            app.globalData.userInfo = res.data;
            
            if (res.data.has_phone == 0) {
              if ((app.globalData.openTime % 5) == 0) {
                app.globalData.hasPhone = false;
              } else {
                app.globalData.hasPhone = true;
              }
              this.getIndexInfo();
            } else {
              app.globalData.hasPhone = true;
              this.getIndexInfo();
            }
            that.setData({
              globalData: app.globalData
            })
          },
          fail: () => {
            // 没有缓存，那么去请求
            this.getAUTH(code, this);
          }
        });
      }
    })
  },
  getAUTH: function (code, that) {
    let count = 0;
    auth(code);
    function auth(code) {
      util.ajax(app.globalData.baseURL + 'api/yx/authLogin', {
        code: code,
        version: 'v0.0.1'
      }, (response) => {
        console.log(response)
        if (response.data.code == 11999999) {
          app.globalData.userInfo = response.data.data.list.student_info;
          that.setData({
            globalData: app.globalData
          })
          that.getPhoneNum(app.globalData.userInfo);
          that.getIndexInfo();
          wx.setStorage({
            key: "userInfo",
            data: response.data.data.list.student_info,
          });
        } else {
          if (count > 2) {
            wx.showModal({
              title: '请稍后再试',
              content: '',
              showCancel: false
            })
            return
          }
          auth(code);
          count++;
        }
      }, app, that)
    }
  },
  tap: function () {
    wx.redirectTo({
      url: 'test?id=1'
    })
  },
  goCheck: function () {
    wx.navigateTo({
      url: '../check/check',
    })
  },
  goRank: function () {
    wx.navigateTo({
      url: '../rank/rank',
    })
  },
  onShow: function () {
    this.setData({
      globalData: app.globalData
    });
    // 获取今日作业和直播
    this.setData({
      reqTime: (this.data.reqTime+1)
    })
    if (this.data.reqTime>1){
      this.getIndexInfo();
    }
  },
  todo: function (e) {
    console.log(e.currentTarget.dataset.type)
    if (e.currentTarget.dataset.type == 1) {
      //做题
      wx.navigateTo({
        url: '../doExam/doExam?action=' + e.currentTarget.dataset.action,
      })
    } else if (e.currentTarget.dataset.type == 2) {
      //直播
      util.ajax(app.globalData.baseURL + 'api/yx/startOneWork', {
        student_id: app.globalData.userInfo.student_id,
        action_id: e.currentTarget.dataset.action,
        session_id: app.globalData.userInfo.true_session_id
      }, (res) => {

      })
      wx.navigateTo({
        url: '../live/live?URL=' + e.currentTarget.dataset.liveurl.replace('?', '#$%').replace('=','^#*'),
      })
    } else if (e.currentTarget.dataset.type == 3) {
      //公开课
    } else {
      //其他类型
    }
  },
  getCheckList: function (num) {
    //获取打卡列表
    try {
      util.ajax(app.globalData.baseURL + 'api/yx/getTodayDynamic', {
        student_id: app.globalData.userInfo.student_id,
        activity_id: app.globalData.activityInfo.activity_id,
        page: num,
        is_need_all_num: 'y',
        session_id: app.globalData.userInfo.true_session_id
      }, (res) => {
        if (res.data.code != 11999999) {
          console.log(res.data.message)
        }
        else {
          let arr = res.data.data.list.today_dynamic;
          arr.forEach((value, index) => {
            let d = new Date(value.regdate * 1000);
            let str = util.formulaTime(d);
            value.time = str;
          })
          this.data.checkList=this.data.checkList.concat(arr);
          this.setData({
            checkList: this.data.checkList
          })
        }
      }, app, this)
    } catch (err) {
    }
  },
  getPhoneNum: function (info) {
    //获取用户号码
    if (info.has_phone == 0) {
      if ((app.globalData.openTime - 1)%5==0){
        app.globalData.hasPhone = false;
      }else{
        app.globalData.hasPhone = true;
      }
    } else if (info.has_phone == 1) {
      app.globalData.hasPhone = true;
    }
  },
  getPhoneNumber: function (e) {//获取用户电话
    
    if (e.detail.iv) {
      wx.login({
        success: (res) => {
          var code = res.code;
          // this.getAUTH(code, this);
          util.ajax(app.globalData.baseURL + 'api/yx/upPhone', {
            student_id: app.globalData.userInfo.student_id,
            encrypt_data: e.detail.encryptedData,
            iv: e.detail.iv,
            code: code,
            session_id: app.globalData.userInfo.true_session_id,
          }, (res) => {
            app.globalData.hasPhone = true;
            if(res.data.code==11999999){
              let storageInfo={};
              wx.getStorage({
                key: 'userInfo',
                success: function(res) {
                  storageInfo=res.data;
                  storageInfo.has_phone=1;
                  wx.setStorage({
                    key: 'userInfo',
                    data: storageInfo,
                  })
                },
              })
              
            }
            this.setData({
              globalData: app.globalData
            })
          }, app, this)
        }
      })
    }else{
      app.globalData.hasPhone = true;
      this.setData({
        globalData: app.globalData
      })
    }
  },
  getIndexInfo: function () {
    //获取首页信息
    try {
      util.ajax(app.globalData.baseURL + 'api/yx/xcxIndex', {
        student_id: app.globalData.userInfo.student_id,
        session_id: app.globalData.userInfo.true_session_id
      }, (res) => {
        console.log(res)
        if (res.data.code == 11999999) {
          // 是否打卡
            try{
              app.globalData.isCheckDone = res.data.data.list.sign_info.is_sign;
              // app.globalData.isDone = false;
              app.globalData.activityInfo = res.data.data.list.activity_info[0] || {};
              this.setData({
                nowCheck: res.data.data.list.sign_info.sign_num || 0,
                allCheck: res.data.data.list.activity_info[0].activity_day_num || 0,
                globalData: app.globalData,
                workInfo: res.data.data.list.home_work_list[0].work_info ||[],
                checkList:[]
              })
            }catch(e){
            }
            this.getCheckList(1);
        } else {
          console.log(res);
          wx.showModal({
            title: res.data.message,
            showCancel: false
          })
        }
      }, app, this)
    } catch (err) {
      console.log(err)
    }
  },

  jumpReport: function (e) {
    console.log(e),
      app.globalData.action_id = e.currentTarget.dataset.action;
      if(e.currentTarget.dataset.iscom==1){
        app.globalData.is_complete=1;
      }
    wx.navigateTo({
      url: '../report/report',
    })
  },

  workChange:function(e){
    console.log(e.detail.current);
    this.setData({
      currentInd: e.detail.current
    })
  },
  // onReachBottom:function(){暂时取消分页
  //   this.data.pageIndex=(this.data.pageIndex+1);
  //   this.setData({
  //     pageIndex: this.data.pageIndex
  //   })
  //   this.getCheckList(this.data.pageIndex);
  // }
})

const app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */

  data: {
    hasEmptyGrid: false,
    prevhasEmptyGrid: false,
    nexthasEmptyGrid: false,
    startTime: 0,
    endTime: 0,
    checkDoneList: [//打卡做作业列表
    ]
  },
  onShow:function() {
    wx.hideShareMenu();
    this.setData({
      globalData:app.globalData
    });
    let allList = [], allMonth = [];
    let start = app.globalData.activityInfo.start_date;
    let end = app.globalData.activityInfo.end_date;
    let starty = new Date(start * 1000).getFullYear();
    let startm = new Date(start * 1000).getMonth() + 1;
    // let startm = new Date(2017,10).getMonth() + 1;测试备用
    let endy = new Date(end * 1000).getFullYear();
    // let endy = new Date(2018,1).getFullYear();测试备用
    let endm = new Date(end * 1000).getMonth() + 1;
    // let endm = new Date(2018,1).getMonth() + 1;测试备用
    if (starty < endy) {
      //跨年目前只支持跨一年，不支持跨多年
      let c=0;
      let a = (startm + c);
      for (c = 0; (startm + c)<=12;c++){
        this.calMonthInfo(starty, startm, c, allMonth);
      }
      for(let b=1;b<=endm;b++){
        this.calMonthInfo(endy, 0, b, allMonth);
      }
    } else {
      for (let i = 0; i <= (endm - startm); i++) {
        //计算每月多少空格
        this.calMonthInfo(starty, startm, i, allMonth);
      }
    }
    this.setData({
      startTime: start,
      endTime: end,
      allMonth: allMonth
    })
    let current=0;
    allMonth.forEach((value,index)=>{
      if (value.cur_month == (new Date().getMonth() + 1)){
        current=index;
      }
    })
    util.ajax(app.globalData.baseURL + 'api/yx/calendar', {
      look_type: 'all',
      session_id: app.globalData.userInfo.true_session_id,
      student_id: app.globalData.userInfo.student_id,
      activity_id: app.globalData.activityInfo.activity_id,
    }, (res) => {
      console.log(res);
      if (res.data.code == 11999999) {
        let newArr=[];
        allList = res.data.data.list;
        allList.forEach((value, index) => {//活动天
          let Month=(value.the_date + '').slice(4, 6);
          let day = (value.the_date + '').slice(6,8);
          if (Month.slice(0, 1) == 0) {
            Month = Month.slice(1, 2);
          }
          if(day.slice(0,1)==0){
            day=day.slice(1,2);
          }
          let allM=this.data.allMonth.map((val,ind)=>{//日历每月
            if(val.cur_month==Month){
              let flag = false;
               newArr=(val.days).map((v,i)=>{//日历每天
                if (day == v.day) {
                  flag = true;
                  return Object.assign(value, v);
                }else{
                  return v;
                }
              })
               return Object.assign(val, { days: newArr });
            }else{
              return val;
            }
          })
          // let newArr=Object.assign(this.data.checkDoneList, days);
          this.setData({
            allMonth: allM,
          });
        })
      } else {
        wx.showModal({
          title: '获取日历失败',
          showCancel: false
        })
      }
    })
    const date = new Date();
    let nowDay = date.getDate()
    const cur_year = date.getFullYear();
    const cur_month = date.getMonth() + 1;
    const weeks_ch = ['SUN', 'MON', 'TUE', 'WEN', 'THU', 'FRI', 'SAT'];
    this.calculateEmptyGrids(cur_year, cur_month);
    this.calculateDays(cur_year, cur_month);
    this.setData({
      cur_year,
      cur_month,
      weeks_ch,
      globalData: app.globalData,
      current,
      nowDay
    });
  },
  // 计算每月有多少天
  getThisMonthDays(year, month) {
    return new Date(year, month, 0).getDate();
  },
  // 计算每月第一天是星期几
  getFirstDayOfWeek(year, month) {
    return new Date(Date.UTC(year, month - 1, 1)).getDay();
  },
  // 计算在每月第一天在当月第一周之前的空余的天数
  calculateEmptyGrids(year, month) {
    const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
    let empytGrids = [];
    if (firstDayOfWeek > 0) {
      for (let i = 0; i < firstDayOfWeek; i++) {
        empytGrids.push(i);
      }
      this.setData({
        hasEmptyGrid: true,
        empytGrids
      });
    } else {
      this.setData({
        hasEmptyGrid: false,
        empytGrids: []
      });
    }
  },
  // 渲染日历格子
  calculateDays(year, month) {
    let days = [];
    const thisMonthDays = this.getThisMonthDays(year, month);
    for (let i = 1; i <= thisMonthDays; i++) {
        days.push({
          day: i,
        });
    }
    //将打卡做题数据添加进日历数据中
    let newArr = days.map((value, index) => {
      let flag = false;
      for (let k = 0; k < this.data.checkDoneList.length; k++) {
        if (this.data.checkDoneList[k].day == value.day) {
          flag = true;
          return Object.assign(this.data.checkDoneList[k], value);
        }
      }
      if (!flag) {
        return value;
      }
    })
    // let newArr=Object.assign(this.data.checkDoneList, days);
    this.setData({
      days: newArr,
    });
  },
  calMonthInfo: function (year, month, i, allMonth){
    const firstDayOfWeek = this.getFirstDayOfWeek(year, month + i);
    let empytGrids = [];
    if (firstDayOfWeek > 0) {
      for (let k = 0; k < firstDayOfWeek; k++) {
        empytGrids.push(k);
      }
    }
    //计算多少天
    let days = [];
    const thisMonthDays = this.getThisMonthDays(year, month + i);
    let nowDay = new Date().getDate()
    for (let j = 1; j <= thisMonthDays; j++) {
      //找到今天
      if ((j == nowDay) && (month + i) == (new Date().getMonth + 1)) {
        days.push({
          day: j,
          today: true
        });
      } else {
        days.push({
          day: j,
          today: false
        });
      }
      // 找到今天
    }
    // 计算多少天
    allMonth.push({
      cur_year: year,
      cur_month: month + i,
      days: days,
      empytGrids: empytGrids
    });
  },
  navTo: function (e) {
    switch (e.currentTarget.dataset.type) {
      case 'wrong':
        wx.navigateTo({
          url: '../wrongAndFavo/wrongAndFavo?type=wrong',
        });
        break;
      case 'favo':
        wx.navigateTo({
          url: '../wrongAndFavo/wrongAndFavo?type=favo',
        });
        break;
      case 'work':
        wx.navigateTo({
          url: '../homework/homework',
        })
        break;
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
            if (res.data.code == 11999999) {
              let storageInfo = {};
              wx.getStorage({
                key: 'userInfo',
                success: function (res) {
                  storageInfo = res.data;
                  storageInfo.has_phone = 1;
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
    } else {
      app.globalData.hasPhone = true;
      this.setData({
        globalData: app.globalData
      })
    }
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
  }
})
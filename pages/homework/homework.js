const util=require('../../utils/util.js');
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    workList:[
      {
        day:'11-19',
        schedule:[
          {
            type:1,
            title:'会计',
            isDone:true
          },
          {
            type: 2,
            title: '会计从业',
            isDone: true
          },
          {
            type: 3,
            title: 'acca',
            isDone: false
          }
        ]
      },
      {
        day: '11-18',
        schedule: [
          {
            type: 1,
            title: 'cpa会计',
            isDone: true
          },
          {
            type: 2,
            title: 'usa',
            isDone: false
          }
        ]
      }
    ]
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
    // 获取往期作业的列表
    util.ajax(app.globalData.baseURL+'api/yx/getHomeWork', {
      day_type: 'old',
      student_id: app.globalData.userInfo.student_id,
      activity_id: app.globalData.activityInfo.activity_id,
      session_id: app.globalData.userInfo.true_session_id
    }, (res) => {
      console.log(res)
      let arr = res.data.data.list;
      arr=arr.map((value,index)=>{
        let Month = (value.do_date + '').slice(4, 6);
        let day = (value.do_date + '').slice(6, 8);
        if (Month.slice(0, 1) == 0) {
          Month = Month.slice(1, 2);
        }
        if (day.slice(0, 1) == 0) {
          day = day.slice(1, 2);
        }
        value.month=Month;
        value.day=day;
        return value;
      })
      this.setData({
        workList:arr
      })
    })
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
      wx.navigateTo({
        url: '../live/live',
      })
    } else if (e.currentTarget.dataset.type == 3) {
      //公开课
    } else {
      //其他类型
    }
  },
  jumpReport: function (e) {
    console.log(e),
      app.globalData.action_id = e.currentTarget.dataset.action;
    app.globalData.is_complete = e.currentTarget.dataset.complete;
    if(e.currentTarget.dataset.type==1){//习题
      wx.navigateTo({
        url: '../report/report',
      })
    } else if (e.currentTarget.dataset.type == 2){//直播
    debugger
      wx.navigateTo({
        url: '../live/live?URL=' + e.currentTarget.dataset.liveurl.replace('?', '#$%').replace('=', '^#*'),
      })
    } else if (e.currentTarget.dataset.type == 3){//公开课

    }else{

    }
    
  }
})
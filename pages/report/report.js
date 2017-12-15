let app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    done: 0,
    title: '',
    time: '',
    score: 0,
    aveScore: 0,
    jb: 0,
    rank: 0,
    reportList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let num=getCurrentPages();
    wx.showShareMenu({
      withShareTicket: false
    })
    if (app.globalData.is_complete && app.globalData.is_complete==1){
      util.ajax(app.globalData.baseURL + 'api/yx/doPaperReport', {//如果完成了作业
        //获取报告详情
        student_id: app.globalData.userInfo.student_id,
        action_id: app.globalData.action_id,
        is_handle_token: 'no',
        session_id: app.globalData.userInfo.true_session_id
      }, (res) => {
        console.log(res.data)
        if (res.data.code == 11999999) {
          let info = res.data.data.list.paper_info.report;
          let time = util.formatSeconds(info.takes * 1)
          let reArr = [];
          res.data.data.list.paper_info.paper.paper_data.forEach((value,index)=>{
            value.pdata.forEach((v,i)=>{
              reArr.push(v)
            })
          })
          this.setData({
            done: res.data.data.list.do_paper_status,
            title: info.title,
            time: time,
            score: info.userScore,
            aveScore: info.avgnum,
            jb: info.jb,
            rank: info.pnum,
            reportList: reArr,
          })
          if (app.globalData.paper_data_log_id != res.data.data.list.paper_info.paper.paper_data_log_id){
            app.globalData.hasChangePaperLogId=true;
          }
          app.globalData.paper_data_log_id = res.data.data.list.paper_info.paper.paper_data_log_id;

        } else {
          wx.showModal({
            title: res.data.message,
            showCancel: false,
          })
        }
      })
    }else{
      //如果没完成作业
      util.ajax(app.globalData.baseURL + 'api/yx/startOneWork', {
        student_id: app.globalData.userInfo.student_id,
        action_id: app.globalData.action_id,
        session_id: app.globalData.userInfo.true_session_id
      }, (res) => {
        console.log(res.data);
        if (res.data.code == 11999999) {
          let info = res.data.data.list.paper_info.report;
          let time = util.formatSeconds(info.takes * 1)
          let arr=[];
          res.data.data.list.paper_info.paper.paper_data.forEach((value,index)=>{
            value.pdata.forEach((v,i)=>{
              arr.push(v);
            })
          })
          this.setData({
            done: res.data.data.list.do_paper_status,
            title: info.title,
            time: time,
            score: info.userScore,
            aveScore: info.avgnum,
            jb: info.jb,
            rank: info.pnum,
            reportList: arr,
          })
          if (app.globalData.paper_data_log_id != res.data.data.list.paper_info.paper.paper_data_log_id){
            app.globalData.hasChangePaperLogId = true;
          }
          app.globalData.paper_data_log_id = res.data.data.list.paper_info.paper.paper_data_log_id;

        } else {
          wx.showModal({
            title: res.data.message,
            showCancel: false,
          })
        }
      })
    }
    
    
    let arr = app.globalData.examList;
    let zanArr = arr.map((value, index) => {
      if (this.data.reportList.length==0){
        return value;
      }
      for (let i = 0; i < this.data.reportList.length; i++) {
        if (this.data.reportList[i].id == value.id) {
          return Object.assign(this.data.reportList[i], value);
        }
      }
    })
    app.globalData.examList = zanArr;
  },





  jumpItem: function (e) {
    wx.navigateTo({
      url: '../doExam/doExam?fromReport=1&index=' + e.currentTarget.dataset.ans,
    })
  }
})
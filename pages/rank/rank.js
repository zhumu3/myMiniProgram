const app=getApp();
const util=require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isCheck:true,
    globalData:app.globalData,
    isCheckToday:true,
    isHomeworkToday:true,
    myCheckToday:null,
    myCheckAll:null,
    myHomeToday:null,
    myHomeAll:null,
    checkListAll: [],
    homeworkList: [
    ],
    homeworkListAll: [
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCheckList('today');
    wx.hideShareMenu()
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
  check:function(e){
    console.log(e)
    if(e.currentTarget.dataset.title=='check'){
      // 打卡排行
      this.setData({
        isCheck: true,
        isCheckToday:true
      })
      this.getCheckList('today');
    }else{
      //作业排行
      this.setData({
        isCheck: false,
        isHomeworkToday:true
      })
      this.gethmList('today');
    }
  },
  checkToday:function(e){
    if(e.currentTarget.dataset.head=='today'){
      this.getCheckList('today');
      this.setData({
        isCheckToday: true
      }) 
    }else{
      //获取总榜打卡排行
      this.getCheckList('all');

      this.setData({
        isCheckToday: false
      })
    }
  },
    homeworkToday:function(e){
      if(e.currentTarget.dataset.head == 'today'){
        this.setData({
          isHomeworkToday: true
        })
        this.gethmList('today');
      }else{
        this.setData({
          isHomeworkToday: false
        })
        this.gethmList('all');
      }
    },
    getCheckList:function(type){
      //获取今日打卡排行
      util.ajax(app.globalData.baseURL+'api/yx/clockInRank', {
        flag: type,
        activity_id: app.globalData.activityInfo.activity_id,
        student_id: app.globalData.userInfo.student_id,
        is_handle_token: 'no',
        session_id: app.globalData.userInfo.true_session_id
      }, (res) => {
        if (res.data.code == 11999999) {
          if(type=='today'){
            //今天的打卡
            let arr = [], mine = null;
            try {
              arr = res.data.data.list.rank_list;
            } catch (err) {
              arr = [];
            }
            arr.forEach((value, index) => {
              let d = new Date(value.regdate * 1000);
              let str = util.formulaTime(d);
              value.time = str;
            })
            try {
              let d = new Date(res.data.data.list.myself.regdate * 1000)
              let checkTime = util.formulaTime(d);
              mine = res.data.data.list.myself;
              mine.checkTime = checkTime;
            } catch (err) {
              mine = null
            }
            this.setData({
              checkList: arr,
              myCheckToday: mine
            })
          }else if(type=='all'){
            // 打卡总榜
            try {
              if (res.data.code == 11999999) {
                this.setData({
                  checkListAll: res.data.data.list.rank_list,
                  myCheckAll: res.data.data.list.myself
                })
              }
            }
            catch (err) {
              console.log(err);
            }
          }
        } else {
          console.log(res.data.message)
        }
      })
    },
    gethmList:function(type){
      // 获取作业排行
      util.ajax(app.globalData.baseURL +'api/yx/hmRank',{
        flag: type,
        activity_id: app.globalData.activityInfo.activity_id,
        student_id: app.globalData.userInfo.student_id,
        is_handle_token: 'no',
        session_id: app.globalData.userInfo.true_session_id
      },(res)=>{
        console.log(res,type);
        if(res.data.code==11999999){
          if (type == 'today') {
            this.setData({
              homeworkList: res.data.data.list.rank_list,
              myHomeToday: res.data.data.list.myself
            })
          } else if (type == 'all') {
            this.setData({
              homeworkListAll: res.data.data.list.rank_list,
              myHomeAll: res.data.data.list.myself
            })
          }
        }else{
          console.log(res.data.message);
        }
      })
    }
})
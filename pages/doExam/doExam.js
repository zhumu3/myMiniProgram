let timer = null;
let app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isCardShow: false,//答题卡显示
    doTime: 0,//做题时间
    isOrder: true,//答题卡排序
    nowIndex: 0,//现在的index
    isFromReport: false,
    isFromWroFav: false,
    examList: [],//最终显示的列表
    orderList: [],//按顺序的列表
    clientHeight: null,
    typeListSon1: [],//按题型的列表（单选）
    typeListSon2: []//按题型的列表（多选）
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options: options
    })
    wx.hideShareMenu()
  },
  onReady: function () {

    // 复制数组
    let that = this;
    // let arr=app.globalData.examList.slice(0)
    // this.setData({
    //   orderList:arr,
    //   examList:arr
    // });
    // 获取参数
    console.log(this.data.options);
    if (this.data.options && this.data.options.fromReport == 1) {
      // 从报告页、错题、收藏过来
      wx.setNavigationBarTitle({
        title: "试卷解析",
      }) 
      //获取参数
      if (app.globalData.examList.length == 0 || !app.globalData.examList || app.globalData.hasChangePaperLogId){//如果没有全局试卷
        util.ajax(app.globalData.baseURL + 'api/yx/doPaperDetail', {
          // 获取报告试题详情
          student_id: app.globalData.userInfo.student_id,
          paper_data_log_id: app.globalData.paper_data_log_id,
          session_id: app.globalData.userInfo.true_session_id,
          activity_id: app.globalData.activityInfo.activity_id
        }, (res) => {
          let arr = [];
          res.data.data.list.paper.paper_data.forEach((value,index)=>{
            value.pdata.forEach((v,i)=>{
              arr.push(v);
            })
          });
          arr=arr.map((value,index)=>{
            value.title = util.changeOption(value.title);
            value.answerAnalysis = util.changeOption(value.answerAnalysis);
            // 把选项对错放进select中
            let uAns = value.userAnswer, yAns = value.yanswer;
            value.select.forEach((v,i)=>{
              if(value.type==2){//多选
                util.setAnswerToSel(v, uAns, yAns);
              } else if (value.type == 1){//单选
                util.setAnswerToSelOne(v, uAns, yAns)
              }
              v.item_option = util.changeOption(v.item_option);
            })
            return value
          })
          app.globalData.examList =arr ;
          this.setData({
            isFromReport: true,
            isFromWroFav: false,
            nowIndex: this.data.options.index,
            examList: app.globalData.examList,
            orderList: app.globalData.examList,
            isSubmit:true
          })
          app.globalData.hasChangePaperLogId=false;
        },app,that)
      }else{//有全局试卷的话
        this.setData({
          isFromReport: true,
          isFromWroFav: false,
          nowIndex: this.data.options.index,
          examList: app.globalData.examList,
          orderList: app.globalData.examList,
          isSubmit: true
        })
      }
    } else if (this.data.options && this.data.options.fromReport == 2) {
      //从错题、收藏过来
      wx.setNavigationBarTitle({
        title: "题目解析",
      }) 
      this.setData({
        isFromReport: true,
        isFromWroFav: true,
        nowIndex: this.data.options.index,
        examList: app.globalData.examListOne,
        orderList: app.globalData.examListOne,
        isSubmit:true
      })
    } else {
      // 不是从报告页不是从错题、收藏进来的
      util.ajax(app.globalData.baseURL + 'api/yx/startOneWork', {
        student_id: app.globalData.userInfo.student_id,
        action_id: this.data.options.action,
        session_id: app.globalData.userInfo.true_session_id
      }, (res) => {
        if (res.data.code == 11999999) {
          console.log(res)
          if (app.globalData.paper_data_log_id != res.data.data.list.paper_info.paper.paper_data_log_id){
            app.globalData.hasChangePaperLogId = true;
          }
          app.globalData.paper_data_log_id=res.data.data.list.paper_info.paper.paper_data_log_id;
          //获取所有非本次paperlogid的缓存
          // wx.getStorageInfo({
          //   success: (res)=> {
          //     console.log(res.keys)
          //     res.keys.forEach((value,index)=>{
          //       if (value.indexOf('plid') != (-1) && value.indexOf(this.data.paper_data_log_id)==(-1)){
          //         wx.removeStorageSync(value);
          //       }
          //     })
          //   }
          // })
          //获取所有非本次paperlogid的缓存
          //获取所有缓存
            let allArr=[], ansArr ;
            let userAns = wx.getStorageSync('userAns' + 'plid' + res.data.data.list.paper_info.paper.paper_data_log_id);
            if (userAns != 'NAN' && userAns) {//如果能取到缓存
              allArr = wx.getStorageSync('allArr' + 'plid' + res.data.data.list.paper_info.paper.paper_data_log_id)[0]
              ansArr = wx.getStorageSync('userAns' + 'plid' + res.data.data.list.paper_info.paper.paper_data_log_id)
              console.log('allArr,ansArr', allArr, ansArr);
            } else {//取不到缓存的话
               allArr = [];
              res.data.data.list.paper_info.paper.paper_data.forEach((value, index) => {
                value.pdata.forEach((v, i) => {
                  //去掉题目的题干和选项的标签
                  v.title = util.changeOption(v.title);
                  v.select.forEach((val, ind) => {
                    val.item_option = util.changeOption(val.item_option);
                  })
                  allArr.push(v);
                })
              })
              let arr2 =allArr;
              ansArr = {};
              arr2.forEach((value, index) => {
                ansArr[value.ExamID] = ''
              })
            }
          

          //得到本地缓存的做题时间
          let runTime, doTime;
          try {
            var timeValue = wx.getStorageSync('doTime' + 'plid' + res.data.data.list.paper_info.paper.paper_data_log_id)
            if (timeValue != 'NAN' && timeValue) {
              doTime = timeValue;
              runTime = res.data.data.list.paper_info.paper.runtime - doTime;
            } else {
              runTime = res.data.data.list.paper_info.paper.runtime;
              doTime = 0;
            }
          } catch (e) {
            runTime = res.data.data.list.paper_info.paper.runtime;
            doTime = 0;
          }
          this.setData({
            examList: allArr,//考试列表
            orderList: allArr,//按顺序的列表
            ansArr,//答案列表
            option_id: this.data.options.action,//actionid
            regdate: res.data.data.list.paper_info.paper.regdate,
            runTime: runTime, //倒计时,
            doTime: doTime,
            paper_id: res.data.data.list.paper_info.paper.paper_id,  //试卷id
            paper_data_log_id: res.data.data.list.paper_info.paper.paper_data_log_id,//paperlogid
            subject_id: res.data.data.list.paper_info.paper.subject_id,  //科目id
            project_id: res.data.data.list.paper_info.paper.project_id  //项目id
          })
          app.globalData.action_id = this.data.options.action;//actionid
          // 设置倒计时
          timer = setInterval(() => {
            this.data.doTime++;
            this.data.runTime--;
            this.data.runTimef = util.formatSeconds(this.data.runTime);
            if (this.data.runTime < 0) {
              wx.showModal({
                title: '时间到啦',
                content: '',
                showCancel: false
              })
              this.submit();
            }
            this.setData({
              runTime: this.data.runTime,
              runTimef: this.data.runTimef,
              doTime: this.data.doTime
            })
          }, 1000)
          //设置倒计时
        } else {
          console.log('获取试卷信息失败')
        }
      },app,that)
    }
    // 获取窗口高度
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          clientHeight: res.windowHeight
        });
      }
    })
  },
  onUnload: function (e) {
    // 页面卸载
    if(!this.data.isSubmit){//如果没交卷退出
      wx.showModal({
        title: '确定交卷吗',
        success: (res) => {
          if (res.confirm) {
            this.submit('noClick');
          } else if (res.cancel) {
            console.log('用户点击取消')
            try {
              wx.setStorageSync('userAns' + 'plid' + this.data.paper_data_log_id, this.data.ansArr)
              wx.setStorageSync('allArr' + 'plid' + this.data.paper_data_log_id, { 0: this.data.orderList })
              wx.setStorageSync('doTime' + 'plid' + this.data.paper_data_log_id, this.data.doTime)
            } catch (e) {
            }
          }
        }
      })
    }else{//如果交卷了退出
    }
    //将做题时间缓存起来
  },
  showCard: function () {
    this.setData({
      isCardShow: true
    })
  },
  hideCard: function () {
    this.setData({
      isCardShow: false
    })
  },
  order: function (e) {
    if (e.currentTarget.dataset.title == 'or') {
      // 按顺序
      this.setData({
        isOrder: true
      })
      this.setData({
        examList: this.data.orderList
      })
    } else {
      // 按题型
      this.setData({
        isOrder: false
      })
      let [arr1, arr2, arrAll] = [[], [], []];
      this.data.examList.forEach((value, index) => {
        if (value.type == 1) {
          arr1.push(value);
        } else if (value.type == 2) {
          arr2.push(value);
        }
      })
      arrAll = arr1.concat(arr2);
      this.setData({
        typeListSon1: arr1,
        typeListSon2: arr2,
        examList: arrAll
      })
    }
  },
  // 做题保存答案
  saveItem: function (e) {
    // 单选
    let nowItem = this.data.examList[this.data.nowIndex];
    let nowInd = this.data.nowIndex;
    //单选题
    nowItem.select.forEach((value, index) => {
      value.selected = false;
    })
    // 题目里的选项样式显示
    nowItem.select[e.currentTarget.dataset.ans].selected = true;
    nowItem.isDone=true;
    if (this.data.nowIndex >= this.data.examList.length - 1) {
      wx.showToast({
        title: '最后一题啦',
        icon: 'success',
        duration: 2000,
        mask: true
      })
    } else {
      nowInd++;
    }
    let Uans = '';
    switch (e.currentTarget.dataset.ans) {
      case 0:
        Uans = 'A';
        break;
      case 1:
        Uans = 'B';
        break;
      case 2:
        Uans = 'C';
        break;
      case 3:
        Uans = 'D';
        break;
      case 4:
        Uans = 'E';
        break;
      case 5:
        Uans = 'F';
        break;
      case 6:
        Uans = 'G';
        break;
      case 8:
        Uans = 'H';
        break;
    }
    // 将本题答案放到答案列表中
    this.data.ansArr[nowItem.ExamID] = Uans;
    this.setData({
      nowIndex: nowInd,
      examList: this.data.examList,
      orderList: this.data.examList,
      ansArr: this.data.ansArr
    })
    console.log(e);
  },
  CheckBox: function (e) {
    //多选
    let nowItem = this.data.examList[this.data.nowIndex];
    let nowInd = this.data.nowIndex;
    // nowItem.select[e.currentTarget.dataset.ans].selected = !nowItem.select[e.currentTarget.dataset.ans].selected;

    if (!nowItem.select[e.currentTarget.dataset.ans].selected) {
      // 如果当前的选项为假
      nowItem.select[e.currentTarget.dataset.ans].selected = true;
    } else {
      // 否则全部为真
      nowItem.select[e.currentTarget.dataset.ans].selected = false;;
    }
    this.setData({
      examList: this.data.examList,
      orderList: this.data.examList,
    })
  },
  saveCheckBox: function () {
    //保存多选题答案
    let nowItem = this.data.examList[this.data.nowIndex];
    let typeListSon2Item = this.data.typeListSon2[this.data.nowIndex - this.data.typeListSon2.length]||[]
    let nowInd = this.data.nowIndex;
    let ans = [];
    nowItem.select.forEach((value, index) => {
      if (value.selected) {
        ans.push(value.option);
      }
    })
    if(ans.length==0){
      nowItem.isDone=false
      typeListSon2Item.isDone=false;
    }else{
      nowItem.isDone = true;
      typeListSon2Item.isDone=true;
    }
    ans = ans.join(',');
    this.data.ansArr[nowItem.ExamID] = ans;
    if (this.data.nowIndex >= this.data.examList.length - 1) {
      wx.showToast({
        title: '最后一题啦',
        icon: 'success',
        duration: 2000,
        mask: true
      })
    } else {
      nowInd++;
    }
    this.setData({
      nowIndex: nowInd,
      ansArr: this.data.ansArr,
      examList: this.data.examList,
      orderList: this.data.examList,
      typeListSon2: this.data.typeListSon2
    })
  },
  jumpItem: function (e) {
    console.log(e.currentTarget)
    this.setData({
      nowIndex: e.currentTarget.dataset.ans - 1
    });
    this.hideCard();
  },
  submit: function (mes) {
    //交卷
    let clickBtn=true;
    this.setData({
      isSubmit:true,
    })
    //清除倒计时;
    clearInterval(timer);
    //清除缓存做题时间
    wx.removeStorage({
      key: 'doTime' + 'plid' + this.data.paper_data_log_id,
      success: function (res) {
        console.log(res.data)
      }
    })
    //清除用户做题信息
    wx.removeStorage({
      key: 'userAns' + 'plid' + this.data.paper_data_log_id,
      success: function (res) {
        console.log(res.data)
      }
    })
    //清除用户的当前做题列表
    wx.removeStorage({
      key: 'allArr' + 'plid' + this.data.paper_data_log_id,
      success: function (res) {
        console.log(res.data)
      }
    })
    let that = this;
    let ansStr = JSON.stringify(this.data.ansArr)
    util.ajax(app.globalData.baseURL + 'api/yx/endOneWork', {
      student_id: app.globalData.userInfo.student_id,
      action_id: that.data.option_id,
      session_id: app.globalData.userInfo.true_session_id,
      regdate: that.data.regdate,
      rt: this.data.doTime,
      ua_list: ansStr
    }, (res) => {
      console.log(res);
      if (res.data.code == 11999999) {
        app.globalData.is_complete=1;
        if (mes =='noClick'){
          wx.navigateTo({
            url: '../report/report',
          })
        } else {
          wx.redirectTo({
            url: '../report/report',
          })
        }
      } else {
        wx.showModal({
          title: '交卷失败',
          showCancel: false
        })
      }
    })

  },
  favo: function () {
    //请求后台接口来收藏习题
    if (this.data.isOrder) {//如果是按顺序的
      let arr = this.data.orderList;
      arr[this.data.nowIndex].favorite = arr[this.data.nowIndex].favorite==2?'1':'2';
      let id = (this.data.isFromWroFav ? arr[this.data.nowIndex].item_id:arr[this.data.nowIndex].ExamID);
      let status = arr[this.data.nowIndex].favorite ;
      let item_type = arr[this.data.nowIndex].type;
      this.sendFavoInfo(id, status, item_type);
      this.setData({
        orderList: arr,
        examList: arr
      })
      app.globalData.examList=arr;
      app.globalData.examListOne=arr;
    } else {
      let [arr1, arr2, arrAll] = [this.data.typeListSon1, this.data.typeListSon2, []]
      if (this.data.nowIndex < this.data.typeListSon1.length) {//单选题
        arr1[this.data.nowIndex].favorite = arr1[this.data.nowIndex].favorite==2?'1':'2';
      } else {//多选题
        let length = arr1.length;
        arr2[this.data.nowIndex - length].favorite = arr2[this.data.nowIndex - length].favorite==2?'1':'2';
      }
      arrAll = arr1.concat(arr2);
      this.setData({
        typeListSon1: arr1,
        typeListSon2: arr2,
        examList: arrAll
      })
      let id = this.data.examList[this.data.nowIndex].ExamID;
      let status = this.data.examList[this.data.nowIndex].favorite ;
      let item_type = this.data.examList[this.data.nowIndex].type;
      this.sendFavoInfo(id, status, item_type);
    }
  },
  sendFavoInfo: function (id, status, item_type) {
    //id题目id  status => 1取消2收藏   item_type =>1单选2多选
    util.ajax(app.globalData.baseURL + 'api/yx/collect', {
      student_id: app.globalData.userInfo.student_id,
      activity_id: app.globalData.activityInfo.activity_id,
      session_id: app.globalData.userInfo.true_session_id,
      favorite_id: id||app.globalData.item_id,
      project_id: this.data.project_id || app.globalData.activityInfo.project_id,
      paper_id: this.data.paper_id || 0,
      subject_id: this.data.subject_id || app.globalData.activityInfo.subject_id,
      item_type: item_type,
      status: status,
    }, (res) => {
      if (res.data.code != 11999999) {
        console.log(res.data.message);
      }else{
        wx.showToast({
          title: status == 2 ? '收藏成功' : status == 1 ? '取消收藏成功' : '',
        })
      }
    })
  },

  swiperChange: function (e) {
    console.log(e);
    this.setData({
      nowIndex: e.detail.current
    })
  }
})
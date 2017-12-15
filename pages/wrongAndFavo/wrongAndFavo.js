const util=require('../../utils/util.js');
let app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type:'single',
    WSindex:1,
    WMindex:1,
    FSindex:1,
    FMindex:1,
    wrongSingleArr:[],
    wrongMultiArr:[],
    favoSingleArr:[],
    favoMultiArr:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
      if(options.type=='wrong'){
        wx.setNavigationBarTitle({ title: '我的错题' })
        this.setData({
          myType:'wrong'
        })
        this.getWrongList(1,1);
      }
      else if (options.type == 'favo'){
        wx.setNavigationBarTitle({ title: '我的收藏' })
        this.setData({
          myType: 'favo'
        })
        this.getFavoList(1,1);
      }
  },
  onReachBottom: function () {
    //到底增加列表
    console.log(1111,2)
    if (this.data.myType=='wrong'){
      if (this.data.type == 'single'){//错题单选
        this.data.WSindex++;
        this.setData({
          WSindex: this.data.WSindex
        })
        this.getWrongList(1, this.data.WSindex);
      } else if (this.data.type == 'multi'){//错题多选
        this.data.WMindex++;
        this.setData({
          WMindex: this.data.WMindex
        })
        this.getWrongList(2, this.data.WMindex);
      }
    } else if (this.data.myType == 'favo'){
      if (this.data.type == 'single') {//收藏单选
        this.data.FSindex++;
        this.setData({
          FSindex: this.data.FSindex
        })
        this.getFavoList(1, this.data.FSindex);
      } else if (this.data.type == 'multi') {//收藏多选
        this.data.FMindex++;
        this.setData({
          FMindex: this.data.FMindex
        })
        this.getWrongList(2, this.data.FMindex);
      }
    }
  },
  selectType: function (e) {
    if (e.currentTarget.dataset.head == 'single') {
      this.setData({
        'type': 'single'
      })
      if(this.data.myType=='wrong'){
        this.setData({
          wrongSingleArr:[],
          WSindex:1
        })
        this.getWrongList(1,1);
      }else if(this.data.myType=='favo'){
        this.setData({
          favoSingleArr: [],
          FSindex:1
        })
        this.getFavoList(1,1);
      }
    } else {
      this.setData({
        'type': 'multi'
      })
      if (this.data.myType == 'wrong') {
        this.setData({
          wrongMultiArr: [],
          WMindex:1
        })
        this.getWrongList(2, 1);
      } else if (this.data.myType == 'favo') {
        this.setData({
          favoMultiArr: [],
          FMindex:1
        })
        this.getFavoList(2,1);
      }
    }
  },
  getWrongList: function (type, pageNum){
    // 获取错误题目列表
    //type 1为单选  2为多选

    
    util.ajax(app.globalData.baseURL +'api/yx/wrongList',{
      student_id: app.globalData.userInfo.student_id,
      activity_id: app.globalData.activityInfo.activity_id,
      session_id: app.globalData.userInfo.true_session_id,
      item_type: type,
      page:pageNum,
    },(res)=>{
      if(res.data.code==11999999){
        let arr = res.data.data.list;
        arr.forEach((value,index)=>{
          value.title=util.changeOption(value.title);
        })
        if (type == 1) {
          this.data.wrongSingleArr=this.data.wrongSingleArr.concat(arr);
          this.setData({
            wrongSingleArr:this.data.wrongSingleArr
          })
        } else if (type == 2) {
          this.data.wrongMultiArr = this.data.wrongMultiArr.concat(arr);
          this.setData({
            wrongMultiArr:this.data.wrongMultiArr
          })
        }
      }else{
        wx.showToast({
          title: res.data.message,
          icon: 'loading',
          duration:1000
        })
      }
    })
  },
  getFavoList: function (type, pageNum) {
    // 获取收藏题目列表
    //type 1为单选  2为多选
   
    util.ajax(app.globalData.baseURL + 'api/yx/collectList', {
      student_id: app.globalData.userInfo.student_id,
      activity_id: app.globalData.activityInfo.activity_id,
      session_id: app.globalData.userInfo.true_session_id,
      item_type: type,
      page: pageNum,
    }, (res) => {
      if (res.data.code == 11999999) {
        let arr = res.data.data.list;
        arr.forEach((value, index) => {
          value.title = util.changeOption(value.title);
        })
        if (type == 1) {
          this.data.favoSingleArr = this.data.favoSingleArr.concat(arr);
          this.setData({
            favoSingleArr: this.data.favoSingleArr
          })
        } else if (type == 2) {
         this.data.favoMultiArr = this.data.favoMultiArr.concat(arr);
          this.setData({
            favoMultiArr: this.data.favoMultiArr
          })
        }
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'loading'
        })
      }
    })
  },
  jumpItem:function(e){
    app.globalData.item_id = e.currentTarget.dataset.id;
    let type=e.currentTarget.dataset.type
    util.ajax(app.globalData.baseURL +'api/yx/itemDetail',{
      student_id: app.globalData.userInfo.student_id,
      session_id: app.globalData.userInfo.true_session_id,
      item_id:e.currentTarget.dataset.id,
      activity_id: app.globalData.activityInfo.activity_id,
    },(res)=>{
      console.log(res);
      if(res.data.code==11999999){
        let arr=[],obj={};
        obj = res.data.data.list;
        obj.title = util.changeOption(obj.title);
        obj.analysis = util.changeOption(obj.analysis);
        obj.yanswer=obj.answer;
        obj.select.forEach((value,idex)=>{
          value.item_option = util.changeOption(value.item_option);
        })
        arr.push(obj);
        app.globalData.examListOne=arr;
        wx.navigateTo({
          url: '../doExam/doExam?fromReport=2&index=0&type=' + type,
        })
      }
    })
  },
  
})
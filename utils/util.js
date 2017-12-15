import { html2json } from './html2wxml/src/html2json';
let app =getApp();
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const ajax = (url, data, sucCal, app,that) => {
  wx.showLoading({
    title: '',
    mask: true
  })
  wx.request({
    url: url, //仅为示例，并非真实的接口地址
    method: 'POST',
    data: data,
    header: {
      'content-type': 'application/x-www-form-urlencoded' // 默认值
    },
    success: (res) => {
      wx.hideLoading();
      if (res.data.code == 11020001) {//接口调用失败
        wx.showModal({
          title: '接口调用失败',
          content: '',
          showCancel: false
        })
      } else if (res.data.code == 11020002 || res.data.code == 11020003||res.data.code == 11020004) {//用户没登录或者登陆过期
        wx.login({
          success: function (res) {
            let code = res.code;
            getUserInfo(code, app, that);
          }
        })  
      } else if (res.data.code == 11020011){//用户没参加活动
        wx.showModal({
          title: '用户没参加活动',
          content: '',
          showCancel:false,
          success:(res)=>{
            if (res.confirm) {
              wx.navigateTo({
                url: '../auth/auth',
              })
            }
          }
        })
      } else if (res.data.code ==11020014){//用户没绑定服务号
        wx.showModal({
          title: '用户没绑定服务号',
          content: '',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              wx.redirectTo({
                url: '../auth/auth',
              })
            }
          }
        })
      }else {
        sucCal(res)
      }
    }
  })
}

const formulaTime = (d) => {
  return (d.getFullYear()) + "-" +
    (d.getMonth() + 1) + "-" +
    (d.getDate()) + " " +
    (d.getHours() < 10 ? '0' + d.getHours() : d.getHours()) + ":" +
    (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes());
}

const getUserInfo = (code, app,that)=>{
  let count=0;
  const getUI =(code2, app2, that2)=>{
    ajax(app2.globalData.baseURL + 'api/yx/authLogin', {
      code: code2,
      version:'v0.0.1'
    }, (response) => {
      if (response.data.code == 11999999) {
        app2.globalData.userInfo = response.data.data.list.student_info;
        that2.setData({
          globalData: app2.globalData
        })
        wx.setStorage({
          key: "userInfo",
          data: response.data.data.list.student_info,
        });
        that2.getIndexInfo();
      } else {
        if (count > 2) {
          wx.showModal({
            title: '请稍后再试',
            content: '',
            showCancel: true
          })
          return
        }
        getUI(code, app, that);
        count++;
      }
    })
  }
  getUI(code, app, that);  
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formatSeconds = (a) => {
  var hh = parseInt(a / 3600);
  if (hh < 10) hh = "0" + hh;
  var mm = parseInt((a - hh * 3600) / 60);
  if (mm < 10) mm = "0" + mm;
  var ss = parseInt((a - hh * 3600) % 60);
  if (ss < 10) ss = "0" + ss;
  var length = hh + ":" + mm + ":" + ss;
  if (a > 0) {
    return length;
  } else {
    return "NaN";
  }
}

const changeOption = (str) => {
  str = str.replace(/<(?!img|br|p).*?>/g, "");//去掉所有的html标记
  str = str.replace(/&nbsp;/g, "");
  str = str.replace(/<(p).*?>/g, "<br/>");
  var option = html2json(str).child;
  var arr = [];
  option.forEach(item => {
    if (item.node == "text") {
      arr.push(item.text);
    }
  });
  let okStr = '';
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    okStr += arr[i];
  }
  return okStr;
}

const setAnswerToSel=(v, Uans, Yans)=> {
    // v=>每一个select,Uans是用户答案，Yans是正确答案
    if ((Uans.indexOf(v.option) != -1) && (Yans.indexOf(v.option) == -1)) {//如果Uans选，但是Yans没选
      v.showTrue = false;
      v.showWrong = true;
    } else if ((Uans.indexOf(v.option) != -1) && (Yans.indexOf(v.option) != -1)) {//如果Uans、Yans选
      v.showTrue = true;
      v.showWrong = false;
    } else if ((Uans.indexOf(v.option) == -1) && (Yans.indexOf(v.option) != -1)) {//如果Yans选，但是Uans没选
      v.showTrue = true;
      v.showWrong = false;
    } else {
      v.showTrue = false;
      v.showWrong = false;
    }
  }

const setAnswerToSelOne = (v, Uans, Yans) => {
  // v=>每一个select,Uans是用户答案，Yans是正确答案
  if ((Uans.indexOf(v.option) != -1) && (Yans.indexOf(v.option) == -1)) {//如果Uans选，但是Yans没选
    v.showTrue = false;
    v.showWrong = true;
  } else if ((Uans.indexOf(v.option) != -1) && (Yans.indexOf(v.option) != -1)) {//如果Uans、Yans选
    v.showTrue = true;
    v.showWrong = false;
  } else if ((Uans.indexOf(v.option) == -1) && (Yans.indexOf(v.option) != -1)) {//如果Uans没选、Yans选
    v.showTrue = true;
    v.showWrong = false;
  } 
}

module.exports = {
  formatTime: formatTime,
  ajax: ajax,
  formulaTime: formulaTime,
  formatSeconds: formatSeconds,
  changeOption: changeOption,
  setAnswerToSel: setAnswerToSel,
  setAnswerToSelOne: setAnswerToSelOne
}

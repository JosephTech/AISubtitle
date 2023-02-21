// pages/progress/progress.ts
import api from "../index/index"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    progress_txt: "服务器解码中...",
    current_progress: 0,
    key: "",
    ass_url: "",
    video_url: "",      
    ass_name: "",
    video_name: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    var key = this.options.key;
    this.setData({
      key: key
    });
    // wx.showLoading({
    //   title: "请等待解码完成...",
    //   mask: true
    // })
    console.log("接收到的key是", key)
    this.update(0);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.drawProgressbg();
    //this.drawCircle(2);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    wx.hideHomeButton()
    this.showIntroTitle()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  showIntroTitle(){
    const query = wx.createSelectorQuery();
    query.select("#canvas-3")
      .fields({node: true, size: true}).exec((res)=>{
        const canvas = res[0].node;
        //canvas.width = 220;
        //canvas.height = 220;
        console.log("画布宽", canvas.width)
        console.log("画布高", canvas.height)
        const context = canvas.getContext("2d");
        // const dpr = wx.getWindowInfo().pixelRatio;
        // canvas.width *= dpr;
        // canvas.height *= dpr;
        // console.log("画布宽", canvas.width)
        // console.log("画布高", canvas.height)
        // context.scale(dpr, dpr);

        context.font = "50px sans-serif"
        context.strokeStyle = "#b8a1cf";
        context.textAlign = "center";
        context.strokeText("AI字幕", 150, 80)
      })
  },
  /**
   * 绘制背景圆环
   */
  drawProgressbg: function(){
    const query = wx.createSelectorQuery();
    query.select("#canvasProgressBg")
      .fields({node: true, size: true})
      .exec((res)=>{
        const canvas = res[0].node;
        // 初始化画布大小
        canvas.width = 220;
        canvas.height = 220;
        const ctx = canvas.getContext('2d');
        let circleObj = {
          ctx: ctx,
          // 圆心
          x: 110,
          y: 110,
          // 半径
          radius: 100,
          // 环宽
          lineWidth: 4,
          color: "#20183b",
          startAngle: Math.PI * 0,
          endAngle: Math.PI * 2
        }
        ctx.beginPath();
        ctx.arc(circleObj.x, circleObj.y, circleObj.radius, circleObj.startAngle, circleObj.endAngle);
        // 曲线宽
        ctx.lineWidth = circleObj.lineWidth;
        // 着色
        ctx.strokeStyle = circleObj.color;
        // 连接处样式
        ctx.lineCap = "round";
        // 着色
        ctx.stroke();
        ctx.closePath();
      })
  },
  /**
   * 绘制彩色圆环
   */
  drawCircle: function(step){
    const query = wx.createSelectorQuery();
    query.select("#canvasProgressBar")
      .fields({node: true, size: true})
      .exec((res)=>{
        const canvas = res[0].node;
        // 初始化画布大小
        canvas.width = 220;
        canvas.height = 220;
        const ctx = canvas.getContext('2d');
        let circleObj = {
          ctx: ctx,
          // 圆心
          x: 110,
          y: 110,
          // 半径
          radius: 100,
          // 环宽
          lineWidth: 10,
          color: "#2661dd",
          startAngle: Math.PI * 0,
          endAngle: Math.PI * 2
        }
        ctx.beginPath();
        ctx.arc(circleObj.x, circleObj.y, circleObj.radius, -Math.PI/2, Math.PI*step - Math.PI/2);
        // 曲线宽
        ctx.lineWidth = circleObj.lineWidth;
        // 着色
        ctx.strokeStyle = circleObj.color;
        // 连接处样式
        ctx.lineCap = "round";
        // 着色
        ctx.stroke();
        ctx.closePath();
    })
  },
  update(){
    let that = this
    console.log("轮询中...");
    console.log("key is ",this.data.key);
    console.log("api is ", api.getprogress);
    let timer = setTimeout(that.update, 5000)
    wx.request({
      url: api.getprogress,
      data:{key: that.data.key},
      method: "GET",
      success: function(res){
        console.log("进度是：", res.data)
        // 如果超时或者进度100%,结束计时器
        // 如果进度100%,结束计时器，获取视频和ass地址，下载视频/下载ass按钮亮
        var current_progress = parseInt(res.data as string);
        console.log("当前进度", current_progress);
        if(current_progress >= 100){
          that.getVideoAss()
          that.drawCircle(current_progress/100 * 2)
          that.setData({
            current_progress: 100
          })
          clearTimeout(timer)
          console.log("结束计时器")
          //wx.hideLoading()
          that.navigateToPlayer()
        }
        else if(current_progress != that.data.current_progress){
          that.drawCircle(current_progress/100 * 2);
          //that.data.pre_progress = current_progress;
          that.setData({
            current_progress: current_progress
          })
        }
        // 如果超时，结束计时器，通知服务器
      },
      fail: function(res){
        clearTimeout(timer)
        console.log("结束计时器")
        //wx.hideLoading()
      }
    })
  },
  getVideoAss(){
    console.log("getVideoAss()被调用")
    let that = this;
    wx.request({
      url: api.getassvideo,
      data: {key: this.data.key},
      method: "GET",
      success: function(res){
        console.log("成功，地址是", res.data)
        var res_arr = (res.data as string).split(' ');
        api.ass_url = res_arr[0];
        api.video_url = res_arr[1];
        console.log("ass url is: ", api.ass_url);
        console.log("video url is:", api.video_url);
        // that.setData({
        //   ass_url: res_arr[0],
        //   video_url: res_arr[1],
        //   ass_name: res_arr[0].split('/').slice(-1)[0],
        //   video_name: res_arr[1].split('/').slice(-1)[0],
        // });
      }
    })
  },
  navigateToPlayer(){
    wx.redirectTo({
      url: "../player/player"
    })
  }
})
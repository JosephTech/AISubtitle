// index.ts
// 获取应用实例
const app = getApp<IAppOption>()
//const app = getApp()

export{api as default,}

var URL =  "http://192.168.2.123:80/"
var api={
  uploadfile: URL + "upload",
  getprogress: URL+"progress",
  getassvideo: URL + "get-ass-video",
  video_url: "",
  ass_url: "",
}

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
    key: "0",
    // video_name: "",
    // ass_name: "",
  },

  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs',
    })
  },
  onLoad() {
    //console.log("onLoad被调用")
    // @ts-ignore
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      })
      // wx.navigateTo({
      //   url: '../progress/progress' + this.data.key
      // });
      // wx.navigateTo({
      //   url: "/pages/player/player" + this.data.key
      // });
    }
  },
   /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    //console.log("index onShow")
    this.showIntroTitle();
    this.showIntro();
  },
  getUserProfile() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e: any) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // testRequest(){
  //   console.log("测试request")
  //   wx.request({
  //     url: 'http://192.168.2.123/upload',
  //     method: 'POST',
  //     data: "what the fuck",
  //     success: function(res){
  //       console.log(res)
  //     }
  //   })
  // },
  showIntroTitle(){
    const query = wx.createSelectorQuery();
    query.select("#canvas-1")
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
  showIntro(){
    const query = wx.createSelectorQuery();
    query.select("#canvas-2")
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

        context.font = "20px Microsoft YaHei";
        context.fillText("Step_1  上传视频", 40, 30)
        context.fillText("Step_2  等待服务器解码", 40, 75)
        context.fillText("Step_3  下载字幕文件", 40, 120)
      })
  },
  onUploadVideoClick(){
    let that = this
    console.log("上传视频方法")
    wx.chooseMedia({
      count: 1,
      MediaType: ["video"],
      sourceType: ['album'],
      sizeType:['compressed'],
      success:function(res){
        // 临时文件路径
        let tempFilePath=res.tempFiles[0].tempFilePath
        // 大小（MB为单位）
        let size = Math.ceil(res.tempFiles[0].size/1024/1024)
        console.log("视频大小"+size)
        // 允许100MB以下视频
        if(size > 100){
            wx.showModal({
              title: "视频文件过大",
              content: "请上传小于100MB的视频",
              confirmColor: "#0bc183",
              confirmText: "朕知道了",
              showCancel: false
            })
            return
            //Toast()
        }
        else{
          console.log("开始上传")
          that.uploadVideo({
            url: api.uploadfile,
            path: tempFilePath,
          })
        }
      }
    })
  },
  uploadVideo: function(data){
    let that = this;
    wx.showLoading({
      title: '上传中',
      mask: true,
    })
    console.log(data.url)
    console.log(data.path)
    console.log("上传视频")
    // 上传视频
    // 需要一个不重复的文件名
    wx.uploadFile({
      url: data.url,
      filePath: data.path,
      name: 'video',
      header:{"Content-Type": "multipart/form-data"},
      success: (res)=>{
        wx.hideLoading();
        console.log(res.statusCode);
        console.log("return key is", res.data);
        that.data.key=res.data;
        //var key = res.data
        //this.update();
        that.navigeToProgress()
      }
    })
  },
  navigeToProgress(){
    console.log("onNextStepClick被调用")
    // wx.navigateTo({
    //   url: "../progress/progress" + this.data.key
    // });
    // important
    wx.redirectTo({
      url: "../progress/progress?key=" + this.data.key
    });
  },
  onGetProgressClick(){
    console.log("onGetProgressClick被调用")
    console.log("key is ",this.data.key)
    wx.request({
      url: api.getprogress,
      data:{key: this.data.key},
      method: "GET",
      success: function(res){
        console.log("进度是：", res.data)
      }
    })
  },

  // onDownloadAssClick(){
  //   console.log("onDownloadAssClick被调用")
  //   var ass_name = this.data.ass_name;
  //   wx.downloadFile({
  //     url: this.data.ass_url,
  //     success: function(res){
  //       if(res.statusCode == 200){
  //         console.log("下载ass字幕文件成功", res.tempFilePath)
  //         const FileSystemManager = wx.getFileSystemManager()
  //         FileSystemManager.saveFile({
  //           tempFilePath: res.tempFilePath,
  //           filePath: wx.env.USER_DATA_PATH + '/' + ass_name,
  //           success: function(res2){
  //             console.log(res2);
  //             console.log(wx.env.USER_DATA_PATH)
  //             if(res2.errMsg == "saveFile:ok"){
  //               wx.showToast({
  //                 title: "文件保存成功",
  //                 icon: "success",
  //                 duration: 2000
  //               })
  //             }
  //             else{
  //               wx.showToast({
  //                 title: "文件下载出错",
  //                 icon: "error",
  //                 duration: 2000
  //               })
  //             }
  //           },
  //           fail(){
  //             wx.showToast({
  //               title: "文件下载出错",
  //               icon: "error",
  //               duration: 2000
  //             })
  //           }
  //         })
  //       }
  //     }
  //   })
  // },
 
})

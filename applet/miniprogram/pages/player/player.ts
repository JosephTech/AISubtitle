// pages/player/player.ts
import api from "../index/index"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    video_url: "",
    ass_url: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log("ass_url is", this.data.ass_url);
    console.log("video_url is", this.data.video_url);
    this.setData({
      video_url: api.video_url,
      ass_url: api.ass_url,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
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

  onDownloadVideoClick(){
    console.log("onDownloadVideoClick被调用");
    wx.showLoading({
      title: "下载中",
    });
    wx.downloadFile({
      url: this.data.video_url,
      success: function(res){
        if(res.statusCode == 200){
          console.log("下载视频成功", res.tempFilePath);
          wx.hideLoading();
          wx.saveVideoToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function(res2){
              console.log(res2.errMsg);
            }
          });
        }
      },
      fail: function(){
        wx.hideLoading();
        console.log("下载视频失败")
      }
    });
  },
  onDownloadAssClick(){
    console.log("onDownloadAssClick被调用");
    // 获取文件名，后缀替换为[.jpg]
    var ass_name = this.data.ass_url.split('/').slice(-1)[0]
    ass_name = ass_name.replace(".ass",".jpg");
    wx.downloadFile({
      url: this.data.ass_url,
      filePath: wx.env.USER_DATA_PATH+'/'+ ass_name,
      success: function(res){
        if(res.statusCode == 200){
          wx.saveImageToPhotosAlbum({
            filePath: res.filePath,
            success: function(res2){
              wx.showModal({
                title: "字幕文件已保存到手机相册",
                content: "位于tencent/MicroMsg/WeiXin下 \r\n将保存的[.jpg]文件重命名为[文件名.ass]即可",
                confirmColor: "#0bc183",
                confirmText: "朕知道了",
                showCancel: false
              })
            }
          });
          //res.tempFilePath = res.tempFilePath.replace(".ass",".doc")
          //console.log("下载ass字幕文件成功", res.tempFilePath);
          //let fs = wx.getFileSystemManager();
          //let result = fs.readFileSync(res.filePath, "utf-8")
          //console.log("result txt文本", result)
          // wx.openDocument({
          //   filePath: res.tempFilePath,
          //   showMenu: true,   // 右上角转发按钮
          //   fileType: "doc",
          //   success: function(res2){
          //     console.log("打开文档成功");
          //   }
          // });
        }
      }
    });
  },
})
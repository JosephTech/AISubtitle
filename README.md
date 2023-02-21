# 云端AI字幕小程序 

## 介绍
1. 基于Flask轻量级Web框架和WeNet语音识别引擎，实现了云端AI字幕功能。用户上传视频文件，即可在云端完成语音识别、ass字幕文件生成、字幕添加等功能。而后用户可从腾讯云对象存储COS获取视频文件和字幕文件。
2. 提供微信小程序demo,用户可监视云端解码进度。

## 演示
第一部分
![ai_caption_demo_1](https://github.com/JosephTech/AISubtitle/blob/master/images/ai_caption_demo_1.gif)

第二部分
![ai_caption_demo_2](https://github.com/JosephTech/AISubtitle/blob/master/images/ai_caption_demo_2.gif)

## 模型下载
[预训练模型](https://github.com/wenet-e2e/wenet/blob/main/docs/pretrained_models.md)

[vad](https://github.com/snakers4/silero-vad/tree/master/files)

## 腾讯云对象存储COS配置

![cos](https://github.com/JosephTech/AISubtitle/blob/master/images/cos.bmp)

## 依赖
```
dependency: 
    flask 
    ffmpeg     
    torch  
    torchaudio  
    pydub 
    uuid 
```

## TODOs
1. 配置文件
2. requirements.txt
3. 优化性能，重构代码
    

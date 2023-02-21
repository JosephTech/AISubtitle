from flask import Flask,request
from utils.utils import get_captioned_video
import uuid
import os
from tools.pool import ProcessingPool
from tools.work import consumer
from tools.handler import create_proc_handler
from queue import Queue
from threading import Thread

cmds_q = Queue()
# 此处 把变量传递进去即可，注意加锁
consumer_thread = Thread(target=consumer,args=(cmds_q,))
consumer_thread.start()

# 进度，被WorkThread引用
# value: [video_format, progress]
progress_hash = dict()


app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/progress", methods=["get"])
def get_progress():
    print('get_progress被调用')
    key = request.args.get("key")
    print("key is ", key)
    if not key in progress_hash.keys():
        return str("未上传视频")
    # if ..return 未开始
    # if progress_hash[key] == None:
    #     progress_hash[key] = 0
    return str(progress_hash[key][1])

@app.route("/upload", methods=["POST"])
def upload_file():
    print('调用upload_file')
    print(request.method)
    if request.method == 'POST':
        f = request.files['video']
        print(f.filename)
        print('T'*100)
        # save_path = 
        # f.save(f.filename)
        # 使用key，新建文件夹
        # 使用key+f.filename作为文件名
        # todo?: (多个用户同时上传 怎么办？)
        # 保存文件，将key返回给客户端
        key = uuid.uuid1()
        #file_name = f.filename
        print(f.filename)
        video_format = f.filename.split('.')[-1]
        print('F'*100)
        user_dir = '../vad_and_decode/video/' + str(key)
        print("_"*80, user_dir)
        if not os.path.exists(user_dir):
            os.makedirs(user_dir)
            print("_"*80, 'new_folder')
        pass
        # 需要配置文件
        save_path = os.path.join('../vad_and_decode/video/'+ str(key), f.filename)
        f.save(save_path)
        ass_path = os.path.join('../vad_and_decode/video/'+str(key)+'/decoded', str(key)+'.ass')
        decoded_video_path = os.path.join('../vad_and_decode/video/'+str(key)+'/decoded', str(key)+'.'+ video_format)
        # 异步 + 轮询，使用run.sh解码，
        # todo: 传递参数到run.sh脚本
        # todo: 轮询
        # todo: 异步如何 更美丽
        #cmd = ['bash', './utils/get_captioned_video.sh', str(key), f.filename]
        #callback = create_proc_handler(key)
        #work.create_shellproc(cmd, callback)
        progress_hash[str(key)] = [video_format, 0]
        cmd = (str(key), ass_path, decoded_video_path, ['bash', './utils/get_captioned_video.sh', str(key), f.filename], progress_hash)
        cmds_q.put(cmd)
        #ret = get_captioned_video(save_path, str(key), f.filename)
        # (server中实现吧，要不太寡淡了)解码后回调，上传到腾讯COS
        # 上传成功后，回调，通知客户端
        # 客户端 通过key从腾讯COS获取数据，显示（显示视频）
        # 客户端可下载视频
        # if -1 == ret:
        #     return 'failed'
        return str(key)
    else:
        return 'failed'

@app.route('/get-ass-video', methods=['GET',])
def get_ass_video():
    # 从数据库中，根据key，查询ass和video的url
    key = request.args.get("key")
    print("key is", key)
    # 未来要换成系统配置
    bucket = "ass-and-video-1304654982"
    region = "ap-shanghai"
    # https://ass-and-video-1304654982.cos.ap-shanghai.myqcloud.com/3473f4b0-97f4-11ed-8c51-d59b91f1c5ab.ass
    # todo: 视频不同格式
    video_format = progress_hash[key][0]
    return "https://{}.cos.{}.myqcloud.com/{}.ass https://{}.cos.{}.myqcloud.com/{}.{}".format(bucket, region, key, bucket, region, key, video_format)


if __name__ == "__main__":
    # 微信开发者平台只支持
    app.run(host='0.0.0.0', port=80)
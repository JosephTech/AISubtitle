from flask import Flask,request
from utils.utils import get_captioned_video
import uuid
import os
from tools.pool import ProcessingPool
from tools.work import consumer
from queue import Queue
from threading import Thread

cmds_q = Queue()
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
    return str(progress_hash[key][1])

@app.route("/upload", methods=["POST"])
def upload_file():
    print('调用upload_file')
    print(request.method)
    if request.method == 'POST':
        f = request.files['video']
        print(f.filename)
        print('T'*100)
        key = uuid.uuid1()
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
        progress_hash[str(key)] = [video_format, 0]
        cmd = (str(key), ass_path, decoded_video_path, ['bash', './utils/get_captioned_video.sh', str(key), f.filename], progress_hash)
        cmds_q.put(cmd)
        return str(key)
    else:
        return 'failed'

@app.route('/get-ass-video', methods=['GET',])
def get_ass_video():
    # TODO: 从数据库中，查询ass和video的url
    key = request.args.get("key")
    print("key is", key)
    # TODO: 换成系统配置
    bucket = "ass-and-video-1304654982"
    region = "ap-shanghai"
    # https://ass-and-video-1304654982.cos.ap-shanghai.myqcloud.com/3473f4b0-97f4-11ed-8c51-d59b91f1c5ab.ass
    # TODO: 视频不同格式
    video_format = progress_hash[key][0]
    return "https://{}.cos.{}.myqcloud.com/{}.ass https://{}.cos.{}.myqcloud.com/{}.{}".format(bucket, region, key, bucket, region, key, video_format)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80)
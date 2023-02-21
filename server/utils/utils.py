import os
import time
import subprocess

# call subprocess to cut and decode video
def get_captioned_video(video_path: str,
                        key: str,
                        filename: str):
    if not os.path.exists(video_path):
        return -1
    #cmd1 = 'cd ../vad_and_decode/'
    #cmd2 = './run.sh'
    #cmd = cmd1 + ' && ' + cmd2
    #subprocess.Popen(cmd, shell=True)
    subprocess.Popen(['pwd'])
    proc = subprocess.Popen(['bash', './utils/get_captioned_video.sh', key, filename])
    while True:
        if proc.poll() == None:
            print("程序执行中")
            time.sleep(2)
            pass
        else:
            print("程序执行完毕")
            break
    #print("hello.........................................")
    return 0














import subprocess
import queue
import time
from queue import Queue
from typing import Tuple, List, Dict
from multiprocessing import Process,Manager
from tools.cos import cos_upload

import threading

# class Work(object):
#     def __init__(self):
#         # 进程间通信
#         self.__subprocs = Manager().list()
#         pass
#     def __loop(self):
#         while True:
#             time.sleep(3)
#             print("__loop被调用, size is", len(self.__subprocs))
#             # 哪个subprocess执行完毕，就调用哪个的callback
#             for shellproc,callback in self.__subprocs:
#                 if shellproc.poll() == None:
#                     print('程序正在执行中')
#                 else:
#                     callback()
#     def run(self):
#         self.__p = Process(target=self.__loop, args=(self.__subprocs,))
#         self.__p.start()
#     def kill(self):
#         self.__p.terminate()
#     def create_shellproc(self, cmd: List[str], callback):
#         shellproc = subprocess.Popen(cmd)
#         # 这个shellproc和这个callback可能都无法序列化，导致不能在进程间共享数据
#         self.__subprocs.append((shellproc,callback))

# class Consumer(threading.Thread):
#     def run(self):
#         # global cmds_q;
#         threads = []
#         while True:
#             time.sleep(3)
#             for t in threads:
#                 if not t.isAlive():
#                     print('线程死亡，移除线程')
#                     threads.remove(t)
#             print("Consumer正在为主人服务...")
#             if len(threads) < 5 and not cmds_q.empty():
#                 data = cmds_q.get()
#                 th = WorkThread(data)
#                 th.start()
#                 threads.append(th)

def consumer(cmds_q):
    # global cmds_q;
    threads = []
    while True:
        time.sleep(3)
        for t in threads:
            if not t.is_alive():
                print('线程死亡，移除线程')
                threads.remove(t)
        print("consumer正在为主人服务...")
        if len(threads) < 5 and not cmds_q.empty():
            data = cmds_q.get()
            th = WorkThread(data)
            th.start()
            threads.append(th)

class WorkThread(threading.Thread):
    def __init__(self, cmd: Tuple[str, str, str, List[str], Dict[str, List]]):
        # 要求实现Thread init方法
        threading.Thread.__init__(self)
        self.__key = cmd[0]
        self.__ass = cmd[1]
        self.__video = cmd[2]
        self.__cmd = cmd[3]
        self.__progress_bar = cmd[4]
    def run(self):
        shellproc = subprocess.Popen(self.__cmd, stdout=subprocess.PIPE, bufsize=1)
        # 这个shellproc和这个callback可能都无法序列化，导致不能在进程间共享数据
        #self.__subprocs.append((shellproc,callback))
        self.__progress_bar[self.__key][1] = 10
        while shellproc.poll() is None:
            #time.sleep(3)
            print("解码中,pid is", shellproc.pid)
            line = shellproc.stdout.readline()
            line = line.strip()
            print(line[:8])
            if (line[:8] == b"PROGRESS"):
                self.__progress_bar[self.__key][1] = int(line[-2:])
                print("progress is ", self.__progress_bar[self.__key][1])
        self.__progress_bar[self.__key][1] = 95
        print("解码完毕, 上传cos对象存储,保存mysql数据库, key is ", self.__key)
        cos_upload(self.__ass, self.__video)
        self.__progress_bar[self.__key][1] = 100
        
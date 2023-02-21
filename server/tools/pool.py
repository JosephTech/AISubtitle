import multiprocessing
import time

class ProcessingPool(object):
    # 开启线程池
    def __init__(self):
        self.__pool = multiprocessing.Pool()

    # 往线程池中添加func,异步
    def add_async_proc(self, func, params):
        self.__pool.apply_async(func, params)

    # 关闭线程池
    def close(self):
        self.__pool.close()
        self.__pool.join()

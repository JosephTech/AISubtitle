
# 闭包 返回回调函数
def create_proc_handler(key):
    # 返回key，外边设置flag
    def proc_handler():
        # 上传到对象存储
        print('上传到存储对象, key is', key)
        return key
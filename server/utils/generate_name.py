from werkzeug.utils import secure_filename
from pypinyin import lazy_pinyin



'''
    param： 文件名

    return: to_ascii(to_pinyin(name)) + uuid.mp4
'''
def uuid_filename(filename: str):
    name = filename.split('.')[0]
    expand = filename.split('.')[1]
    print(lazy_pinyin(name, errors = 'ignore'))
    pass



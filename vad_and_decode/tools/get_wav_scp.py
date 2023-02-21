import os
import sys

#print(sys.argv[0])
pwd = sys.argv[1]
segs_path = sys.argv[2]

for file_name in os.listdir(segs_path):
    splits = file_name.split('_')
    print(splits[-3] + splits[-1].split('.')[0], end=' ')
    print(pwd + segs_path.strip('.') + '/' + file_name)

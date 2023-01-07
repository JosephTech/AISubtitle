
import argparse
import os
from ass_header import get_header

def ms_to_hours(millisecond: int):
    seconds = int((millisecond/1000) % 60)
    minutes = int((millisecond/(1000*60)) % 60)
    hours = int((millisecond/(1000*60*60)) % 24)
    lay = millisecond - hours*60*60*1000 - minutes*60*1000 - seconds*1000
    lay = str(lay).zfill(2)[:2]
    return "%d:%d:%d.%s" % (hours, minutes, seconds, lay)

#Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text'''
#Dialogue: 0,0:00:31.66,0:00:34.16,Default,,0,0,0,,长亭外\N{\fn微软雅黑\fs14\b0}Outside the long Pavilion,
def generage_caption_line(start_millisecond: int, 
                    end_millisecond: int,
                    caption: str):
    line = 'Dialogue: 0,'
    line += ms_to_hours(start_millisecond)
    line += ','
    line += ms_to_hours(end_millisecond)
    line += ','
    line += 'Default,,0,0,0,,'
    line += caption
    #line += "\N{\fn微软雅黑\fs14\b0}"
    return line

def main():
    parser = argparse.ArgumentParser(description='')
    parser.add_argument('decoded_file', help='decode result file')
    parser.add_argument('output_file', help='ass file path')
    args=parser.parse_args()

    with open(args.decoded_file, 'r', encoding='utf-8') as fin, \
         open(args.output_file, 'w', encoding='utf-8') as fout:
            ass_content = get_header()
            for line in fin:
                # print(line)
                # 00001062420000107614 可能要排到二三月了
                time_interval = line.split(' ')[0]
                caption = line.split(' ')[1]
                start_millisecond = int(time_interval[0:10])
                end_millisecond = int(time_interval[10:])
                #print(start_millisecond, '\t', end_millisecond)
                ass_content += generage_caption_line(start_millisecond, end_millisecond, caption)
            fout.write(ass_content)


if __name__=='__main__':
    main()


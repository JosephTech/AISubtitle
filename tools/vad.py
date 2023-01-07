import os
import sys
import time
from utils_vad import read_audio, init_jit_model, get_speech_timestamps
from pydub import AudioSegment

print(sys.argv[0])
wav_file_path = sys.argv[1]
segs_path = sys.argv[2]
vad_model_path = sys.argv[3]


audio = read_audio(wav_file_path)
vad_model = init_jit_model(vad_model_path)
segs_timestamp = get_speech_timestamps(audio, vad_model)

#print(audio)
#print(segs_timestamp)

def generate_wav_filename(file_name: str,
                          start_time: int,
                          end_time: int):
    
    # millisecond
    #timestamp = int(round(time.time()*1000))
    return file_name + '_From_' + str(start_time).zfill(10) + '_To_' + str(end_time).zfill(10) +'.wav'

sound = AudioSegment.from_mp3(wav_file_path)

for item in segs_timestamp:
    #print(item)
    # to millisecond
    start_time = int(item['start']/16000 * 1000)
    end_time = int(item['end']/16000 * 1000)
    #print(start_time,end = '    ')
    #print(end_time)
    seg_sound = sound[start_time:end_time]
    #print(wav_file_path)
    # 需确保shell脚本 传递过来的都是/
    file_name = wav_file_path.split('/')[-1].split('.')[0]
    #print(file_name)
    wav_save_path = segs_path+'/'+generate_wav_filename(file_name, start_time, end_time)
    print('saving...', wav_save_path)
    seg_sound.export(wav_save_path, format='wav')
    #break
    #pass
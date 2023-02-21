#!/bin/bash
# 原子化操作，只处理一个视频
# todo: 目录： model存放视频
# todo: 目录： video存放视频  key/file_name存放原视频 key/wav存放wav文件  key/segs存放分割 key/.ass文件是字幕  key/merged存放合成后的视频
# todo: 上传到ass后，把整个key都删除了

key=$1
filename=$2
final_video_name=$key.${filename##*.}

echo "==============================="
echo "$key"
echo "$filename"
echo "$final_video_name"


# 存放视频 unordered.scp  text  wav.scp
video_dir=./video/$key

# 存放wav文件
wav_dir=$video_dir/wav

# 存放segs
segs_dir=$video_dir/segs

# 存放decoded text 合并后的视频
decoded_dir=$video_dir/decoded

echo "$video_dir"
echo "$decoded_dir"
#exit

# 存放merged

# 存放
#result_dir=./result/$key

# 模型
wenet_model_dir=./model/multi_cn/20210815_unified_conformer_exp
vad_model=./model/vad/silero_vad.jit

CURRENT_DIR=$(pwd)

stage=1
end_stage=7

# virtual environment
eval "$(conda shell.bash hook)"

echo "PROGRESS20"
# stage 1. change video format
if [ $stage -le 1 ] && [ $end_stage -ge 1 ]; then
    # 如果目录不存在，递归创建
    if [ ! -d "$wav_dir" ]; then
        mkdir -p "$wav_dir"
    fi
    video_to_process=$video_dir/$filename
    # to wav. rename
    conda activate base && ffmpeg -i "$video_to_process" \
                                -ac 1 \
                                -ar 16000 \
                                -y "$wav_dir"/"$key".wav \
                                -loglevel quiet
fi

echo "PROGRESS30"
# stage 2. vad
if [ $stage -le 2 ] && [ $end_stage -ge 2 ]; then
    if [ ! -d "$segs_dir" ]; then
        mkdir -p "$segs_dir"
    fi
    # clear
    rm -f "$segs_dir"/*
    echo 'vad vad ****************************************************vad vad'
    conda activate vad && python3 tools/vad.py "$wav_dir"/"$key".wav "$segs_dir" $vad_model
    #conda activate vad && python3 tools/vad.py "./video/02989f4a-959c-11ed-afca-031f79e5b906/ygPqGNCmpY7le516290f3961d87af1360d791d9e9e48.mp4" "$segs_dir" $vad_model
fi

echo "PROGRESS50"
# stage 3. wav.scp
if [ $stage -le 3 ] && [ $end_stage -ge 3 ]; then
    rm -f "$video_dir"/wav.scp
    rm -f "$video_dir"/unordered.scp

    touch "$video_dir"/wav.scp
    touch "$video_dir"/unordered.scp

    python3 tools/get_wav_scp.py "$CURRENT_DIR" "$segs_dir" >> "$video_dir"/unordered.scp
    sort "$video_dir"/unordered.scp > "$video_dir"/wav.scp
    awk '{print $1, $1}' "$video_dir"/wav.scp > "$video_dir"/text
fi

echo "PROGRESS60"
# stage 4. data.list
if [ $stage -le 4 ] && [ $end_stage -ge 4 ]; then
    python3 tools/make_raw_list.py \
        "$video_dir"/wav.scp \
        "$video_dir"/text \
        "$video_dir"/data.list
fi

# todo: 这里有问题，怎么找到wenet?
bpecode=examples/multi_cn/s0/conf/train_960_unigram5000.model
pwd

echo "PROGRESS70"
# stage 5. decode
if [ $stage -le 5 ] && [ $end_stage -ge 5 ]; then
    if [ ! -d "$decoded_dir" ]; then
        mkdir -p "$decoded_dir"
    fi
    conda activate wenet && python3 recognize.py --gpu -1 \
                                                --mode "ctc_greedy_search" \
                                                --config $wenet_model_dir/train.yaml \
                                                --data_type "raw" \
                                                --test_data "$video_dir"/data.list \
                                                --checkpoint $wenet_model_dir/final.pt \
                                                --beam_size 10 \
                                                --batch_size 1 \
                                                --penalty 0.0 \
                                                --dict $wenet_model_dir/units.txt \
                                                --ctc_weight 0.5 \
                                                ${enable_bpe:+--bpe_model $bpecode} \
                                                --result_file "$decoded_dir"/decoded_text \
                                                ${decoding_chunk_size:+--decoding_chunk_size 16}
fi

echo "PROGRESS80"
# stage 6. ass
if [ $stage -le 6 ] && [ $end_stage -ge 6 ]; then
    python3 tools/generate_ass.py "$decoded_dir"/decoded_text \
                            "$decoded_dir"/"$key".ass
fi 

echo "PROGRESS90"
# stage 7. composite
if [ $stage -le 7 ] && [ $end_stage -ge 7 ]; then
    conda activate base && ffmpeg -y -i "$video_dir"/"$filename" \
            -vf subtitles="$decoded_dir"/"$key".ass "$decoded_dir"/"$final_video_name" \
            -loglevel quiet
fi

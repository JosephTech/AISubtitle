#!/bin/bash

# 原子化操作，只处理一个视频

# input_video要作为参数传递进来,需要c++从对象存储下载到一个位置
input_video=air_condition.mp4
video_name=${input_video%.*}

VIDEO_DIR=./data/video

RESULT_DIR=./result/$video_name
SEGS_DIR=$RESULT_DIR/segs

wenet_model_dir=data/model/multi_cn/20210815_unified_conformer_exp
vad_model=./data/model/vad/silero_vad.jit

CURRENT_DIR=$(pwd)

stage=7
end_stage=7

# virtual environment
eval "$(conda shell.bash hook)"

# stage 1. change video format
if [ $stage -le 1 ] && [ $end_stage -ge 1 ]; then
    # 如果目录不存在，递归创建
    #wav_path=./result/wav
    #if [ ! -d $wav_path ]; then
    #    mkdir -p $wav_path
    #fi
    current_video=$VIDEO_DIR/$input_video
    # to wav. rename
    ffmpeg -i $current_video -ac 1 -ar 16000 -y $VIDEO_DIR/"$video_name".wav
fi

# stage 2. vad
if [ $stage -le 2 ] && [ $end_stage -ge 2 ]; then
    if [ ! -d "$RESULT_DIR" ]; then
        mkdir -p "$RESULT_DIR"
    fi
    merged_path=$RESULT_DIR/merged
    if [ ! -d "$SEGS_DIR" ]; then
        mkdir -p "$SEGS_DIR"
    fi
    # clear
    rm -f "$SEGS_DIR"/*
    if [ ! -d "$merged_path" ]; then
        mkdir -p "$merged_path"
    fi 
    conda activate vad && python3 tools/vad.py $VIDEO_DIR/"$video_name".wav "$SEGS_DIR" $vad_model
fi

# stage 3. wav.scp
if [ $stage -le 3 ] && [ $end_stage -ge 3 ]; then
    # 在result/视频名 文件夹 新建 wav.scp
    # python脚本，需要传参 segs的路径，segs中所有分割的视频
    # 使用python脚本，打印 >> wav.scp
    rm -f "$RESULT_DIR"/wav.scp
    rm -f "$RESULT_DIR"/temp.scp

    touch "$RESULT_DIR"/wav.scp
    touch "$RESULT_DIR"/temp.scp

    #for f in "$SEGS_DIR"/*.wav;
    #do
    #    #echo "$f"
    #    python3 tools/get_wav_scp.py "$CURRENT_DIR" "$f" >> "$RESULT_DIR"/wav.scp
    #done
    python3 tools/get_wav_scp.py "$CURRENT_DIR" "$SEGS_DIR" >> "$RESULT_DIR"/temp.scp
    sort "$RESULT_DIR"/temp.scp > "$RESULT_DIR"/wav.scp
    awk '{print $1, $1}' "$RESULT_DIR"/wav.scp > "$RESULT_DIR"/text
fi


# stage 4. data.list
if [ $stage -le 4 ] && [ $end_stage -ge 4 ]; then
    python3 tools/make_raw_list.py \
        "$RESULT_DIR"/wav.scp \
        "$RESULT_DIR"/text \
        "$RESULT_DIR"/data.list
fi

bpecode=examples/multi_cn/s0/conf/train_960_unigram5000.model
pwd

# stage 5. decode
if [ $stage -le 5 ] && [ $end_stage -ge 5 ]; then
    conda activate wenet
    if [ ! -d "$RESULT_DIR"/decode ]; then
        mkdir -p "$RESULT_DIR"/decode
    fi
    python3 recognize.py --gpu -1 \
            --mode "ctc_greedy_search" \
            --config $wenet_model_dir/train.yaml \
            --data_type "raw" \
            --test_data "$RESULT_DIR"/data.list \
            --checkpoint $wenet_model_dir/final.pt \
            --beam_size 10 \
            --batch_size 1 \
            --penalty 0.0 \
            --dict $wenet_model_dir/units.txt \
            --ctc_weight 0.5 \
            ${enable_bpe:+--bpe_model $bpecode} \
            --result_file "$RESULT_DIR"/decode/text \
            ${decoding_chunk_size:+--decoding_chunk_size 16}
fi

# stage 6. ass
if [ $stage -le 6 ] && [ $end_stage -ge 6 ]; then
    python3 tools/generate_ass.py "$RESULT_DIR"/decode/text \
                            "$RESULT_DIR"/"$video_name".ass
fi 

if [ $stage -le 7 ] && [ $end_stage -ge 7 ]; then
    ffmpeg -i "$VIDEO_DIR"/$input_video -vf subtitles="$RESULT_DIR"/"$video_name".ass "$RESULT_DIR"/$input_video
fi
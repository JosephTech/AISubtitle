from qcloud_cos import CosConfig, CosS3Client

def cos_upload(ass_path: str,
                video_path: str):
    print("调用cos_upload")
    print('ass_path: ', ass_path)
    print('video_path: ', video_path)
    secret_id = ''
    secret_key = ''
    region = 'ap-shanghai'
    token = None

    config = CosConfig(Region=region, SecretId=secret_id, SecretKey=secret_key, Token=token)
    client = CosS3Client(config)

    response_1 = client.upload_file(
        Bucket='ass-and-video-1304654982',
        LocalFilePath=ass_path,
        Key=ass_path.split('/')[-1],
    )
    print(response_1)
    response_2 = client.upload_file(
        Bucket='ass-and-video-1304654982',
        LocalFilePath=video_path,
        Key=video_path.split('/')[-1],
    )
    pass

if __name__ == '__main__':
    #cos_upload("../../vad_and_decode/video/0c224b00-95b1-11ed-8c51-d59b91f1c5ab/HqiExFwd2D8se516290f3961d87af1360d791d9e9e48.mp4")
    cos_upload("./test.txt", "./test.txt")
    pass
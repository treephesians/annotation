🔽 아래 명령어로 point cloud 데이터 다운로드

```bash
cd apps/three/public/data

curl -O https://s3.eu-central-1.amazonaws.com/avg-kitti/raw_data/2011_09_26_drive_0018/2011_09_26_drive_0018_sync.zip

unzip 2011_09_26_drive_0018_sync.zip

mv 2011_09_26/2011_09_26_drive_0018_sync/ ./
```
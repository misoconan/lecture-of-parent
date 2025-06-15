#!/bin/bash

echo "=== 아파치 권한 문제 해결 스크립트 ==="

# 1. 현재 사용자를 www-data 그룹에 추가
sudo usermod -a -G www-data $USER

# 2. /var/www/html 디렉토리 소유권을 www-data로 변경
sudo chown -R www-data:www-data /var/www/html

# 3. 디렉토리 권한을 755로, 파일 권한을 644로 설정
sudo find /var/www/html -type d -exec chmod 755 {} \;
sudo find /var/www/html -type f -exec chmod 644 {} \;

# 4. 그룹 쓰기 권한 추가
sudo chmod -R g+w /var/www/html

echo "권한 설정 완료!"
echo "변경사항을 적용하려면 다음 명령을 실행하세요:"
echo "newgrp www-data"
echo "또는 터미널을 재시작하세요."
#!/bin/bash

echo "=== 사용자 소유 웹 디렉토리 설정 스크립트 ==="

# 1. 사용자 웹 디렉토리 생성
mkdir -p /home/misoconan/webapp
cp /mnt/c/Users/frien/3040/*.html /home/misoconan/webapp/
cp /mnt/c/Users/frien/3040/*.css /home/misoconan/webapp/
cp /mnt/c/Users/frien/3040/*.js /home/misoconan/webapp/

# 2. 아파치 VirtualHost 설정 파일 생성
sudo tee /etc/apache2/sites-available/webapp.conf > /dev/null << 'EOF'
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot /home/misoconan/webapp
    
    <Directory /home/misoconan/webapp>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/webapp_error.log
    CustomLog ${APACHE_LOG_DIR}/webapp_access.log combined
</VirtualHost>
EOF

# 3. 기본 사이트 비활성화 및 새 사이트 활성화
sudo a2dissite 000-default
sudo a2ensite webapp

# 4. 아파치 재시작
sudo systemctl restart apache2

# 5. 권한 설정
chmod 755 /home/misoconan
chmod 755 /home/misoconan/webapp
chmod 644 /home/misoconan/webapp/*

echo "사용자 웹 디렉토리 설정 완료!"
echo "이제 /home/misoconan/webapp 디렉토리에서 파일을 자유롭게 수정할 수 있습니다."
echo "접속 URL: http://localhost/"
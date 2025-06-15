#!/bin/bash

echo "=== UserDir 모듈 설정 스크립트 ==="

# 1. UserDir 모듈 활성화
sudo a2enmod userdir

# 2. UserDir 설정 파일 생성
sudo tee /etc/apache2/conf-available/userdir-custom.conf > /dev/null << 'EOF'
<IfModule mod_userdir.c>
    UserDir public_html
    UserDir disabled root
    
    <Directory /home/*/public_html>
        AllowOverride FileInfo AuthConfig Limit Indexes
        Options MultiViews Indexes SymLinksIfOwnerMatch IncludesNoExec
        Require method GET POST OPTIONS
    </Directory>
</IfModule>
EOF

# 3. 설정 활성화
sudo a2enconf userdir-custom

# 4. 아파치 재시작
sudo systemctl restart apache2

# 5. 사용자 홈 디렉토리 권한 설정
chmod 755 /home/misoconan
chmod 755 /home/misoconan/public_html
chmod 644 /home/misoconan/public_html/*

echo "UserDir 설정 완료!"
echo "접속 URL: http://localhost/~misoconan/"
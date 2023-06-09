#!/bin/bash

export LANG="ko_KR.UTF-8"

# cURL 요청을 보낼 URL
url="https://www.eduslp.ac.kr/member/login_ok.php"

# POST 요청에 사용할 데이터
data="USER_ID=limepark&PWD=PhkSjh0715%21%21"

# cURL 명령어 실행
# curl -X POST -d "$data" "$url"
response=$(curl -X POST -d "$data" "$url")
echo "$response"
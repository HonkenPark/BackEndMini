# 셀레니움 웹드라이브 사용
from selenium import webdriver
# 크롬드라이브 사용
from selenium.webdriver.chrome.service import Service
# By.XPATH (검색방법을 나타내는 상수) xpath 문자열과 동일
from selenium.webdriver.common.by import By
# 스크롤바 액션 사용
from selenium.webdriver.common.action_chains import ActionChains
# sleep 사용
import time
# json 사용
import json

# headless 옵션 및 더미 사용자 정보 설정
chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument('--headless')
chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36")  # user-agent 설정
chrome_options.add_argument("--window-size=1920,1080")  # window-size 설정

# 크롬 드라이버 위치 설정
service = Service('D:/data/chromedriver.exe')
driver = webdriver.Chrome(service=service, options=chrome_options)

# 주소 접근
# print('검색 결과를 받아오고 있습니다. (약 10초 가량 소요됩니다.)')
url = 'https://www.kayak.co.kr/flights/ICN-SPN/2023-07-29/2023-08-02/2adults/children-11?sort=bestflight_a&fs=stops=0'
driver.get(url)

# 검색결과를 받아오는 시간 10초 대기
time.sleep(20)

# 스크롤 이동 작업을 위한 스크롤 대기 시간과 height 값, 스크롤 이동을 위한 배수
scroll_pause_time = 1
screen_height = driver.execute_script("return window.screen.height;")
part_idx = 0

# JSON에 저장될 인덱스
json_idx = 0

# 파싱된 결과들이 저장될 오브젝트
datas = {}

# 출국 정보 임시 저장 후 귀국 정보와 함께 오브젝트로 datas에 저장
tmp = ""

while True:
    # 스크롤 이동 후 1초 대기
    driver.execute_script(f"window.scrollTo(0, {screen_height * part_idx});")
    part_idx += 1
    time.sleep(scroll_pause_time)
    
    # 엘레멘트 검색 (mod-variant-large가 포함된 클래스명 검색 시 시간 정보를 얻을 수 있음)
    elements = driver.find_elements('css selector', '[class$="mod-variant-large"]')
    # 엘레멘트 검색 (full-airport-wide가 포함된 클래스명 검색하여 공항정보 받아와서 출국/귀국 여부 판단)
    airports = driver.find_elements('css selector', '[class$="full-airport-wide"]')
    
    # 검색된 엘레멘트 리스트에서 시간 정보 파싱
    # enumerate 함수를 사용하면 리스트나 이터러블 객체를 순회하면서 각 엘리먼트의 인덱스와 값을 함께 처리할 수 있음
    for idx, element in enumerate(elements):
        # firstChild(출발시간), lastChild(도착시간)
        firstChild = element.find_element(By.XPATH, "./*[1]").text
        lastChild = element.find_element(By.XPATH, "./*[last()]").text
        fullText = f"{firstChild} - {lastChild}"
        
        # 비어있는 엘레멘트는 시간 정보가 없어 ":" 문구 없음
        keyword = ":"
        
        # 현재 인덱스의 공항정보
        airport = airports[idx*2].find_element(By.XPATH, "./*[1]").text
        
        if (keyword in fullText) :
            # 출국편
            if ('ICN' in airport):
                tmp = fullText
            # 귀국편
            elif ('SPN' in airport):
                if (len(tmp) == 0):
                    continue
                datas[json_idx] = {"dep": tmp, "arr": fullText}
                tmp = ""
                # 귀국편까지 세팅되면 JSON 인덱스 증가
                json_idx += 1
            # else:
                # print('Do not work: ' + airport)

    # 스크롤 높이 계산 후 화면 끝까지 모두 스크롤링 했는지 확인
    scroll_height = driver.execute_script("return document.body.scrollHeight;")
    if (screen_height) * part_idx > scroll_height:
        break

# 중복값 제거
datas_dict = {}
for key, value in datas.items():
    if value not in datas_dict.values():
        datas_dict[key] = value

final_result = json.dumps(datas_dict)
print(datas_dict)

# 웹 드라이버 종료
driver.quit()

import json
import requests
from bs4 import BeautifulSoup
import time
from tkinter import *
from tkinter import messagebox

# 게시글 목록 URL
URL_GR = "https://www.mrblue.com/novel/it0261"
URL_MAR = "https://www.mrblue.com/comic/haksan_c2_00001"
URL_WINTER = "https://www.mrblue.com/novel/180600496"

GR_GOAL = 35
MAR_GOAL = 16
WINTER_GOAL = 42

# 페이지 로드 함수
def load_page(url):
    try:
        res = requests.get(url)
        soup = BeautifulSoup(res.text, 'html.parser')
        return soup
    except:
        print("Error loading page")
        return None

# 게시글 검색 함수
def extract_book_count(soup, max):
    try:
        metadata_item  = soup.select(".mt10")[0]
        text = metadata_item.get_text()
        import re
        numbers = re.findall(r'\d+', text)
        
        if numbers:
            book_count = int(numbers[3])
            if book_count != int(max):
                return 'TRUE'
            else:
                return 'FALSE'
            return 'TRUE'
        else:
            return 'FALSE'
    except:
        print("Error searching Extract")
        return None

# 메인 함수
def main():
    soup1 = load_page(URL_GR)
    result1 = extract_book_count(soup1, GR_GOAL)
    if result1 == "TRUE":
        resultobj1 = "TRUE"
    else:
        resultobj1 = "FALSE"
    
    soup2 = load_page(URL_MAR)
    result2 = extract_book_count(soup2, MAR_GOAL)
    if result2 == "TRUE":
        resultobj2 = "TRUE"
    else:
        resultobj2 = "FALSE"
    
    soup3 = load_page(URL_WINTER)
    result3 = extract_book_count(soup3, WINTER_GOAL)
    if result3 == "TRUE":
        resultobj3 = "TRUE"
    else:
        resultobj3 = "FALSE"
    
    if resultobj1 == "TRUE":
        print("군림천하 신간이 나왔습니다!!")
    if resultobj2 == "TRUE":
        print("3월의라이온 신간이 나왔습니다!!")
    if resultobj3 == "TRUE":
        print("동천 신간이 나왔습니다!!")

if __name__ == '__main__':
    print(main())
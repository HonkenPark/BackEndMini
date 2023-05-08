import json
import requests
from bs4 import BeautifulSoup
import time
from tkinter import *
from tkinter import messagebox

# 게시글 목록 URL
URL_HOTDEAL = "https://www.fmkorea.com/index.php?mid=hotdeal&page=1"

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
def search_post(soup, keywords):
    try:
        post_list = soup.select(".hotdeal_var8")
        for post in post_list:
            for keyword in keywords:
                if keyword['switch'] == 'on':
                    if post.get_text().find(keyword['keyword']) != -1:
                        return keyword['keyword']
        return ""
    except:
        print("Error searching post")
        return None

# 메인 함수
def main():
    json_file_path = './python/keyword.json'
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f, strict=True)
        keywords = data['keywords']

    while True:
        soup = load_page(URL_HOTDEAL)
        if soup is None:
            continue
        result = search_post(soup, keywords)
        if result != "":
            resultobj = {"search": True, "keyword": result}
            return resultobj
        else:
            now = time
            resultobj = {"search": False, "keyword": ""}
            return resultobj

if __name__ == '__main__':
    print(main())
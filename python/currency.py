import requests
import pprint
import json

def main():
    url = 'https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=QFbn3uFi2qt75VOXPvnnGxuVirl8XfgP&searchdate=20230509&data=AP01'
    response = requests.get(url)
    contents = response.text
    return contents

if __name__ == '__main__':
    print(main())
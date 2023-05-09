import requests
import pprint
import json
import sys

def main():
    url = sys.argv[1]
    authkey = sys.argv[2]
    searchdate = sys.argv[3]
    data = sys.argv[4]

    url = '{}?authkey={}&searchdate={}&data={}'.format(url, authkey, searchdate, data);
    response = requests.get(url)
    contents = response.text
    return contents

if __name__ == '__main__':
    print(main())
import requests
import csv

key = "koGvncvrGHQSqT289Xzg0zxNcyuErvBCKEazlAYOayip%2Bj2x6LZagF%2BL0Lg00oG4JPRqbKuFI29vle12dZ7%2Bvw%3D%3D"
url = f"http://apis.data.go.kr/6270000/dbmsapi01/getBasic?serviceKey={key}"
csv_file = "bus_station_data.csv"

response = requests.get(url, verify=False)
data = response.json()

# items 안에 bs 리스트 접근
bs_list = data.get("body", {}).get("items", {}).get("bs", [])

with open(csv_file, mode="w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["정류소ID", "정류소명", "xPos", "yPos", "wincId"])

    for bs in bs_list:
        writer.writerow([
            bs.get("bsId", ""),
            bs.get("bsNm", ""),
            bs.get("xPos", ""),
            bs.get("yPos", ""),
            bs.get("wincId", "")
        ])

print(f"✅ 총 {len(bs_list)}개 정류장 정보가 '{csv_file}'에 저장되었습니다.")

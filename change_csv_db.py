import pandas as pd
import sqlite3
import os

# 경로 설정
csv_path = "data/getOff_getOn_data.csv"
db_path = "data/getOff_getOn_data.db"

# CSV 파일 불러오기
df = pd.read_csv(csv_path)

# SQLite DB 연결 (없으면 자동 생성)
conn = sqlite3.connect(db_path)

# 'bus_data' 테이블로 저장 (기존 데이터 덮어씀)
df.to_sql("bus_data", conn, if_exists="replace", index=False)

# 정류소ID 인덱스 생성 (속도 향상)
try:
    conn.execute("CREATE INDEX IF NOT EXISTS idx_station_id ON bus_data (정류소ID);")
    print("인덱스 생성 완료: idx_station_id")
except Exception as e:
    print("인덱스 생성 중 오류 발생:", e)

# 연결 종료
conn.close()

print("CSV → SQLite 변환 및 인덱스 생성 완료.")
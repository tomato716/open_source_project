import pandas as pd

# 원본 CSV 파일 경로
input_path = 'data/getOff_getOn_data.csv'
# 출력할 평균 파일 경로
output_path = 'data/getOff_getOn_avg.csv'

# CSV 불러오기
df = pd.read_csv(input_path, encoding='utf-8')

# 시간 컬럼만 선택 (05시 ~ 23시)
time_columns = [f"{str(i).zfill(2)}시" for i in range(5, 24)]

# 정류소ID별 평균 계산
avg_df = df.groupby('정류소ID')[time_columns].mean().round(2)

# 정류소ID를 첫 번째 열로 초기화
avg_df.reset_index(inplace=True)

# 저장
avg_df.to_csv(output_path, index=False, encoding='utf-8-sig')

print("✅ 정류소별 시간대 평균 파일 생성 완료!")
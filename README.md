# 프로젝트 미리보기
### chart.js
<img src="https://github.com/user-attachments/assets/c1e4c1a8-0b1a-410f-8ce6-146d9a446a9b" width="400" height="250">
<img src="https://github.com/user-attachments/assets/92e06e7c-7343-40bc-a75e-77295fc9ab8c" width="400" height="250">

### openStreetMap
<img src="https://github.com/user-attachments/assets/c3dca9de-09c0-4488-a745-13e6367c022a" width="400" height="250">


# 데이터셋
### 파이썬 requests로 공공데이터 csv파일 생성
<img src="https://github.com/user-attachments/assets/35275c35-1fe8-4f29-92a0-f9d981847dbf" width="400" height="250">

### 공공데이터-파일데이터 파이썬으로 전처리

* ### 전처리 전
<img src="https://github.com/user-attachments/assets/8ef2539a-7d10-45cb-a738-3221048ba50a" width="800" height="250">

* ### 전처리 후
<img src="https://github.com/user-attachments/assets/c446b435-bb04-4ae7-af55-28257026d97d" width="800" height="250">


# 배포
[daegu-bus-stop-congestion](https://daegu-bus-stop-congestion.vercel.app/)

# 📌 프로젝트 개요
대구 지역 버스 정류장의 실시간 혼잡도와 승하차 인원 데이터를 시각화하는 웹 애플리케이션입니다. 지도 기반 인터페이스를 통해 사용자 위치 주변의 정류장 정보를 확인할 수 있으며, 정류장을 클릭하면 상세한 통계 데이터를 확인할 수 있습니다.

# ✨ 주요 기능
🗺️ 인터랙티브 지도: OpenStreetMap 기반의 지도 서비스

📍 정류장 위치 표시: 사용자 위치 기준 반경 1km 내 정류장 마커 표시

🔍 상세 정보 조회: 정류장 클릭 시 혼잡도 및 승하차 인원 데이터 제공

📊 데이터 시각화: 시간대별/월별 승하차 인원 추이를 차트로 표시

📱 반응형 디자인: 다양한 디바이스에서 최적화된 화면 제공

# 🛠 기술 스택
Frontend

<img src="https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white" width="65" height="20">
<img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black" width="65" height="20">
<img src="https://img.shields.io/badge/Leaflet-199900?style=flat&logo=leaflet&logoColor=white" width="65" height="20">
<img src="https://img.shields.io/badge/Chart.js-FF6384?style=flat&logo=chart.js&logoColor=white" width="65" height="20">
APIs
Geolocation API
Custom API endpoints (/api/stations, /api/predict)

# 🚀 시작하기
설치 방법
저장소 복제
git clone https://github.com/tomato716/open_source_project.git
cd open_source_project

의존성 설치
npm install

개발 서버 실행
npm run dev

브라우저에서 접속
http://localhost:3000

프로덕션 빌드
npm run build
npm start

# 📂 프로젝트 구조
open_source_project/

├── data/

│   └── data/bus_station_data.csv

│   └── data/getOff_getOn_avg.csv

├── lib/predictor.js

├── pages/

│   ├── api/              

│   │   └── api/_document.js

│   │   ├── stations.js    

│   │   └── predict.js      

│   └── index.js           
             
├── public/             

│   ├── bus.ico           

│   └── daegu.png           

├── scripts/

│   └── scripts/bus_station_pos.py

│   └── scripts/getOff_getOn_preprocessor.py

├── styles/                  

└── README.md                
# 🌟 기능 상세 설명
1. 지도 서비스
OpenStreetMap 타일 레이어 사용

사용자 위치 기반으로 지도 중심점 자동 설정

반경 1km 내 정류장만 필터링하여 표시

2. 정류장 마커
랜덤 색상 마커 사용 (다양한 색상 제공)

마커 클릭 시 해당 정류장 상세 정보 모달 표시

사용자 위치는 특별한 마커(gold)로 표시

3. 정보 모달
정류장 기본 정보 (이름, ID)

실시간 혼잡도 예측 정보

시간대별 승하차 인원 추이 (막대 그래프)

월별 승하차 인원 추이 (막대 그래프)

# 📈 데이터 흐름도

graph TD

    A[사용자 위치 요청] --> B{위치 정보 획득?}
    
    B -->|성공| C[지도 중심점 설정]
    
    
    B -->|실패| D[기본 위치(대구대) 사용]
    
    C --> E[주변 정류장 필터링]
    
    D --> E
    
    E --> F[마커 표시]
    
    F --> G{정류장 클릭}
    
    G --> H[API 요청]
    
    H --> I[데이터 처리]
    
    I --> J[모달에 정보 표시]
# 📝 API 문서
GET /api/stations
설명: 모든 정류장 데이터 조회

응답 형식:

json
[
  {
    "정류소ID": "12345",
    "정류소명": "대구대학교 정문",
    "xPos": "128.7406",
    "yPos": "35.8866"
  },
  ...
]
POST /api/predict
설명: 특정 정류장의 혼잡도 예측 데이터 요청

요청 본문:

json
{
  "station_id": "12345"
}
응답 형식:

json
{
  "congestion_level": "보통",
  "prediction_time": "2023-11-20T14:30:00"
}
# 📜 라이선스
MIT License

# ✉️ 문의

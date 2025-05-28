<<<<<<< HEAD
import { useState, useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";


// 모달 스타일
const modalStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  zIndex: 9999,
  width: "90%",
  maxWidth: "900px",
  maxHeight: "90vh",
  overflowY: "auto",
  border: "1px solid #ddd"
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  zIndex: 9998
};

// 차트 동적 임포트 (fallback 추가)
const ChartWithNoSSR = dynamic(
  () => import("react-chartjs-2").then((mod) => {
    // 차트.js도 함께 로드
    return Promise.all([
      import("chart.js/auto"),
      mod
    ]).then(([_, chartComponents]) => ({
      Bar: chartComponents.Bar,
      Line: chartComponents.Line,
      Pie: chartComponents.Pie,
      Doughnut: chartComponents.Doughnut
    }));
  }),
  { 
    ssr: false,
    loading: () => <div>차트 로딩 중...</div>
  }
);

const MapContainerWithNoSSR = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => <div>지도 로딩 중...</div>
  }
);

const TileLayerWithNoSSR = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const MarkerWithNoSSR = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { 
    ssr: false,
    loading: () => <div>마커 로딩 중...</div>
  }
);

const PopupWithNoSSR = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);


const DAEGU_UNIV = [35.8866, 128.7406];

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
=======
import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const MapWithNoSSR = dynamic(
  () => import('react-leaflet').then((mod) => {
    const { MapContainer, TileLayer, Marker, Popup } = mod;
    return function MapWrapper(props) {
      return (
        <MapContainer {...props}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {props.children}
        </MapContainer>
      );
    };
  }),
  { ssr: false }
);

const MarkerWithNoSSR = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const PopupWithNoSSR = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const DAEGU_UNIV = [35.8866, 128.7406];
>>>>>>> ca29f6a69c2056a2ca5d4d7952a896208833bd6e

export default function Home() {
  const [center, setCenter] = useState(DAEGU_UNIV);
  const [userLocation, setUserLocation] = useState(null);
<<<<<<< HEAD
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  // 지도 로딩 완료 핸들러
  const handleMapLoad = () => {
    setMapLoaded(true);
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setShowModal(false);
    setSelectedStation(null);
    setChartData(null);
    setMonthlyData(null);
    setError(null);
  };

  useEffect(() => {
    fetch("/api/stations")
      .then((res) => res.json())
      .then((data) => {
        setStations(data);
      })
      .catch((err) => console.error("정류장 데이터를 불러오는 데 실패:", err));
  }, []);

  useEffect(() => {
    if (!stations.length) return;
    const RADIUS_KM = 10;

    const filtered = stations.filter((station) => {
      const lat = parseFloat(station["yPos"]);
      const lon = parseFloat(station["xPos"]);
      const distance = getDistanceFromLatLonInKm(
        center[0],
        center[1],
        lat,
        lon
      );
      return distance <= RADIUS_KM;
    });

    setFilteredStations(filtered);
  }, [stations, center]);

=======

>>>>>>> ca29f6a69c2056a2ca5d4d7952a896208833bd6e
  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setCenter([latitude, longitude]);
        },
        (error) => {
          console.error("위치 정보를 가져오는데 실패했습니다:", error);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  };

<<<<<<< HEAD
  const fetchStationData = async (station) => {
    try {
      setShowModal(true);
      setLoading(true);
      setError(null);
      setSelectedStation(station);

      const now = new Date();
      const hour = now.getHours().toString().padStart(2, "0") + "시";
      // 차트 라이브러리 동적 임포트
    await Promise.all([
      import('chart.js/auto'),
      import('react-chartjs-2')
    ]);
      
      // API 호출에 더 많은 에러 핸들링 추가
    const [timeRes, monthlyRes] = await Promise.all([
      fetch(`/api/getOff_getOn_stats?stationId=${station["정류소ID"]}&hour=${hour}`)
        .then(res => {
          if (!res.ok) throw new Error(`시간대별 데이터 요청 실패: ${res.status}`);
          return res.json();
        }),
      fetch(`/api/monthly_stats?stationId=${station["정류소ID"]}`)
        .then(res => {
          if (!res.ok) throw new Error(`월별 데이터 요청 실패: ${res.status}`);
          return res.json();
        })
    ]);

      if (!timeRes.ok || !monthlyRes.ok) throw new Error("API 요청 실패");

      const [timeData, monthlyData] = await Promise.all([
  timeRes,
  monthlyRes
]);

      // 시간대별 데이터 처리
      const timeLabels = [
        "05시", "06시", "07시", "08시", "09시", 
        "10시", "11시", "12시", "13시", "14시", 
        "15시", "16시", "17시", "18시", "19시", 
        "20시", "21시", "22시", "23시"
      ];
      
      const chartData = {
        labels: timeLabels,
        datasets: [
          {
            label: "승차",
            data: timeData.getOnData || Array(19).fill(0),
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
          {
            label: "하차",
            data: timeData.getOffData || Array(19).fill(0),
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      };

      // 월별 데이터 처리
      const monthlyChartData = {
        labels: [
          "1월", "2월", "3월", "4월", "5월", "6월",
          "7월", "8월", "9월", "10월", "11월", "12월"
        ],
        datasets: [
          {
            label: "월별 승차 누적",
            data: monthlyData.monthlyGetOn || Array(12).fill(0),
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
          {
            label: "월별 하차 누적",
            data: monthlyData.monthlyGetOff || Array(12).fill(0),
            backgroundColor: "rgba(153, 102, 255, 0.5)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
          },
        ],
      };

      setChartData(chartData);
      setMonthlyData(monthlyChartData);
      setLoading(false);

    } catch (error) {
      console.error("데이터 로드 실패:", error);
      setError(error.message || "데이터를 불러오는 중 오류가 발생했습니다");
      setLoading(false);
      
      // 기본 데이터 구조 제공
      const timeLabels = Array(19).fill("").map((_, i) => `${i+5}시`);
      const monthLabels = Array(12).fill("").map((_, i) => `${i+1}월`);
      
      setChartData({
        labels: timeLabels,
        datasets: [
          {
            label: "승차",
            data: Array(19).fill(0),
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
          {
            label: "하차",
            data: Array(19).fill(0),
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      });
      
      setMonthlyData({
        labels: monthLabels,
        datasets: [
          {
            label: "월별 승차 누적",
            data: Array(12).fill(0),
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
          {
            label: "월별 하차 누적",
            data: Array(12).fill(0),
            backgroundColor: "rgba(153, 102, 255, 0.5)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
          },
        ],
      });
    }
  };

=======
>>>>>>> ca29f6a69c2056a2ca5d4d7952a896208833bd6e
  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <div>
      <Head>
<<<<<<< HEAD
        <title>정류장 지도</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
          integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
          crossOrigin=""
        />
      </Head>

      <div style={{ height: "100vh", position: "relative" }}>
        {!mapLoaded && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 999
          }}>
            지도 로딩 중...
          </div>
        )}
        
        <MapContainerWithNoSSR
  center={center}
  zoom={13}
  style={{ height: "100%", width: "100%" }}
  whenCreated={(map) => {
    setMapInstance(map);
    handleMapLoad();
  }}
>

          <TileLayerWithNoSSR
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {filteredStations.map((station, idx) => (
            <MarkerWithNoSSR
              key={`${station.정류소ID}-${idx}`}
              position={[parseFloat(station["yPos"]), parseFloat(station["xPos"])]}
              eventHandlers={{
                click: () => fetchStationData(station),
              }}
            >
              <PopupWithNoSSR>
                {station["정류소명"]}
                <br />
                (클릭 시 상세 정보 확인)
              </PopupWithNoSSR>
            </MarkerWithNoSSR>
          ))}
        </MapContainerWithNoSSR>

      

        {/* 모달 창 */}
        {showModal && (
          <>
            <div style={overlayStyle} onClick={closeModal} />
            <div style={modalStyle}>
              <h2 style={{ marginTop: 0, color: "#333", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                {selectedStation?.정류소명 || "정류장 정보"}
              </h2>
              
              {error ? (
                <div style={{ color: "red", margin: "20px 0" }}>
                  오류 발생: {error}
                </div>
              ) : loading ? (
                <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  데이터를 불러오는 중...
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "30px" }}>
                    <h3 style={{ color: "#555" }}>시간대별 승하차 추이 (2023년 전체)</h3>
                    <div style={{ height: "300px" }}>
                          {chartData && chartData.labels && chartData.labels.length > 0 ? (
                            
  <div style={{ height: "300px" }}>
  <ChartWithNoSSR.Bar
    data={chartData}
    options={{
        responsive: true,
        maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                title: {
                                  display: true,
                                  text: "승하차 인원 (명)"
                                }
                              },
                              x: {
                                title: {
                                  display: true,
                                  text: "시간대"
                                }
                              }
                            }
                          }}
                          />
                        </div>
                      ) : (
                        <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {loading ? "데이터를 불러오는 중..." : "표시할 데이터가 없습니다."}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: "30px" }}>
                    <h3 style={{ color: "#555" }}>월별 승하차 누적 (2023년)</h3>
                    <div style={{ height: "300px" }}>
                      {monthlyData ? (
                        <ChartWithNoSSR.Line
                          data={monthlyData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                title: {
                                  display: true,
                                  text: "누적 인원 (명)"
                                }
                              },
                              x: {
                                title: {
                                  display: true,
                                  text: "월"
                                }
                              }
                            }
                          }}
                        />
                      ) : (
                        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          데이터가 없습니다.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button 
                  onClick={closeModal}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "16px",
                    transition: "background-color 0.3s"
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = "#45a049"}
                  onMouseOut={(e) => e.target.style.backgroundColor = "#4CAF50"}
                >
                  닫기
                </button>
              </div>
            </div>
          </>
        )}
=======
        <title>한국 지도 시뮬레이션</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        />
      </Head>

      <div style={{ height: '100vh' }}>
        <MapWithNoSSR center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
          {userLocation && (
            <MarkerWithNoSSR position={userLocation}>
              <PopupWithNoSSR>현재 위치</PopupWithNoSSR>
            </MarkerWithNoSSR>
          )}
          {!userLocation && (
            <MarkerWithNoSSR position={DAEGU_UNIV}>
              <PopupWithNoSSR>대구대학교 (기본 위치)</PopupWithNoSSR>
            </MarkerWithNoSSR>
          )}
        </MapWithNoSSR>
>>>>>>> ca29f6a69c2056a2ca5d4d7952a896208833bd6e
      </div>
    </div>
  );
}
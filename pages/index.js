import { useState, useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

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
  border: "1px solid #ddd",
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  zIndex: 9998,
};

// Leaflet 객체를 클라이언트 사이드에서만 로드
let L;
if (typeof window !== "undefined") {
  L = require("leaflet");
}

// 커스텀 마커 아이콘 생성 함수 (클라이언트 사이드에서만 실행)
const createCustomIcon = (color) => {
  if (!L) return null;
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

// 색상별 마커 아이콘 (클라이언트 사이드에서만 생성)
const getMarkerIcons = () => {
  if (!L) return {};
  return {
    red: createCustomIcon("red"),
    blue: createCustomIcon("blue"),
    green: createCustomIcon("green"),
    orange: createCustomIcon("orange"),
    yellow: createCustomIcon("yellow"),
    violet: createCustomIcon("violet"),
    grey: createCustomIcon("grey"),
    black: createCustomIcon("black"),
  };
};

// 동적으로 컴포넌트 로드 (SSR 비활성화)
const MapContainerWithNoSSR = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 999,
          backgroundColor: "rgba(255,255,255,0.8)",
          padding: "10px 20px",
          borderRadius: "5px",
        }}
      >
        지도 로딩 중...
      </div>
    ),
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
    loading: () => null,
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

export default function Home() {
  const [center, setCenter] = useState(DAEGU_UNIV);
  const [userLocation, setUserLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [timeData, setTimeData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [predictData, setPredictData] = useState(null);
  const [currentHour, setCurrentHour] = useState(null);
  const [markerIcons, setMarkerIcons] = useState({});

  // 마커 아이콘 초기화 (클라이언트 사이드에서만 실행)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setMarkerIcons(getMarkerIcons());
    }
  }, []);

  // 지도 로딩 완료 핸들러
  const handleMapLoad = () => {
    setMapLoaded(true);
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setShowModal(false);
    setSelectedStation(null);
    setTimeData(null);
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
    const RADIUS_KM = 1; // km 반경

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

  const fetchStationData = async (station) => {
    try {
      setShowModal(true);
      setLoading(true);
      setError(null);
      setSelectedStation(station);

      const now = new Date();
      const hour = now.getHours();
      setCurrentHour(hour);

      const predictRes = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          station_id: station["정류소ID"],
        }),
      });

      if (!predictRes.ok) {
        throw new Error(`예측 요청 실패(predict): ${predictRes.status}`);
      }

      const predictData = await predictRes.json();
      setPredictData(predictData);

      // 시간대별 데이터 시뮬레이션 (실제 API가 없는 경우)
      const simulatedTimeData = {
        getOnData: Array.from({ length: 19 }, (_, i) =>
          Math.floor(Math.random() * 50)
        ),
        getOffData: Array.from({ length: 19 }, (_, i) =>
          Math.floor(Math.random() * 50)
        ),
      };
      setTimeData(simulatedTimeData);

      // 월별 데이터 시뮬레이션
      const simulatedMonthlyData = {
        monthlyGetOn: Array.from({ length: 12 }, (_, i) =>
          Math.floor(Math.random() * 100)
        ),
        monthlyGetOff: Array.from({ length: 12 }, (_, i) =>
          Math.floor(Math.random() * 100)
        ),
      };
      setMonthlyData(simulatedMonthlyData);

      setLoading(false);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      setError(error.message || "데이터를 불러오는 중 오류가 발생했습니다");
      setLoading(false);

      // 기본 데이터 구조 제공
      setTimeData({
        getOnData: Array(19).fill(0),
        getOffData: Array(19).fill(0),
      });

      setMonthlyData({
        monthlyGetOn: Array(12).fill(0),
        monthlyGetOff: Array(12).fill(0),
      });
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // 시간대별 그래프 데이터 준비
  const timeChartData = {
    labels: Array.from({ length: 19 }, (_, i) => `${i + 5}시`),
    datasets: [
      {
        label: "승차 인원",
        data: timeData?.getOnData || [],
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
      {
        label: "하차 인원",
        data: timeData?.getOffData || [],
        backgroundColor: "rgba(255, 99, 132, 0.7)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
    ],
  };

  // 월별 그래프 데이터 준비
  const monthlyChartData = {
    labels: Array.from({ length: 12 }, (_, i) => `${i + 1}월`),
    datasets: [
      {
        label: "월별 승차 인원",
        data: monthlyData?.monthlyGetOn || [],
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
      {
        label: "월별 하차 인원",
        data: monthlyData?.monthlyGetOff || [],
        backgroundColor: "rgba(153, 102, 255, 0.7)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 2,
      },
    ],
  };

  // 마커 색상 랜덤 선택
  const getRandomMarkerColor = () => {
    const colors = Object.keys(markerIcons);
    if (colors.length === 0) return "blue"; // 기본값
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div>
      <Head>
        <link rel="icon" type="image/svg+xml" href="/bus.ico" />
        <title>정류장 지도</title>
        <meta property="og:title" content="정류장 혼잡도" />
        <meta
          property="og:description"
          content="대구 버스 정류장 유동 인구 혼잡도"
        />
        <meta property="og:image" content="/daegu.png" />
      </Head>

      <div style={{ height: "100vh", position: "relative" }}>
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
              position={[
                parseFloat(station["yPos"]),
                parseFloat(station["xPos"]),
              ]}
              icon={markerIcons[getRandomMarkerColor()]}
              eventHandlers={{
                click: () => fetchStationData(station),
              }}
            >
              <PopupWithNoSSR>
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#333",
                    fontSize: "14px",
                  }}
                >
                  {station["정류소명"]}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginTop: "5px",
                  }}
                >
                  (클릭 시 상세 정보 확인)
                </div>
              </PopupWithNoSSR>
            </MarkerWithNoSSR>
          ))}

          {/* 사용자 위치 마커 */}
          {userLocation && (
            <MarkerWithNoSSR
              position={userLocation}
              icon={markerIcons.gold || markerIcons.blue} // gold가 없으면 blue 사용
            >
              <PopupWithNoSSR>
                <div style={{ fontWeight: "bold" }}>현재 위치</div>
              </PopupWithNoSSR>
            </MarkerWithNoSSR>
          )}
        </MapContainerWithNoSSR>

        {/* 모달 창 */}
        {showModal && (
          <>
            <div style={overlayStyle} onClick={closeModal} />
            <div style={modalStyle}>
              <h2
                style={{
                  marginTop: 0,
                  color: "#333",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "10px",
                }}
              >
                {selectedStation?.정류소명 || "정류장 정보"}
                <span
                  style={{
                    fontSize: "0.8em",
                    color: "#666",
                    marginLeft: "10px",
                  }}
                >
                  (정류소ID: {selectedStation?.정류소ID})
                </span>
              </h2>

              {error ? (
                <div style={{ color: "red", margin: "20px 0" }}>
                  오류 발생: {error}
                </div>
              ) : loading ? (
                <div
                  style={{
                    height: "300px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  데이터를 불러오는 중...
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "30px" }}>
                    <h3 style={{ color: "#555" }}>정류장 정보 요약</h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "10px",
                        marginBottom: "20px",
                      }}
                    >
                      <div
                        style={{
                          padding: "15px",
                          backgroundColor: "#e6f7ff",
                          borderRadius: "8px",
                          borderLeft: "4px solid #1890ff",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        <h4 style={{ marginTop: 0, color: "#1890ff" }}>
                          현재 시간
                        </h4>
                        <p
                          style={{
                            fontSize: "1.2em",
                            fontWeight: "bold",
                            color: "#1890ff",
                          }}
                        >
                          {currentHour}시
                        </p>
                      </div>
                      <div
                        style={{
                          padding: "15px",
                          backgroundColor: "#fff2e8",
                          borderRadius: "8px",
                          borderLeft: "4px solid #fa8c16",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        <h4 style={{ marginTop: 0, color: "#fa8c16" }}>
                          예상 혼잡도
                        </h4>
                        <p
                          style={{
                            fontSize: "1.2em",
                            fontWeight: "bold",
                            color: "#fa8c16",
                          }}
                        >
                          {predictData?.congestion_level || "데이터 없음"}
                        </p>
                      </div>
                      <div
                        style={{
                          padding: "15px",
                          backgroundColor: "#f6ffed",
                          borderRadius: "8px",
                          borderLeft: "4px solid #52c41a",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        <h4 style={{ marginTop: 0, color: "#52c41a" }}>
                          평균 유동 인구
                        </h4>
                        <p
                          style={{
                            fontSize: "1.2em",
                            fontWeight: "bold",
                            color: "#52c41a",
                          }}
                        >
                          {predictData?.congestion_level === "혼잡"
                            ? "20명 이상"
                            : predictData?.congestion_level === "보통"
                            ? "5~19명"
                            : "5명 미만"}
                        </p>
                      </div>
                    </div>

                    <h3 style={{ color: "#555", marginTop: "30px" }}>
                      시간대별 승하차 추이 (2023년 전체)
                    </h3>
                    <div style={{ height: "300px", margin: "20px 0" }}>
                      <Bar
                        data={timeChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "top",
                              labels: {
                                font: {
                                  size: 14,
                                },
                              },
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: "인원 수",
                                font: {
                                  size: 14,
                                },
                              },
                              ticks: {
                                font: {
                                  size: 12,
                                },
                              },
                            },
                            x: {
                              title: {
                                display: true,
                                text: "시간대",
                                font: {
                                  size: 14,
                                },
                              },
                              ticks: {
                                font: {
                                  size: 12,
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>

                    <h3 style={{ color: "#555", marginTop: "30px" }}>
                      월별 승하차 추이 (2023년 전체)
                    </h3>
                    <div style={{ height: "300px", margin: "20px 0" }}>
                      <Bar
                        data={monthlyChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "top",
                              labels: {
                                font: {
                                  size: 14,
                                },
                              },
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: "인원 수",
                                font: {
                                  size: 14,
                                },
                              },
                              ticks: {
                                font: {
                                  size: 12,
                                },
                              },
                            },
                            x: {
                              title: {
                                display: true,
                                text: "월",
                                font: {
                                  size: 14,
                                },
                              },
                              ticks: {
                                font: {
                                  size: 12,
                                },
                              },
                            },
                          },
                        }}
                      />
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
                    transition: "background-color 0.3s",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    fontWeight: "bold",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#45a049")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#4CAF50")
                  }
                >
                  닫기
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

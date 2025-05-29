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

const MapContainerWithNoSSR = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => <div>지도 로딩 중...</div>,
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
    loading: () => <div>마커 로딩 중...</div>,
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
      const hour = now.getHours().toString().padStart(2, "0") + "시";

      // console.log("hour 값:", now?.getHours());

      // console.log("선택된 정류장 객체:", station["정류소ID"]);

      const [timeRes, monthlyRes] = await Promise.all([
        // fetch(
        //   `/api/getOff_getOn_stats?stationId=${station["정류소ID"]}&hour=${hour}`
        // ).then((res) => {
        //   if (!res.ok)
        //     throw new Error(`시간대별 데이터 요청 실패: ${res.status}`);
        //   return res.json();
        // }),
        // fetch(`/api/monthly_stats?stationId=${station["정류소ID"]}`).then(
        //   (res) => {
        //     if (!res.ok)
        //       throw new Error(`월별 데이터 요청 실패: ${res.status}`);
        //     return res.json();
        //   }
        // ),

        // 수정 중
        fetch("/api/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            station_id: station["정류소ID"],
          }),
        })
          .then((res) => {
            if (!res.ok)
              throw new Error(`예측 요청 실패(predict): ${res.status}`);
            return res.json();
          })
          .then((data) => {
            console.log("예측 결과:", data);
          }),
      ]);

      setTimeData(timeRes);
      setMonthlyData(monthlyRes);
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

  return (
    <div>
      <Head>
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
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 999,
            }}
          >
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
              position={[
                parseFloat(station["yPos"]),
                parseFloat(station["xPos"]),
              ]}
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
              <h2
                style={{
                  marginTop: 0,
                  color: "#333",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "10px",
                }}
              >
                {selectedStation?.정류소명 || "정류장 정보"}
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
                    <h3 style={{ color: "#555" }}>
                      시간대별 승하차 추이 (2023년 전체)
                    </h3>
                    <div style={{ margin: "20px 0" }}>
                      <h4>현재 시간:</h4>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: "10px",
                        }}
                      >
                        {/* 수정 필요 */}
                        {timeData?.getOnData?.map((count, index) => (
                          <li
                            key={`on-${index}`}
                            style={{
                              padding: "5px",
                              border: "1px solid #eee",
                              borderRadius: "4px",
                            }}
                          >
                            (현재 시간 데이터 넣어줘)
                          </li>
                        ))}
                      </ul>

                      <h4 style={{ marginTop: "20px" }}>평균 유동 인구</h4>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: "10px",
                        }}
                      >
                        {/* 수정 필요 */}
                        {timeData?.getOffData?.map((count, index) => (
                          <li
                            key={`off-${index}`}
                            style={{
                              padding: "5px",
                              border: "1px solid #eee",
                              borderRadius: "4px",
                            }}
                          >
                            (predict.js의 평균 값 넣어줘)
                          </li>
                        ))}
                      </ul>
                      <h4 style={{ marginTop: "20px" }}>혼잡도 레벨</h4>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: "10px",
                        }}
                      >
                        {/* 수정 필요 */}
                        {timeData?.getOffData?.map((count, index) => (
                          <li
                            key={`off-${index}`}
                            style={{
                              padding: "5px",
                              border: "1px solid #eee",
                              borderRadius: "4px",
                            }}
                          >
                            (혼잡도 레벨을 넣어줘)
                          </li>
                        ))}
                      </ul>
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

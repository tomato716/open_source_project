import { useState, useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

const MapWithNoSSR = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
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
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const PopupWithNoSSR = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

const DAEGU_UNIV = [35.8866, 128.7406];

// ------------- 추가되거나 수정된 부분 ----------------------------------
// 위도/경도 좌표 두 지점(lat1, lon1)과 (lat2, lon2) 사이의 거리(km)를 계산하는 함수
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반지름 (단위: km)

  // 위도, 경도 차이를 라디안으로 변환
  const dLat = ((lat2 - lat1) * Math.PI) / 180; // 위도 차이 (라디안)
  const dLon = ((lon2 - lon1) * Math.PI) / 180; // 경도 차이 (라디안)

  // 하버사인 공식 적용
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + // 위도 차에 대한 사인값 제곱
    Math.cos((lat1 * Math.PI) / 180) * // 첫 번째 지점 위도 (라디안 변환 후 코사인)
      Math.cos((lat2 * Math.PI) / 180) * // 두 번째 지점 위도 (라디안 변환 후 코사인)
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2); // 경도 차에 대한 사인값 제곱

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // 중심각 계산 (radians)

  return R * c; // 거리 = 지구 반지름 * 중심각
}

export default function Home() {
  const [center, setCenter] = useState(DAEGU_UNIV);
  const [userLocation, setUserLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);

  useEffect(() => {
    fetch("/api/stations")
      .then((res) => res.json())
      .then((data) => {
        setStations(data);
      })
      .catch((err) => console.error("정류장 데이터를 불러오는 데 실패:", err));
  }, []);

  // 반경 내 정류장 필터링
  useEffect(() => {
    if (!stations.length) return;
    const RADIUS_KM = 1; // 1km 반경

    const filtered = stations.filter((station) => {
      const lat = parseFloat(station["위도"]);
      const lon = parseFloat(station["경도"]);
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
        />
      </Head>

      <div style={{ height: "100vh" }}>
        <MapWithNoSSR
          center={center}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          {userLocation && (
            <MarkerWithNoSSR position={userLocation}>
              <PopupWithNoSSR>현재 위치</PopupWithNoSSR>
            </MarkerWithNoSSR>
          )}

          {filteredStations.map((station, idx) => (
            <MarkerWithNoSSR
              key={idx}
              position={[
                parseFloat(station["위도"]),
                parseFloat(station["경도"]),
              ]}
            >
              <PopupWithNoSSR>{station["정류장명"]}</PopupWithNoSSR>
            </MarkerWithNoSSR>
          ))}
        </MapWithNoSSR>
      </div>
    </div>
  );
}

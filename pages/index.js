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

export default function Home() {
  const [center, setCenter] = useState(DAEGU_UNIV);
  const [userLocation, setUserLocation] = useState(null);

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
      </div>
    </div>
  );
}

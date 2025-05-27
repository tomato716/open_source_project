import { useState } from "react";

export default function TestPage() {
  const [input, setInput] = useState("");
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setError(null);
    setLocation(null);
    try {
      const res = await fetch(`/api/station?name=${encodeURIComponent(input)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        setLocation(data);
      }
    } catch (err) {
      setError("API 요청 실패");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>정류장 위치 검색</h1>
      <input
        type="text"
        placeholder="정류장명 입력 (예: 길안정류장)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ padding: "0.5rem", width: "300px" }}
      />
      <button
        onClick={handleSearch}
        style={{ marginLeft: "1rem", padding: "0.5rem" }}
      >
        검색
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {location && (
        <div style={{ marginTop: "1rem" }}>
          <p>정류장명: {location.정류장명}</p>
          <p>위도: {location.위도}</p>
          <p>경도: {location.경도}</p>
        </div>
      )}
    </div>
  );
}

import { predictCongestion } from "@/lib/predictor";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 허용됩니다." });
  }

  console.log(">>> Headers:", req.headers);
  console.log(">>> Body Raw:", req.body);

  const { station_id } = req.body || {};

  if (!station_id) {
    console.error("station_id가 undefined입니다.");
    return res.status(400).json({ error: "정류장 ID를 입력하세요." });
  }

  const now = new Date();
  const hour = now.getHours();

  if (hour < 5 || hour > 23) {
    return res
      .status(400)
      .json({ error: "예측 가능한 시간대는 05시~23시입니다." });
  }

  const level = predictCongestion(station_id, hour);

  res.status(200).json({
    station_id,
    hour: `${hour}시`,
    congestion_level: level,
  });
}

import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

export default async function handler(req, res) {
  const { stationId, hour } = req.query;

  if (!stationId) {
    return res.status(400).json({ error: "정류소ID가 없습니다." });
  }

  if (!hour || !/^\d{2}시$/.test(hour)) {
    return res
      .status(400)
      .json({ error: "유효한 시간(hour) 파라미터가 없습니다. 예: '06시'" });
  }

  const query = `
    SELECT 
      SUM(CASE WHEN 구분 = '승차' THEN "${hour}" ELSE 0 END) AS getOn,
      SUM(CASE WHEN 구분 = '하차' THEN "${hour}" ELSE 0 END) AS getOff
    FROM bus_data
    WHERE 정류소ID = ?
  `;

  try {
    const db = await open({
      filename: path.join(process.cwd(), "data", "getOff_getOn_data.db"),
      driver: sqlite3.Database,
    });

    const result = await db.get(query, stationId);
    await db.close();

    res.status(200).json({ 시간대: hour, ...result });
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ error: "정류장 시간대 데이터 조회 실패" });
  }
}

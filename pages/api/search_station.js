import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), "data", "bus_station_data.csv"); // CSV 경로 확인
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: "정류장명을 쿼리로 전달하세요" });
    }

    const station = records.find((rec) => rec["정류장명"] === name);

    if (!station) {
      return res.status(404).json({ error: "정류장을 찾을 수 없습니다" });
    }

    res.status(200).json(station);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

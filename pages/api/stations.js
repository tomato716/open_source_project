import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), "data", "bus_station_data.csv");
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });
    // 전체 정류장 목록 반환
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

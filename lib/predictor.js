import fs from "fs";
import path from "path";
import Papa from "papaparse";

// 전처리된 CSV 파일 경로
const csvPath = path.join(
  process.cwd(),
  "public",
  "data",
  "getOff_getOn_avg.csv"
);

let parsedData = [];

const loadCSV = () => {
  const file = fs.readFileSync(csvPath, "utf8");
  const result = Papa.parse(file, { header: true });
  parsedData = result.data;
};

const getLevel = (value) => {
  const val = parseFloat(value);
  if (val >= 20) return "혼잡";
  if (val >= 5) return "보통";
  return "여유";
};

export const predictCongestion = (stationId, hour) => {
  if (parsedData.length === 0) loadCSV();

  const hourKey = `${hour.toString().padStart(2, "0")}시`;

  console.log("hourKey:", hourKey);

  const row = parsedData.find(
    (row) => row["정류소ID"] === stationId.toString()
  );

  if (!row) return "정류장 없음";

  const val = row[hourKey];
  const level = getLevel(val);

  console.log(
    `정류장: ${stationId}, 시간: ${hourKey}, 값: ${val}, 레벨: ${level}`
  );
  return level;
};

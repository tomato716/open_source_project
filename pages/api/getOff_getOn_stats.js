import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { stationId, hour } = req.query;

  try {
    const filePath = path.join(process.cwd(), 'data', 'getOff_getOn_data.csv');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',');

    // 시간대별 데이터 초기화 (05시~23시)
    const getOnData = Array(19).fill(0);
    const getOffData = Array(19).fill(0);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const values = line.split(',');
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });

      if (record['정류소ID'] === stationId) {
        if (record['구분'] === '승차') {
          for (let h = 5; h <= 23; h++) {
            const hourKey = `${h.toString().padStart(2, '0')}시`;
            getOnData[h-5] += parseInt(record[hourKey] || 0);
          }
        } else if (record['구분'] === '하차') {
          for (let h = 5; h <= 23; h++) {
            const hourKey = `${h.toString().padStart(2, '0')}시`;
            getOffData[h-5] += parseInt(record[hourKey] || 0);
          }
        }
      }
    }

    // 요청된 시간대의 데이터
    const hourIndex = parseInt(hour) - 5;
    const currentGetOn = hourIndex >= 0 && hourIndex < 19 ? getOnData[hourIndex] : 0;
    const currentGetOff = hourIndex >= 0 && hourIndex < 19 ? getOffData[hourIndex] : 0;

    res.status(200).json({
      시간대: hour,
      getOn: currentGetOn,
      getOff: currentGetOff,
      getOnData: getOnData,
      getOffData: getOffData
    });
  } catch (error) {
    console.error('Error processing station stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
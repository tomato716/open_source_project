import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { stationId } = req.query;

  try {
    const filePath = path.join(process.cwd(), 'data', 'getOff_getOn_data.csv');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',');

    // 월별 승하차 누적 데이터 초기화
    const monthlyGetOn = Array(12).fill(0);
    const monthlyGetOff = Array(12).fill(0);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const values = line.split(',');
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });

      if (record['정류소ID'] === stationId) {
        const date = new Date(record['일자']);
        const month = date.getMonth(); // 0~11
        
        if (record['구분'] === '승차') {
          for (let h = 5; h <= 23; h++) {
            const hourKey = `${h.toString().padStart(2, '0')}시`;
            monthlyGetOn[month] += parseInt(record[hourKey] || 0);
          }
        } else if (record['구분'] === '하차') {
          for (let h = 5; h <= 23; h++) {
            const hourKey = `${h.toString().padStart(2, '0')}시`;
            monthlyGetOff[month] += parseInt(record[hourKey] || 0);
          }
        }
      }
    }

    res.status(200).json({
      monthlyGetOn,
      monthlyGetOff
    });
  } catch (error) {
    console.error('Error processing monthly stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
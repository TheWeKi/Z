import xlsx from 'xlsx';

export async function processImportData(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(sheet);

  if (!jsonData || !jsonData.length) {
    return res.status(400).send('No data found in the Excel sheet.');
  }

  // Convert data to array of JSON objects
  const jsonResult = jsonData.map(row => {
    const obj = {};
    Object.keys(row).forEach(key => {
      obj[key.trim()] = row[key];
    });
    return obj;
  });

  return jsonResult;
}


import xlsx from 'xlsx';

export async function processImportData(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(sheet);
  console.log("I am here")
  if (!jsonData || !jsonData.length) {
    return res.status(400).send('No data found in the Excel sheet.');
  }
  
  return jsonData;
}
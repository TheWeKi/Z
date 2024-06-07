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

      if (key === 'Date') {

        let dateStr = row[key]; // e.g., "DD/MM/YYYY" or "DD-MM-YYYY"

        // console.log(dateStr);

        // datestr can be in the format "22/03/2022" or "22-03-2022"
        dateStr = dateStr.replace(/-/g, "/"); // replace "-" with "/"
        // split it such that we get ["22", "03", "2022"]
        let parts = dateStr.split("/"); // split the string

        // Please note that the JavaScript Date object uses 0-based months, i.e., January is 0, February is 1, etc.
        let dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
        // console.log(dateObj.toString());
        // let formattedDate = dateObj.toISOString();

        obj[key.trim()] = dateObj.toString();
      } else {
        obj[key.trim()] = row[key];
      }
    });
    return obj;
  });

  return jsonResult;
}
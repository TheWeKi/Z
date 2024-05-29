// import xlsx from 'xlsx';
import path from 'path';
import excel from 'exceljs';
// import {logger} from './logger/winston_logger';
// const ExcelJS = require('exceljs');
// import fs from 'fs';

// export function readExcel(fileName: string) {
//   const workbook = xlsx.readFile(
//     path.join(__dirname, '..', '..', '/public/', fileName)
//   );
//   const worksheets: xlsx.WorkSheet = workbook.SheetNames;
//   const data = [];
//   worksheets.forEach((sheetName: string) => {
//     data.push(
//       ...xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
//         raw: true,
//         header: 1,
//       })
//     );
//   });
//   logger.info(`${fileName} parsed successfully`);
//   return data;
// }

// export async function readExcel(fileName: string) {
//   const data = [];

//   var workbook = new ExcelJS.Workbook();
//   await workbook.xlsx
//     .readFile(path.join(__dirname, '..', '..', '/public/', fileName))
//     .then(function () {
//       var worksheet = workbook.getWorksheet('exp_Dec21');
//       worksheet.eachRow({includeEmpty: true}, function (row, rowNumber) {
//         console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
//         data.push(row.values);
//       });
//     });
//   logger.info(`${fileName} parsed successfully`);
//   return data;
// }

export async function readExcel(fileName) {
  const workbook = new excel.Workbook();
  // use readFile for testing purpose
  // await workbook.xlsx.load(objDescExcel.buffer);
  await workbook.xlsx.readFile(
    path.join(__dirname, '..', '..', '/public/', fileName)
  );
  console.info('Completed reading file from xlsx');
  const data = [];
  workbook.worksheets.forEach((sheet) => {
    // read first row as data keys
    const firstRow = sheet.getRow(1);
    if (!firstRow.cellCount) return;
    const keys = firstRow.values;
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const values = row.values;
      const obj = {};
      for (let i = 1; i < keys.length; i++) {
        obj[keys[i]] = values[i];
      }
      data.push(obj);
    });
  });
  console.info(`FOUND ${data.length} ROWS IN ${fileName}`);
  return data;
}

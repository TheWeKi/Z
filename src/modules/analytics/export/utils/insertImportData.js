
import { HttpException } from "../../../../handlers/HttpException.js";
import { Import } from "../import.model.js";

async function insertImportData(importData) {
    const chunkSize = 10000;
    for (let i = 0; i < importData.length; i += chunkSize) {
        const chunk = importData.slice(i, i + chunkSize);
        try {
            await Import.insertMany(chunk);
            console.log(`Inserted ${chunk.length} documents`);
            await new Promise(resolve => setTimeout(resolve,1000));
        } catch (error) {
            // throw HttpException(res, 500, 'Error Inserting Import Data', {});
            console.log(error);
            // Handle the error appropriately here
        }
    }
}


export { insertImportData };

// import { HttpException } from "../../../../handlers/HttpException.js";
// import { Import } from "../import.model.js";

// async function insertImportData(importData) {
//     const chunkSize = 1000; // Experiment with different chunk sizes
//     const bulkInsertPromises = [];

//     for (let i = 0; i < importData.length; i += chunkSize) {
//         const chunk = importData.slice(i, i + chunkSize);
//         bulkInsertPromises.push(Import.insertMany(chunk));
//     }

//     try {
//         await Promise.all(bulkInsertPromises);
//         console.log(`Inserted ${importData.length} documents`);
//     } catch (error) {
//         throw HttpException(res, 500, 'Error Inserting Import Data', {});
//     }
// }

// export { insertImportData };


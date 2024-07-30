
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
            console.log(error)
        }
    }
}

export { insertImportData }

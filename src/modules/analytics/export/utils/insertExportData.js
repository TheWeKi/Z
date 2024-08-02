
import { Export } from "../export.model.js";

async function insertExportData(exportData) {
    const chunkSize = 10000;
    for (let i = 0; i < exportData.length; i += chunkSize) {
        const chunk = exportData.slice(i, i + chunkSize);
        try {
            await Export.insertMany(chunk);
            console.log(`Inserted ${chunk.length} documents`);
            await new Promise(resolve => setTimeout(resolve,1000));
        } catch (error) {
            console.log(error);
        }
    }
}

export { insertExportData }

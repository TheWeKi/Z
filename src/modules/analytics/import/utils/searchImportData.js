import { Import } from '../import.model.js'

export const fetchImportData = async (validated_req, all) => {
    const { search_text, pagination, filters, duration } = validated_req;
    const { hs_code, product_name } = search_text;
    const { start_date, end_date } = duration;
    const { page_index, page_size } = pagination;

    const skip = (page_index - 1) * page_size;

    let searchResult;

    const query = {
        HS_Code: hs_code ? hs_code : '',
        Item_Description: product_name ? { $regex: new RegExp(product_name, 'i') } : '',

        Importer_Name: filters && filters.buyer_name ? { $regex: new RegExp(filters.buyer_name, 'i') } : '',
        Supplier_Name: filters && filters.supplier_name ? { $regex: new RegExp(filters.supplier_name, 'i') } : '',
        Indian_Port: filters && filters.port_code ? { $regex: new RegExp(filters.port_code, 'i') } : '',
        UQC: filters && filters.unit ? { $regex: new RegExp(filters.unit, 'i') } : '',
        Country: filters && filters.country ? { $regex: new RegExp(filters.country, 'i') } : '',

        Date: { $gte: start_date, $lte: end_date }
    };

    Object.keys(query).forEach((key) => {
        if (!query[key] || (query[key].$regex && query[key].$regex.source === "(?:)")) {
            delete query[key];
        }
    });

    if(query.HS_Code && query.Item_Description) {
        delete query.Item_Description;
    }

    searchResult = await Import.find(query).skip(skip).limit(parseInt(page_size));

    if(!all) {
        return searchResult.map((item) => {
            const { Item_Description, HS_Code, Quantity, UQC, Country, Date } = item;
            return { Item_Description, HS_Code, Quantity, UQC, Country, Date };
        });
    }
    return searchResult;
}
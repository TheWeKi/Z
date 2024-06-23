import { Import } from '../import.model.js'

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export const fetchImportData = async (validated_req, all) => {
    const { search_text, pagination, filters, duration } = validated_req;
    const { hs_code, product_name } = search_text;
    const { start_date, end_date } = duration;
    const { page_index, page_size } = pagination;

    const skip = (page_index - 1) * page_size;

    let searchResult;

    const query = {
        HS_Code: hs_code ? { $regex: new RegExp('^' + hs_code, 'i') } : '',
        Item_Description: product_name ? { $regex: new RegExp(escapeRegExp(product_name), 'i') } : '',

        Buyer_Name: filters && filters.buyer_name ? { $regex: new RegExp(escapeRegExp(filters.buyer_name), 'i') } : '',
        Exporter_Name: filters && filters.supplier_name ? { $regex: new RegExp(escapeRegExp(filters.supplier_name), 'i') } : '',
        Port_of_Loading: filters && filters.port_code ? { $regex: new RegExp(escapeRegExp(filters.port_code), 'i') } : '',
        UQC: filters && filters.unit ? { $regex: new RegExp(escapeRegExp(filters.unit), 'i') } : '',
        Country: filters && filters.country ? { $regex: new RegExp(escapeRegExp(filters.country), 'i') } : '',

        Date: { $gte: start_date, $lte: end_date }
    };

    Object.keys(query).forEach((key) => {
        if (!query[key] || (query[key].$regex && query[key].$regex.source === "(?:)")) {
            delete query[key];
        }
    });

    // if(query.HS_Code && query.Item_Description) {
    //     delete query.Item_Description;
    // }

    searchResult = await Import.find(query).skip(skip).limit(parseInt(page_size));

    if(!all) {
        searchResult = searchResult.map((item) => {
            const { Item_Description, HS_Code, Quantity, UQC, Country, Date } = item;
            return { Item_Description, HS_Code, Quantity, UQC, Country, Date };
        });
    }

    const total_records = await Import.countDocuments(query);

    return {
        searchResult, 
        subscription: false,
        pagination: { 
            page_index: parseInt(page_index), 
            page_size: parseInt(page_size),
            total_pages: Math.ceil(total_records / page_size),
            total_records
        }
    };
}
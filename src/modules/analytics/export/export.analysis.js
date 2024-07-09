import { Import } from './import.model.js';
import {HttpException} from "../../../handlers/HttpException.js";
import {search_import} from "./model.js";

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const generateQuery = (validated_req) => {

    const { search_text, filters, duration } = validated_req;
    const { hs_code, product_name } = search_text;
    const { start_date, end_date } = duration;

    const query = {
        HS_Code: hs_code ? { $regex: new RegExp('^' + hs_code, 'i') } : '',
        Item_Description: product_name ? { $regex: new RegExp(escapeRegExp(product_name), 'i') } : '',

        Importer_Name: filters && filters.buyer_name ? { $regex: new RegExp(escapeRegExp(filters.buyer_name), 'i') } : '',
        Supplier_Name: filters && filters.supplier_name ? { $regex: new RegExp(escapeRegExp(filters.supplier_name), 'i') } : '',
        Indian_Port: filters && filters.port_code ? { $regex: new RegExp(escapeRegExp(filters.port_code), 'i') } : '',
        UQC: filters && filters.unit ? { $regex: new RegExp(escapeRegExp(filters.unit), 'i') } : '',
        Country: filters && filters.country ? { $regex: new RegExp(escapeRegExp(filters.country), 'i') } : '',

        Date: { $gte: start_date, $lte: end_date }
    };

    Object.keys(query).forEach((key) => {
        if (!query[key] || (query[key].$regex && query[key].$regex.source === "(?:)")) {
            delete query[key];
        }
    });

    return query;
}

const sortAnalysis = async (req, res) => {

    const validation = search_import.validate(req.body);
    if (validation.error)
        return HttpException(
            res,
            400,
            validation.error.details[0].message,
            {}
        );
    const validated_req = validation.value;

    const query = generateQuery(validated_req);

    try {
        const pipeline = [
            {
                $match: query,
            },
            {
                $group: {
                    _id: null,
                    Country: { $addToSet: '$Country' },
                    Exporter_Name: { $addToSet: '$Exporter_Name' },
                    Port_of_Loading: { $addToSet: '$Port_of_Loading' },
                    Port_of_Discharge: { $addToSet: '$Port_of_Discharge' },
                    Buyer_Name: { $addToSet: '$Buyer_Name' },
                    // Add more fields as needed
                },
            },
            {
                $project: {
                    _id: 0,
                    Country: { $size: '$Country' },
                    Exporter_Name: { $size: '$Exporter_Name' },
                    Port_of_Loading: { $size: '$Port_of_Loading' },
                    Port_of_Discharge: { $size: '$Port_of_Discharge' },
                    Buyer_Name: { $size: '$Buyer_Name' },
                    // Add more fields as needed
                },
            }
        ]
        const totalShipments = await Import.countDocuments(query);
        const data = await Import.aggregate(pipeline);

        const responseData = {
            Total_Shipments: totalShipments,
            ...data[0]
        }
        res.status(200).json(responseData);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

function generatePipeline(field, query, uniqueMatch) {
    return  [
        {
            $match: { $and: [query, uniqueMatch] }, // Filter documents that match the combined criteria
        },
        {
            $group: {
                _id: `$${field}`, // Group by the "country" field
                count: { $sum: 1 }, // Count the number of documents in each group
            },
        },
        {
            $project: {
                _id: 0, // Exclude the original "_id" field from the output
                data: "$_id", // Rename the group's "_id" field to "country"
                count: 1, // Keep the count field
            },
        },
        {
            $sort: { count: -1 },
        }
    ];
}

const detailAnalysis = async (req, res) => {
    const validation = search_import.validate(req.body);
    if (validation.error)
        return HttpException(
            res,
            400,
            validation.error.details[0].message,
            {}
        );
    const validated_req = validation.value;

    const query = generateQuery(validated_req);

    const {
        countryPipeline,
        buyerPipeline,
        exporterPipeline,
        portOfLoadingPipeline,
        portOfDischargePipeline
    } = getDetailAnalysisDataPipelines(query, generatePipeline);

    try {

        const countries = await Import.aggregate(countryPipeline);
        const buyers = await Import.aggregate(buyerPipeline);
        const exporters = await Import.aggregate(exporterPipeline);
        const portOfLoading = await Import.aggregate(portOfLoadingPipeline);
        const portOfDischarge = await Import.aggregate(portOfDischargePipeline);

        res.json({ countries, buyers, exporters, portOfLoading, portOfDischarge });

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

function generateUSDPipeline(field, query, uniqueMatch) {
    return  [
        {
            $match: { $and: [query, uniqueMatch] }, // Filter documents that match the combined criteria
        },
        {
            $group: {
                _id: `$${field}`, // Group by the "country" field
                total_value: { $sum: '$Total_Value_USD' }, // Count the number of documents in each group
            },
        },
        {
            $project: {
                _id: 0, // Exclude the original "_id" field from the output
                data: "$_id", // Rename the group's "_id" field to "country"
                total_value: 1, // Keep the count field
            },
        },
        {
            $sort: { total_value: -1 },
        }
    ];
}

const detailAnalysisUSD = async (req, res) => {
    const validation = search_import.validate(req.body);
    if (validation.error)
        return HttpException(
            res,
            400,
            validation.error.details[0].message,
            {}
        );
    const validated_req = validation.value;

    const query = generateQuery(validated_req);

    const {
        countryPipeline,
        buyerPipeline,
        exporterPipeline,
        portOfLoadingPipeline,
        portOfDischargePipeline
    } = getDetailAnalysisDataPipelines(query, generateUSDPipeline);

    try {

        const countries = await Import.aggregate(countryPipeline);
        const buyers = await Import.aggregate(buyerPipeline);
        const exporters = await Import.aggregate(exporterPipeline);
        const portOfLoading = await Import.aggregate(portOfLoadingPipeline);
        const portOfDischarge = await Import.aggregate(portOfDischargePipeline);

        res.json({ countries, buyers, exporters, portOfLoading, portOfDischarge });

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

function getDetailAnalysisDataPipelines(query, pipelineGenerator) {
    const uniqueCountryMatch = { Country: { $exists: true } };
    const uniqueBuyerMatch = { Buyer_Name: { $exists: true } };
    const uniqueExporterMatch = { Exporter_Name: { $exists: true } };
    const uniquePortOfLoadingMatch = { Port_of_Loading: { $exists: true } };
    const uniquePortOfDischargeMatch = { Port_of_Discharge: { $exists: true } };

    const countryPipeline = pipelineGenerator('Country', query, uniqueCountryMatch);
    const buyerPipeline = pipelineGenerator('Buyer_Name', query, uniqueBuyerMatch);
    const exporterPipeline = pipelineGenerator('Exporter_Name', query, uniqueExporterMatch);
    const portOfLoadingPipeline = pipelineGenerator('Port_of_Loading', query, uniquePortOfLoadingMatch);
    const portOfDischargePipeline = pipelineGenerator('Port_of_Discharge', query, uniquePortOfDischargeMatch);

    return {
        countryPipeline,
        buyerPipeline,
        exporterPipeline,
        portOfLoadingPipeline,
        portOfDischargePipeline
    }
}

export { sortAnalysis, detailAnalysis, detailAnalysisUSD };
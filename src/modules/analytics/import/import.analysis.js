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
                        Importer_Name: { $addToSet: '$Importer_Name' },
                        Port_Of_Shipment: { $addToSet: '$Port_Of_Shipment'},
                        Indian_Port: { $addToSet: '$Indian_Port'},
                        // Add more fields as needed
                    },
                },
                {
                    $project: {
                        _id: 0,
                        Country: { $size: '$Country' },
                        Importer_Name: { $size: '$Importer_Name' },
                        Port_Of_Shipment: { $size: '$Port_Of_Shipment'},
                        Indian_Port: { $size: '$Indian_Port'},
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

    try {
        const uniqueCountryMatch = { Country: { $exists: true } };
        const uniqueImporterMatch = { Importer_Name: { $exists: true } };
        const uniquePortMatch = { Indian_Port: { $exists: true } };
        const uniquePortShipmentMatch = { Port_Of_Shipment: { $exists: true } };
        const uniqueSupplierMatch = { Supplier_Name: { $exists: true } };

        const importers_pipeline = generatePipeline('Importer_Name', query, uniqueImporterMatch);
        const countries_pipeline = generatePipeline('Country', query, uniqueCountryMatch);
        const ports_pipeline = generatePipeline('Indian_Port', query, uniquePortMatch);
        const portShipment_pipeline = generatePipeline('Port_Of_Shipment', query, uniquePortShipmentMatch);
        const supplier_pipeline = generatePipeline('Supplier_Name', query, uniqueSupplierMatch);

        const importers = await Import.aggregate(importers_pipeline);
        const countries = await Import.aggregate(countries_pipeline);
        const ports = await Import.aggregate(ports_pipeline);
        const portShipment = await Import.aggregate(portShipment_pipeline);
        const suppliers = await Import.aggregate(supplier_pipeline);

        res.status(200).json({
            Importers: importers,
            Countries: countries,
            Ports: ports,
            Suppliers: suppliers,
            Port_Of_Shipment: portShipment
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export { sortAnalysis, detailAnalysis };
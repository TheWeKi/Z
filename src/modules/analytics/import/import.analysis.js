import { Import } from './import.model.js';
import {HttpException} from "../../../handlers/HttpException.js";
import {search_import} from "./model.js";
import jwt from "jsonwebtoken";
import {Customer} from "../../user/customer.model.js";

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

    const subscription = await checkSubscription(res,req.user.id, validated_req);
    if (!subscription) return HttpException(res, 400, "Invalid Subscription");

    const query = generateQuery(validated_req);
    console.log(query);
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
                        Supplier_Name: { $addToSet: '$Supplier_Name'}
                        // Add more fields as needed
                    },
                },
                {
                    $project: {
                        _id: 0,
                        Country: { $size: '$Country' },
                        Importer: { $size: '$Importer_Name' },
                        Port_Of_Shipment: { $size: '$Port_Of_Shipment'},
                        Indian_Port: { $size: '$Indian_Port'},
                        Exporter: { $size: '$Supplier_Name'}
                        // Add more fields as needed
                    },
                }
            ]
        // const totalShipments = await Import.estimatedDocumentCount(query);
        // const data = await Import.aggregate(pipeline);

        const [totalShipments, data] = await Promise.all([
            Import.estimatedDocumentCount(query).lean(),
            Import.aggregate(pipeline).exec()
        ]);
            

        const responseData = {
            Shipments: totalShipments,
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

async function checkSubscription(res, id, validated_req) {
    const customer= await Customer.findOne({_id:id});
    console.log(" izm hedhjkshdkjahda ");
    if (!customer) return false;

    if (
        !( customer.hsn_codes &&
        customer.hsn_codes.length > 0 &&
        // customer.hsn_codes.includes(validated_req.search_text.hs_code) &&
        isSubscribedHSCode(customer, validated_req.search_text.hs_code) &&
        new Date(customer.hsn_codes_valid_upto) >= new Date() )
      ) return false;

      return true;
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

    const subscription = await checkSubscription(res,req.user.id, validated_req);
    if (!subscription) return HttpException(res, 400, "Invalid Subscription");

    
    const query = generateQuery(validated_req);

    const pipeline =[
            {
                $match: query, // Filter documents that match the query
            },
            {
                $facet: {
                    importers: [
                        { $match: { Importer_Name: { $exists: true } } },
                        { $group: { _id: "$Importer_Name", count: { $sum: 1 } } },
                        { $project: { _id: 0, data: "$_id", count: 1 } },
                        { $sort: { count: -1 } }
                    ],
                    countries: [
                        { $match: { Country: { $exists: true } } },
                        { $group: { _id: "$Country", count: { $sum: 1 } } },
                        { $project: { _id: 0, data: "$_id", count: 1 } },
                        { $sort: { count: -1 } }
                    ],
                    ports: [
                        { $match: { Indian_Port: { $exists: true } } },
                        { $group: { _id: "$Indian_Port", count: { $sum: 1 } } },
                        { $project: { _id: 0, data: "$_id", count: 1 } },
                        { $sort: { count: -1 } }
                    ],
                    portShipment: [
                        { $match: { Port_Of_Shipment: { $exists: true } } },
                        { $group: { _id: "$Port_Of_Shipment", count: { $sum: 1 } } },
                        { $project: { _id: 0, data: "$_id", count: 1 } },
                        { $sort: { count: -1 } }
                    ],
                    suppliers: [
                        { $match: { Supplier_Name: { $exists: true } } },
                        { $group: { _id: "$Supplier_Name", count: { $sum: 1 } } },
                        { $project: { _id: 0, data: "$_id", count: 1 } },
                        { $sort: { count: -1 } }
                    ]
                }
            }
        ];

    // const {
    //     countries_pipeline,
    //     importers_pipeline,
    //     ports_pipeline,
    //     portShipment_pipeline,
    //     supplier_pipeline
    // } = getDetailAnalysisDataPipelines(query, generatePipeline);

    try {

        // const importers = await Import.aggregate(importers_pipeline);
        // const countries = await Import.aggregate(countries_pipeline);
        // const ports = await Import.aggregate(ports_pipeline);
        // const portShipment = await Import.aggregate(portShipment_pipeline);
        // const suppliers = await Import.aggregate(supplier_pipeline);

        // res.status(200).json({
        //     Importer: importers,
        //     Country: countries,
        //     Port_of_Discharge: ports,
        //     Exporter: suppliers,
        //     Port_of_Loading: portShipment
        // });

        const data = await Import.aggregate(pipeline);
        res.json(data[0]);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
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

    const subscription = await checkSubscription(res, req.user.id, validated_req);
    if (!subscription) return HttpException(res, 400, "Invalid Subscription");

    const query = generateQuery(validated_req);

    const {
        countries_pipeline,
        importers_pipeline,
        ports_pipeline,
        portShipment_pipeline,
        supplier_pipeline
    } = getDetailAnalysisDataPipelines(query, generateUSDPipeline);

    try {
        const importers = await Import.aggregate(importers_pipeline);
        const countries = await Import.aggregate(countries_pipeline);
        const ports = await Import.aggregate(ports_pipeline);
        const portShipment = await Import.aggregate(portShipment_pipeline);
        const suppliers = await Import.aggregate(supplier_pipeline);

        res.status(200).json({
            Importer: importers,
            Country: countries,
            Port_of_Discharge: ports,
            Exporter: suppliers,
            Port_of_Loading: portShipment
        });
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
                count: { $sum: '$Total_Value_USD' }, // Count the number of documents in each group
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

function getDetailAnalysisDataPipelines(query, pipelineGenerator) {
    const uniqueCountryMatch = { Country: { $exists: true } };
    const uniqueImporterMatch = { Importer_Name: { $exists: true } };
    const uniquePortMatch = { Indian_Port: { $exists: true } };
    const uniquePortShipmentMatch = { Port_Of_Shipment: { $exists: true } };
    const uniqueSupplierMatch = { Supplier_Name: { $exists: true } };

    const importers_pipeline = pipelineGenerator('Importer_Name', query, uniqueImporterMatch);
    const countries_pipeline = pipelineGenerator('Country', query, uniqueCountryMatch);
    const ports_pipeline = pipelineGenerator('Indian_Port', query, uniquePortMatch);
    const portShipment_pipeline = pipelineGenerator('Port_Of_Shipment', query, uniquePortShipmentMatch);
    const supplier_pipeline = pipelineGenerator('Supplier_Name', query, uniqueSupplierMatch);

    return {
        importers_pipeline,
        countries_pipeline,
        ports_pipeline,
        portShipment_pipeline,
        supplier_pipeline
    }
}

function isSubscribedHSCode(customer, hs_code) {
    for (let code of customer.hsn_codes) {
        if (hs_code.startsWith(code)) {
            return true;
        }
    }
    return false;
}

export { sortAnalysis, detailAnalysis, detailAnalysisUSD };
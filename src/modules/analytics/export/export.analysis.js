import { Export } from './export.model.js';
import { HttpException } from "../../../handlers/HttpException.js";
import { Customer } from "../../user/customer.model.js";
import { exportQuery } from './utils/exportQuery.js';


async function checkSubscription(res, id, validated_req) {
    const customer= await Customer.findById(id);

    if (!customer) return false;

    return (
        customer.export_hsn_codes &&
        customer.export_hsn_codes.length > 0 &&
        isSubscribedHSCode(customer, validated_req.search_text.hs_code) &&
        new Date(customer.export_hsn_codes_valid_upto) >= new Date()
    )
}

function isSubscribedHSCode(customer, hs_code) {
    for (let code of customer.export_hsn_codes) {
        if (hs_code.startsWith(code)) {
            return true;
        }
    }
    return false;
}

const sortAnalysis = async (req, res) => {

    const validated_req = req.validated_req;

    const subscription = await checkSubscription(req.user.id, validated_req);
    if (!subscription) return HttpException(res, 400, "Invalid Subscription");

    const query = exportQuery(validated_req);

    try {
        const pipeline = [
            {
                $match: query,
            },
            {

                $group: {
                    _id: null,
                    Country: {$addToSet: '$Country'},
                    Exporter_Name: {$addToSet: '$Exporter_Name'},
                    Port_of_Loading: {$addToSet: '$Port_of_Loading'},
                    Port_of_Discharge: {$addToSet: '$Port_of_Discharge'},
                    Buyer_Name: {$addToSet: '$Buyer_Name'}
                },
            },
            {
                $project: {
                    _id: 0,
                    Country: {$size: '$Country'},
                    Exporter: {$size: '$Exporter_Name'},
                    Port_of_Loading: {$size: '$Port_of_Loading'},
                    Port_of_Discharge: {$size: '$Port_of_Discharge'},
                    Importer: {$size: '$Buyer_Name'},
                },
            }
        ]

        // const totalShipments = await Export.estimatedDocumentCount(query);
        // const data = await Export.aggregate(pipeline);

        const [totalShipments, data] = await Promise.all([
            Export.estimatedDocumentCount(query),
            Export.aggregate(pipeline).exec()
        ]);

        const responseData = {
            Shipments: totalShipments,
            ...data[0]
        }
        res.status(200).json(responseData);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

const detailAnalysis = async (req, res) => {

    const validated_req = req.validated_req;

    const subscription = await checkSubscription(req.user.id, validated_req);
    if (!subscription) return HttpException(res, 400, "Invalid Subscription");

    const query = exportQuery(validated_req);

    const pipeline = [
        {
            $match: query,
        },
        {
            $facet: {
                countries: [
                    { $group: { _id: "$Country", count: { $sum: 1 } } },
                    { $project: { _id: 0, data: "$_id", count: 1 } },
                    { $sort: { count: -1 } }
                ],
                buyers: [
                    { $group: { _id: "$Buyer_Name", count: { $sum: 1 } } },
                    { $project: { _id: 0, data: "$_id", count: 1 } },
                    { $sort: { count: -1 } }
                ],
                exporters: [
                    { $group: { _id: "$Exporter_Name", count: { $sum: 1 } } },
                    { $project: { _id: 0, data: "$_id", count: 1 } },
                    { $sort: { count: -1 } }
                ],
                portOfLoading: [
                    { $group: { _id: "$Port_of_Loading", count: { $sum: 1 } } },
                    { $project: { _id: 0, data: "$_id", count: 1 } },
                    { $sort: { count: -1 } }
                ],
                portOfDischarge: [
                    { $group: { _id: "$Port_of_Discharge", count: { $sum: 1 } } },
                    { $project: { _id: 0, data: "$_id", count: 1 } },
                    { $sort: { count: -1 } }
                ]
            }
        }
    ]

    try {
        const data = await Export.aggregate(pipeline);
        res.json(data[0]);
    } catch (error) {
        return HttpException(res, 404, error, {});
    }
}

const detailAnalysisUSD = async (req, res) => {

    const validated_req = req.validated_req;

    const subscription = await checkSubscription(req.user.id, validated_req);
    if (!subscription) return HttpException(res, 400, "Invalid Subscription");

    const query = exportQuery(validated_req);

    const pipeline = [
        {
            $match: query,
        },
        {
            $facet: {
                countries: [
                    { $group: { _id: "$Country", count: { $sum: "$Total_Value_USD" } } },
                    { $project: { _id: 0, data: "$_id", count: 1 } },
                    { $sort: { count: -1 } }
                ],
                buyers: [
                    { $group: { _id: "$Buyer_Name", count: { $sum: "$Total_Value_USD" } } },
                    { $project: { _id: 0, data: "$_id", count: 1 } },
                    { $sort: { count: -1 } }
                ],
                exporters: [
                    { $group: { _id: "$Exporter_Name", count: { $sum: "$Total_Value_USD" } } },
                    { $project: { _id: 0, data: "$_id", count: 1 } },
                    { $sort: { count: -1 } }
                ],
                portOfLoading: [
                    { $group: { _id: "$Port_of_Loading", count: { $sum: "$Total_Value_USD" } } },
                    { $project: { _id: 0, data: "$_id", count: 1 } },
                    { $sort: { count: -1 } }
                ],
                portOfDischarge: [
                    { $group: { _id: "$Port_of_Discharge", count: { $sum: "$Total_Value_USD" } } },
                    { $project: { _id: 0, data: "$_id", count: 1 } },
                    { $sort: { count: -1 } }
                ]
            }
        }
    ]

    try {
        const data = await Export.aggregate(pipeline);
        res.json(data[0]);
    } catch (error) {
        return HttpException(res, 404, error, {});
    }
}

export { sortAnalysis, detailAnalysis, detailAnalysisUSD }

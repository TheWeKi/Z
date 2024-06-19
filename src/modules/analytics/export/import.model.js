import mongoose from 'mongoose';

const importSchema = new mongoose.Schema({
    Type: { type: String, default: "NA" },
    Shipment_ID: { type: String, default: null },
    Date: { type: Date, default: null },
    Port_of_Loading: { type: String, default: null },
    Mode_of_Shipment: { type: String, default: null },
    Month: { type: String, default: null },
    HS_Code: { type: String, default: null },
    Item_Description: { type: String, default: null },
    Quantity: { type: String, default: null },
    UQC: { type: String, default: null },
    Unit_Rate_In_FC: { type: Number, default: null },
    Currency: { type: String, default: null },
    Unit_Value_USD: { type: Number, default: null },
    Total_Value_USD: { type: Number, default: null },
    Port_of_Discharge: { type: String, default: null },
    Country: { type: String, default: null },
    Buyer_Name: { type: String, default: null },
    Buyer_Address: { type: String, default: null },
    IEC: { type: String, default: null },
    Exporter_Name: { type: String, default: null },
    Exporter_Address: { type: String, default: null },
    Exporter_City_State: { type: String, default: null },
    Exporter_PIN: { type: String, default: null },
    Exporter_Phone: { type: String, default: null },
    Exporter_Mail: { type: String, default: null },
    Exporter_Contact_Person_1: { type: String, default: null },
    Exporter_Contact_Person_2: { type: String, default: null }
},
{timestamps: true}
);

export const Import = mongoose.model('Export', importSchema);
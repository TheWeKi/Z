import mongoose from 'mongoose';

const importSchema = new mongoose.Schema({
    Type: { type: String, default: "NA" },
    Indian_Port: { type: String, default: "NA" },
    Mode_Of_Shipment: { type: String, default: "NA" },
    Shipment_ID: { type: String, default: "NA" },
    Date: { type: Date, default: null },
    BE_Type: { type: String, default: "NA" },
    AG: { type: String, default: "NA" },
    Month: { type: String, default: "NA" },
    HS_Code: { type: String, default: "NA" },
    Country: { type: String, default: "NA" },
    Item_Description: { type: String, default: "NA" },
    Invoice_Currency: { type: String, default: "NA" },
    Invoice_Unit_Price_FC: { type: String, default: "NA" },
    Quantity: { type: Number, default: null },
    UQC: { type: String, default: "NA" },
    Unit_Price_USD: { type: Number, default: null },
    Total_Value_USD: { type: Number, default: null },
    Total_Duty_USD: { type: Number, default: null },
    CHA_Name: { type: String, default: "NA" },
    IEC: { type: String, default: "NA" },
    Importer_Name: { type: String, default: "NA" },
    Port_Of_Shipment: { type: String, default: "NA" },
    Supplier_Name: { type: String, default: "NA" },
    Supplier_Address: { type: String, default: "NA" },
    Importer_Address: { type: String, default: "NA" },
    Importer_City_State: { type: String, default: "NA" },
    Importer_PIN: { type: String, default: "NA" },
    Importer_Phone: { type: String, default: "NA" },
    Importer_Mail: { type: String, default: "NA" },
    Importer_Contact_Person_1: { type: String, default: "NA" },
    Importer_Contact_Person_2: { type: String, default: "NA" },
},
    { timestamps: true }
);

export const Import = mongoose.model('Import', importSchema);
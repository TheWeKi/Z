import mongoose from 'mongoose';

const buyerSchema = new mongoose.Schema({
    Company_Name: { type: String, default: "NA" },
    About_Us: { type: String, default: null },
    Contact_Person: { type: String, default: null },
    Designation: { type: String, default: null },
    Email_Id: { type: String, default: null },
    Contact_Number: { type: String, default: null },
    Address: { type: String, default: null },
    Country: { type: String, default: null },
    Platform: { type: String, default: null },
    Certification: { type: Number, default: null }
},
{timestamps: true}
);

export const Buyer = mongoose.model('Buyer', buyerSchema);
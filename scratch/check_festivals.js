const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../Backend/.env') });

const Festival = require('../Backend/src/models/Festival');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const festivals = await Festival.find({});
        console.log(`Found ${festivals.length} festivals`);

        festivals.forEach(f => {
            if (!f.adminId) {
                console.log(`Festival ${f._id} is missing adminId`);
            } else if (!mongoose.Types.ObjectId.isValid(f.adminId)) {
                console.log(`Festival ${f._id} has invalid adminId: ${f.adminId}`);
            }
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

checkData();

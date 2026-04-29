const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('node:dns');
dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();

const Festival = require('./models/Festival');

async function checkData() {
    try {
        console.log("URI:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const festivals = await Festival.find({});
        console.log(`Found ${festivals.length} festivals`);

        festivals.forEach(f => {
            console.log(`Festival: ${f.name} (_id: ${f._id})`);
            if (!f.adminId) {
                console.log(`  MISSING adminId`);
            } else if (!mongoose.Types.ObjectId.isValid(f.adminId)) {
                console.log(`  INVALID adminId: ${f.adminId}`);
            } else {
                console.log(`  adminId: ${f.adminId}`);
            }
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

checkData();

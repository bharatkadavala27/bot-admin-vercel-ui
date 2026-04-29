const express = require("express");
const dotenv = require("dotenv");
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const cors = require("cors");
const connectDB = require("./src/config/db");
const { notFound, errorHandler } = require("./src/middleware/error.middleware");

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Body parser
app.use(express.json());


// Enable CORS
app.use(
    cors({
        origin: "*",
        credentials: true,
    }),
);

// Mount routers
app.use("/api/users", require("./src/routes/user_routes"));
app.use("/api/departments", require("./src/routes/department_routes"));
app.use("/api/branches", require("./src/routes/branch_routes"));
app.use("/api/attendance", require("./src/routes/attendance_routes"));
app.use("/api/salary", require("./src/routes/salary_routes"));
app.use("/api/tickets", require("./src/routes/ticket_routes"));
app.use("/api/shifts", require("./src/routes/shift_routes"));
app.use("/api/tracking", require("./src/routes/tracking_routes"));
app.use("/api/dashboard", require("./src/routes/dashboard_routes"));
app.use("/api/leave-types", require("./src/routes/leave_type_routes"));
app.use("/api/festivals", require("./src/routes/festival_routes"));
app.use("/api/expenses", require("./src/routes/expense_routes"));
app.use("/api/assets", require("./src/routes/asset_routes"));
app.use("/api/asset-categories", require("./src/routes/asset_category_routes"));
app.use("/api/announcements", require("./src/routes/announcement_routes"));
app.use("/api/leads", require("./src/routes/lead_routes"));


// Base route
app.get("/", (req, res) => {
    res.send("HRMS API is running...");
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;

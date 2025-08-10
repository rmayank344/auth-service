const express = require("express");
const app = express();
const cors = require('cors');
const os = require('os');
const {connectRedis} = require("./config/redis_config");
// require("dotenv").config();
require("./config/db_config");


// Redis Call
// connectRedis();


app.use(express.json({ limit: '5mb'}));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Add Health Check Route for Default Target Group (/)
app.get('/', (req, res) => {
  res.status(200).send('Default Route Healthy');
});

// Add Health Check Route for Target Group admin-role (/api/admin_role/health)
app.get('/api/admin_role/health', (req, res) => {
  res.status(200).send('Admin Role Service Healthy');
});

// Add Health Check Route for Target Group user-role (/api/user_role/health)
app.get('/api/user/v1/auth-service', (req, res) => {
  res.status(200).send('Auth-Service Role Healthy');
});



app.use((req, res, next) => {
  console.log(`Handled by Worker PID: ${process.pid}, Host: ${os.hostname()}, URL: ${req.url}`);
  next();
});

// If you want to allow only your frontend domain
app.use(cors({
  origin: "*", // You can replace * with your frontend domain for security
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-api-key",
    "x-auth-token",
    "x-refresh-token",
    "admin-auth-token",
    "admin-refresh-token",
    "cust-x-api-key"
  ]
}));

//auth-service routes
app.use('/api/user/v1/auth-service', require("./routes/user_routes"));


module.exports = app;
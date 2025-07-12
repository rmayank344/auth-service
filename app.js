const express = require("express");
const app = express();
const cors = require('cors');
const {connectRedis} = require("./config/redis_config");
require("dotenv").config();
require("./config/db_config");


// Redis Call
// connectRedis();


app.use(express.json({ limit: '5mb'}));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

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


app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
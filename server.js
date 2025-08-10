// const cluster = require('cluster');
// const os = require('os');
// const app = require("./app");
// const http = require('http');
// require("dotenv").config();

// const numCPUs = os.cpus().length;
// console.log(`Total cpu core of this  server: ${numCPUs}`);
// const PORT = process.env.PORT;

// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);

//   // Fork workers
//   for (let i = 0; i < numCPUs; i++) {
//     const worker = cluster.fork();
//     console.log(`Worker ${worker.process.pid}`);
//   }

//   // If a worker dies, log and fork a new one
//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`Worker ${worker.process.pid} died. Forking a new one...`);
//     cluster.fork();
//   });

// } else {
//   // Worker processes
//   app.listen(PORT, '0.0.0.0', () => {
//     console.log(`Worker ${process.pid} started on port ${PORT}`);
//   });
// }
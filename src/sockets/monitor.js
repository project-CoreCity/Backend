const { socketAuth } = require("../middlewares/socketAuth");
const {
  getCpuMetrics,
  getNetworkMetrics,
  getMemoryMetrics,
  getDiskMetrics,
  getDbCpuMetrics,
  getDbNetworkMetrics,
  getDbMemoryMetrics,
  getDbDiskMetrics,
} = require("../services/prometheus");

const setupMonitoringSocket = (io) => {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    if (!socket.user) {
      console.log(`Unauthenticated client tried to connect: ${socket.id}`);
      socket.disconnect();

      return;
    }

    const serverAddress = socket.handshake.query.address;
    console.log(
      `Authenticated client connected: ${socket.id}, User: ${socket.user.email}`,
    );

    let isPrometheusDataAvailable = true;

    const sendData = async () => {
      try {
        const cpuMetrics = await getCpuMetrics(serverAddress);
        const memoryMetrics = await getMemoryMetrics(serverAddress);
        const networkMetrics = await getNetworkMetrics(serverAddress);
        const diskMetrics = await getDiskMetrics(serverAddress);

        const cpuMetricsDB = await getDbCpuMetrics(serverAddress);
        const memoryMetricsDB = await getDbMemoryMetrics(serverAddress);
        const networkMetricsDB = await getDbNetworkMetrics(serverAddress);
        const diskMetricsDB = await getDbDiskMetrics(serverAddress);

        if (!isPrometheusDataAvailable) {
          isPrometheusDataAvailable = true;
          console.log("Prometheus data is now available");
        }

        socket.emit("monitoringData", {
          cpuMetrics,
          memoryMetrics,
          networkMetrics,
          diskMetrics,
          cpuMetricsDB,
          memoryMetricsDB,
          networkMetricsDB,
          diskMetricsDB,
        });
      } catch (error) {
        if (isPrometheusDataAvailable) {
          isPrometheusDataAvailable = false;
          console.log("Prometheus data is currently unavailable");
        }
        socket.emit("monitoringData", {
          error: "Monitoring data fetch failed",
        });
      }
    };

    const intervalId = setInterval(sendData, 5000);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      clearInterval(intervalId);
    });
  });
};

module.exports = setupMonitoringSocket;

const queryPrometheus = async (query, address) => {
  const response = await fetch(
    `${address}/api/v1/query?query=` + encodeURIComponent(`${query}`),
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();

  return data.data.result[0].value[1];
};

const convertBytes = (bytes) => {
  const byteConversionFactors = {
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
  };

  if (bytes < byteConversionFactors.KB) {
    return `${bytes} Bytes`;
  }

  if (bytes < byteConversionFactors.MB) {
    return `${(bytes / byteConversionFactors.KB).toFixed(2)} KB`;
  }

  if (bytes < byteConversionFactors.GB) {
    return `${(bytes / byteConversionFactors.MB).toFixed(2)} MB`;
  }

  return `${(bytes / byteConversionFactors.GB).toFixed(2)} GB`;
};

const getCpuMetrics = async (address) => {
  const cpuUsageQuery = `100 * (1 - avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[1m])))`;
  const cpuUsageUserQuery = `100 * avg by (instance) (irate(node_cpu_seconds_total{mode="user"}[1m]))`;
  const cpuUsageSystemQuery = `100 * avg by (instance) (irate(node_cpu_seconds_total{mode="system"}[1m]))`;

  const cpuUsage = Math.round(await queryPrometheus(cpuUsageQuery, address));
  const cpuUsageUser = parseFloat(
    await queryPrometheus(cpuUsageUserQuery, address),
  ).toFixed(2);
  const cpuUsageSystem = parseFloat(
    await queryPrometheus(cpuUsageSystemQuery, address),
  ).toFixed(2);

  return {
    mainDisplay: [`${cpuUsage} %`],
    cpuUsageUser: `${cpuUsageUser} %`,
    cpuUsageSystem: `${cpuUsageSystem} %`,
  };
};

const getMemoryMetrics = async (address) => {
  const totalMemoryQuery =
    address === "http://localhost:9090/"
      ? `node_memory_total_bytes`
      : `node_memory_MemTotal_bytes`;
  const memoryUsedQuery =
    address === "http://localhost:9090/"
      ? `(node_memory_total_bytes - node_memory_free_bytes) / node_memory_total_bytes * 100`
      : `(node_memory_MemTotal_bytes - node_memory_MemFree_bytes) / node_memory_MemTotal_bytes * 100`;
  const swapUsedQuery =
    address === "http://localhost:9090/"
      ? `node_memory_swap_used_bytes`
      : `node_memory_SwapTotal_bytes - node_memory_SwapFree_bytes`;
  const memoryFreeQuery =
    address === "http://localhost:9090/"
      ? `node_memory_free_bytes`
      : `node_memory_MemFree_bytes`;

  const memoryUsed = Math.round(
    await queryPrometheus(memoryUsedQuery, address),
  );
  const memoryFree = convertBytes(
    await queryPrometheus(memoryFreeQuery, address),
  );
  const swapUsed = convertBytes(await queryPrometheus(swapUsedQuery, address));
  const totalMemory = convertBytes(
    await queryPrometheus(totalMemoryQuery, address),
  );

  return {
    mainDisplay: [`${memoryUsed}`],
    memoryFree: `${memoryFree}`,
    swapUsed: `${swapUsed}`,
    totalMemory: `${totalMemory}`,
  };
};

const getNetworkMetrics = async (address) => {
  const networkReceivedRateQuery = `sum(rate(node_network_receive_bytes_total[30s]))`;
  const networkTransmitRateQuery = `sum(rate(node_network_transmit_bytes_total[30s]))`;
  const totalNetworkReceivedQuery = `sum(node_network_receive_bytes_total)`;
  const totalNetworkTransmittedQuery = `sum(node_network_transmit_bytes_total)`;

  const networkReceivedRate = convertBytes(
    await queryPrometheus(networkReceivedRateQuery, address),
  );
  const networkTransmitRate = convertBytes(
    await queryPrometheus(networkTransmitRateQuery, address),
  );
  const totalNetworkReceived = convertBytes(
    await queryPrometheus(totalNetworkReceivedQuery, address),
  );
  const totalNetworkTransmitted = convertBytes(
    await queryPrometheus(totalNetworkTransmittedQuery, address),
  );

  return {
    mainDisplay: [`${networkReceivedRate}`, `${networkTransmitRate}`],
    totalNetworkReceived: `${totalNetworkReceived}`,
    totalNetworkTransmitted: `${totalNetworkTransmitted}`,
  };
};

const getDiskMetrics = async (address) => {
  const deviceName = address === "http://localhost:9090/" ? "disk0" : "xvda";

  const readRateQuery = `rate(node_disk_read_bytes_total{device="${deviceName}"}[30s])`;
  const writeRateQuery = `rate(node_disk_written_bytes_total{device="${deviceName}"}[30s])`;
  const readOperationsQuery = `node_disk_reads_completed_total{device="${deviceName}"}`;
  const writeOperationsQuery = `node_disk_writes_completed_total{device="${deviceName}"}`;
  const totalReadQuery = `node_disk_read_bytes_total{device="${deviceName}"}`;
  const totalWrittenQuery = `node_disk_written_bytes_total{device="${deviceName}"}`;
  const totalReadTimeQuery = `node_disk_read_time_seconds_total{device="${deviceName}"}`;
  const totalWriteTimeQuery = `node_disk_write_time_seconds_total{device="${deviceName}"}`;

  const readRate = convertBytes(await queryPrometheus(readRateQuery, address));
  const writeRate = convertBytes(
    await queryPrometheus(writeRateQuery, address),
  );
  const readOperations = await queryPrometheus(readOperationsQuery, address);
  const writeOperations = await queryPrometheus(writeOperationsQuery, address);
  const totalRead = convertBytes(
    await queryPrometheus(totalReadQuery, address),
  );
  const totalWritten = convertBytes(
    await queryPrometheus(totalWrittenQuery, address),
  );

  const readingTime = parseFloat(
    await queryPrometheus(totalReadTimeQuery, address),
  ).toFixed(2);
  const writingTime = parseFloat(
    await queryPrometheus(totalWriteTimeQuery, address),
  ).toFixed(2);

  return {
    mainDisplay: [`${readRate}`, `${writeRate}`],
    readOperations: `${readOperations}`,
    writeOperations: `${writeOperations}`,
    totalRead: `${totalRead}`,
    totalWritten: `${totalWritten}`,
    readingTime: `${readingTime}`,
    writingTime: `${writingTime}`,
  };
};

module.exports = {
  getCpuMetrics,
  getMemoryMetrics,
  getNetworkMetrics,
  getDiskMetrics,
};

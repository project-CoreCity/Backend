const queryPrometheus = async (query, address) => {
  try {
    const response = await fetch(
      `${address}/api/v1/query?query=` + encodeURIComponent(`${query}`),
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    return data.data.result[0].value[1];
  } catch (error) {
    console.error("Error querying Prometheus: ", error);

    return null;
  }
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
  try {
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
  } catch (error) {
    console.error(`Error fetching data from Prometheus:`, error);

    return null;
  }
};

const getMemoryMetrics = async (address) => {
  try {
    const totalMemoryQuery = `node_memory_total_bytes`;
    const memoryUsedQuery = `node_memory_total_bytes - node_memory_free_bytes`;
    const swapUsedQuery = `node_memory_swap_used_bytes`;
    const memoryFreeQuery = `node_memory_free_bytes`;

    const memoryUsed = convertBytes(
      await queryPrometheus(memoryUsedQuery, address),
    );
    const memoryFree = convertBytes(
      await queryPrometheus(memoryFreeQuery, address),
    );
    const swapUsed = convertBytes(
      await queryPrometheus(swapUsedQuery, address),
    );
    const totalMemory = convertBytes(
      await queryPrometheus(totalMemoryQuery, address),
    );

    return {
      mainDisplay: [`${memoryUsed}`],
      memoryFree: `${memoryFree}`,
      swapUsed: `${swapUsed}`,
      totalMemory: `${totalMemory}`,
    };
  } catch (error) {
    console.error(`Error fetching data from Prometheus:`, error);

    return null;
  }
};

const getNetworkMetrics = async (address) => {
  try {
    const networkReceivedRateQuery = `sum(rate(node_network_receive_bytes_total[10s]))`;
    const networkTransmitRateQuery = `sum(rate(node_network_transmit_bytes_total[10s]))`;
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
  } catch (error) {
    console.error(`Error fetching data from Prometheus:`, error);

    return null;
  }
};

const getDiskMetrics = async (address) => {
  try {
    const readRateQuery = `rate(node_disk_read_bytes_total{device="disk0"}[10s])`;
    const writeRateQuery = `rate(node_disk_written_bytes_total{device="disk0"}[10s])`;
    const readOperationsQuery = `node_disk_reads_completed_total{device="disk0"}`;
    const writeOperationsQuery = `node_disk_writes_completed_total{device="disk0"}`;
    const totalReadQuery = `node_disk_read_bytes_total{device="disk0"}`;
    const totalWrittenQuery = `node_disk_written_bytes_total{device="disk0"}`;
    const totalReadTimeQuery = `node_disk_read_time_seconds_total{device="disk0"}`;
    const totalWriteTimeQuery = `node_disk_write_time_seconds_total{device="disk0"}`;

    const readRate = convertBytes(
      await queryPrometheus(readRateQuery, address),
    );
    const writeRate = convertBytes(
      await queryPrometheus(writeRateQuery, address),
    );
    const readOperations = await queryPrometheus(readOperationsQuery, address);
    const writeOperations = await queryPrometheus(
      writeOperationsQuery,
      address,
    );
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
  } catch (error) {
    console.error(`Error fetching data from Prometheus:`, error);

    return null;
  }
};

const getDbCpuMetrics = async (address) => {
  try {
    const cpuUsageQuery = `(100 * sum(rate(hardware_process_cpu_kernel_milliseconds{process_port="27017"}[1m]) +
    rate(hardware_process_cpu_user_milliseconds{process_port="27017"}[1m]))) / sum(rate(hardware_system_cpu_kernel_milliseconds[1m]) +
    rate(hardware_system_cpu_user_milliseconds[1m]) + rate(hardware_system_cpu_io_wait_milliseconds[1m]))`;

    const cpuUsage = parseFloat(
      await queryPrometheus(cpuUsageQuery, address),
    ).toFixed(2);

    return { mainDisplay: [`${cpuUsage} %`] };
  } catch (error) {
    console.error(`Error fetching data from Prometheus:`, error);

    return null;
  }
};

const getDbNetworkMetrics = async (address) => {
  try {
    const networkReceivedRateQuery = `avg(rate(hardware_system_network_bytes_in_bytes[1m]))`;
    const networkTransmitRateQuery = `avg(rate(hardware_system_network_bytes_out_bytes[1m]))`;

    const networkReceivedRate = convertBytes(
      await queryPrometheus(networkReceivedRateQuery, address),
    );
    const networkTransmitRate = convertBytes(
      await queryPrometheus(networkTransmitRateQuery, address),
    );

    return {
      mainDisplay: [`${networkReceivedRate}`, `${networkTransmitRate}`],
    };
  } catch (error) {
    console.error(`Error fetching data from Prometheus:`, error);

    return null;
  }
};

const getDbMemoryMetrics = async (address) => {
  try {
    const memoryUsageQuery = `avg(100 - (hardware_system_memory_mem_free_kilobytes / hardware_system_memory_mem_total_kilobytes * 100))`;

    const memoryUsage = parseFloat(
      await queryPrometheus(memoryUsageQuery, address),
    ).toFixed(2);

    return { mainDisplay: [`${memoryUsage}%`] };
  } catch (error) {
    console.error(`Error fetching memory metrics from Prometheus:`, error);
    return null;
  }
};

const getDbDiskMetrics = async (address) => {
  try {
    const diskUsageQuery = `avg(100 * (hardware_disk_metrics_disk_space_used_bytes / (hardware_disk_metrics_disk_space_used_bytes + hardware_disk_metrics_disk_space_free_bytes)))`;
    const readRateQuery = `avg(rate(hardware_disk_metrics_sectors_read[20s]))`;
    const writeRateQuery = `avg(rate(hardware_disk_metrics_sectors_written[20s]))`;
    const totalReadQuery = `avg(hardware_disk_metrics_read_count)`;
    const totalWrittenQuery = `avg(hardware_disk_metrics_write_count)`;
    const totalDiskReadTimeQuery = `avg(hardware_disk_metrics_read_time_milliseconds)`;
    const totalDiskWriteTimeQuery = `avg(hardware_disk_metrics_write_time_milliseconds)`;

    const diskUsage = parseFloat(
      await queryPrometheus(diskUsageQuery, address),
    ).toFixed(2);
    const readSpeed = parseFloat(
      await queryPrometheus(readRateQuery, address),
    ).toFixed(2);
    const writeSpeed = parseFloat(
      await queryPrometheus(writeRateQuery, address),
    ).toFixed(2);
    const totalRead = Math.round(
      await queryPrometheus(totalReadQuery, address),
    );
    const totalWritten = Math.round(
      await queryPrometheus(totalWrittenQuery, address),
    );
    const totalDiskReadTime = Math.round(
      await queryPrometheus(totalDiskReadTimeQuery, address),
    );
    const totalDiskWriteTime = Math.round(
      await queryPrometheus(totalDiskWriteTimeQuery, address),
    );

    return {
      mainDisplay: [readSpeed, writeSpeed],
      diskUsage: `${diskUsage} %`,
      totalRead: `${totalRead}`,
      totalWritten: `${totalWritten}`,
      totalDiskReadTime: `${totalDiskReadTime}`,
      totalDiskWriteTime: `${totalDiskWriteTime}`,
    };
  } catch (error) {
    console.error(`Error fetching memory metrics from Prometheus:`, error);
    return null;
  }
};

module.exports = {
  getCpuMetrics,
  getMemoryMetrics,
  getNetworkMetrics,
  getDiskMetrics,
  getDbCpuMetrics,
  getDbNetworkMetrics,
  getDbMemoryMetrics,
  getDbDiskMetrics,
};

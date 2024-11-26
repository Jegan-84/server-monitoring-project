"use client";
import { supabase } from "@/utils/supabase";
import { selectCurrentUser } from "@/store/slices/authSlice";
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { serverService } from "@/services/dateRangeServerService";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import DateRangeSelector from "../../../../components/DateRangeSelector";
import { format } from "date-fns";
import html2pdf from "html2pdf.js"; // Import the html2pdf library
import html2canvas from "html2canvas";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"; // Import Recharts components

interface ServerInfo {
  ip_address: string;
  server_name: string;
  port: number;
}

interface ProcessData {
  cpu_usage: number;
  memory_usage: number;
  name: string;
  pid: number;
  start_time: string;
}

interface MetricData {
  bytes_recv: number;
  bytes_sent: number;
  cpu_usage: number;
  disk_usage: number;
  memory_usage: number;
  process_data: ProcessData[];
  timestamp: string; // Include timestamp for chart X axis
}

const SummaryReports = () => {
  const user = useSelector(selectCurrentUser);
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [selectedServer, setSelectedServer] = useState<ServerInfo | null>(null);
  const [startTime, setStartTime] = useState<Date>(
    new Date(Date.now() - 6 * 60 * 60 * 1000)
  ); // Set default to 6 hours
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [metricsData, setMetricsData] = useState<MetricData[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const reportRef = useRef<HTMLDivElement>(null); // Reference for the section to export

  // Fetch servers from Supabase
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const { data, error } = await supabase
          .from("server_details")
          .select("*");
        if (error) throw error;
        setServers(data);
      } catch (err) {
        setError("Failed to fetch servers");
        console.error(err);
      }
    };

    if (user) {
      fetchServers();
    }
  }, [user]);

  const fetchRangeData = async () => {
    if (!selectedServer) return;

    setLoading(true);
    try {
      const formattedStartTime = format(startTime, "yyyy-MM-dd HH:mm:ss");
      const formattedEndTime = format(endTime, "yyyy-MM-dd HH:mm:ss");
      const response: MetricData[] = await serverService.getRangeData({
        ip_address: selectedServer.ip_address,
        port: selectedServer.port,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
      });

      setMetricsData(response?.metrics);
      setError(null);
    } catch (err) {
      setError("Failed to fetch range data");
      console.error("Error fetching range data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Compute summary statistics
  useEffect(() => {
    if (!metricsData.length) return;

    const totalMetrics = metricsData.length;

    const avgCPU =
      metricsData.reduce((sum, metric) => sum + metric.cpu_usage, 0) /
      totalMetrics;
    const avgMemory =
      metricsData.reduce((sum, metric) => sum + metric.memory_usage, 0) /
      totalMetrics;
    const avgDisk =
      metricsData.reduce((sum, metric) => sum + metric.disk_usage, 0) /
      totalMetrics;
    const totalBytesSent = metricsData.reduce(
      (sum, metric) => sum + metric.bytes_sent,
      0
    );
    const totalBytesRecv = metricsData.reduce(
      (sum, metric) => sum + metric.bytes_recv,
      0
    );
    const avgBytesSent = totalBytesSent / totalMetrics;
    const avgBytesRecv = totalBytesRecv / totalMetrics;

    const peakCPU = metricsData.reduce(
      (max, metric) => (metric.cpu_usage > max.cpu_usage ? metric : max),
      metricsData[0]
    );
    const peakMemory = metricsData.reduce(
      (max, metric) => (metric.memory_usage > max.memory_usage ? metric : max),
      metricsData[0]
    );
    const peakDisk = metricsData.reduce(
      (max, metric) => (metric.disk_usage > max.disk_usage ? metric : max),
      metricsData[0]
    );
    const peakBytesSent = metricsData.reduce(
      (max, metric) => (metric.bytes_sent > max.bytes_sent ? metric : max),
      metricsData[0]
    );
    const peakBytesRecv = metricsData.reduce(
      (max, metric) => (metric.bytes_recv > max.bytes_recv ? metric : max),
      metricsData[0]
    );

    const newSummary = {
      avgCPU,
      avgMemory,
      avgDisk,
      totalBytesSent,
      totalBytesRecv,
      avgBytesSent,
      avgBytesRecv,
      peakCPU,
      peakMemory,
      peakDisk,
      peakBytesSent,
      peakBytesRecv,
    };

    setSummary(newSummary);
  }, [metricsData]);

  // Group data by 30 minutes
  const groupDataBy30Minutes = (data: MetricData[]) => {
    const groupedData: any[] = [];
    let currentGroup: any = {
      timestamp: "",
      cpu_usage: 0,
      memory_usage: 0,
      disk_usage: 0,
      bytes_sent: 0,
      bytes_recv: 0,
    };
    let groupCount = 0;

    data.forEach((metric, index) => {
      const timestamp = new Date(metric.timestamp);
      const roundedTimestamp = new Date(
        Math.floor(timestamp.getTime() / (30 * 60 * 1000)) * (30 * 60 * 1000)
      ); // Round to the nearest 30 minutes
      const formattedTimestamp = format(roundedTimestamp, "yyyy-MM-dd HH:mm");

      if (currentGroup.timestamp === formattedTimestamp) {
        currentGroup.cpu_usage += metric.cpu_usage;
        currentGroup.memory_usage += metric.memory_usage;
        currentGroup.disk_usage += metric.disk_usage;
        currentGroup.bytes_sent += metric.bytes_sent;
        currentGroup.bytes_recv += metric.bytes_recv;
        groupCount++;
      } else {
        if (currentGroup.timestamp) {
          groupedData.push({
            ...currentGroup,
            cpu_usage: currentGroup.cpu_usage / groupCount,
            memory_usage: currentGroup.memory_usage / groupCount,
            disk_usage: currentGroup.disk_usage / groupCount,
            bytes_sent: currentGroup.bytes_sent / groupCount,
            bytes_recv: currentGroup.bytes_recv / groupCount,
          });
        }

        currentGroup = {
          timestamp: formattedTimestamp,
          cpu_usage: metric.cpu_usage,
          memory_usage: metric.memory_usage,
          disk_usage: metric.disk_usage,
          bytes_sent: metric.bytes_sent,
          bytes_recv: metric.bytes_recv,
        };
        groupCount = 1;
      }
    });

    if (currentGroup.timestamp) {
      groupedData.push({
        ...currentGroup,
        cpu_usage: currentGroup.cpu_usage / groupCount,
        memory_usage: currentGroup.memory_usage / groupCount,
        disk_usage: currentGroup.disk_usage / groupCount,
        bytes_sent: currentGroup.bytes_sent / groupCount,
        bytes_recv: currentGroup.bytes_recv / groupCount,
      });
    }

    return groupedData;
  };

  // Export report as PDF
  const exportAsPDF = () => {
    if (reportRef.current) {
      html2pdf().from(reportRef.current).save("summary-report.pdf");
    }
  };

  // Export report as Image
  const exportAsImage = () => {
    if (reportRef.current) {
      html2canvas(reportRef.current).then((canvas) => {
        const img = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = img;
        link.download = "summary-report.png";
        link.click();
      });
    }
  };
  return (
    <Box>
      <Box
        display="flex"
        justifyContent="flex-end"
        mb={2}
        alignItems={"center"}
      >
        <Typography variant="h6" padding={"10px"}>
          Server Performance
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={exportAsPDF}
          sx={{
            marginRight: 2,
            paddingX: 3,
            fontWeight: "bold",
            fontSize: "1rem",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#3f51b5", // Darken the button on hover
            },
          }}
        >
          Export as PDF
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={exportAsImage}
          sx={{
            paddingX: 3,
            fontWeight: "bold",
            fontSize: "1rem",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#f50057", // Darken the button on hover
            },
          }}
        >
          Export as Image
        </Button>
      </Box>

      <div ref={reportRef}>
        {error && <Alert severity="error">{error}</Alert>}

        <FormControl fullWidth margin="normal">
          <InputLabel>Select Server</InputLabel>
          <Select
            value={selectedServer ? JSON.stringify(selectedServer) : ""}
            onChange={(e) =>
              setSelectedServer(
                e.target.value ? JSON.parse(e.target.value) : null
              )
            }
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {servers.map((server, idx) => (
              <MenuItem key={idx} value={JSON.stringify(server)}>
                {`${server.ip_address}:${server.server_name}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <DateRangeSelector
          startTime={startTime}
          endTime={endTime}
          onStartTimeChange={(date) => setStartTime(date || startTime)}
          onEndTimeChange={(date) => setEndTime(date || endTime)}
          onFetchData={fetchRangeData}
        />

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          summary && (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Average CPU Usage</Typography>
                      <Typography>{summary.avgCPU.toFixed(2)}%</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Average Memory Usage</Typography>
                      <Typography>{summary.avgMemory.toFixed(2)}%</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Average Disk Usage</Typography>
                      <Typography>{summary.avgDisk.toFixed(2)}%</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Total Bytes Sent</Typography>
                      <Typography>
                        {summary.totalBytesSent.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Total Bytes Received</Typography>
                      <Typography>
                        {summary.totalBytesRecv.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Peak CPU Usage</Typography>
                      <Typography>{summary.peakCPU.cpu_usage}%</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Peak Memory Usage</Typography>
                      <Typography>
                        {summary.peakMemory.memory_usage}MB
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Recharts Line Chart */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      System Performance Over Time
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={groupDataBy30Minutes(metricsData)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={(str) => str.substring(11, 16)} // Format timestamp
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="cpu_usage"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="memory_usage"
                          stroke="#82ca9d"
                        />
                        <Line
                          type="monotone"
                          dataKey="disk_usage"
                          stroke="#ff7300"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )
        )}
      </div>
    </Box>
  );
};

export default SummaryReports;

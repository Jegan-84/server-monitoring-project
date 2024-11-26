"use client";
import { supabase } from "@/utils/supabase";
import { selectCurrentUser } from "@/store/slices/authSlice";
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { serverService } from "@/services/dateRangeServerService";
import DateRangeSelector from "../../../../components/DateRangeSelector";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
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
  ); // Default to 6 hours
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [metricsData, setMetricsData] = useState<MetricData[]>([]);
  const [highUsageAlerts, setHighUsageAlerts] = useState<any[]>([]);
  const [processAlerts, setProcessAlerts] = useState<any[]>([]);
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

  // Fetch metrics data for selected server
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

      setMetricsData(response);
      setHighUsageAlerts(
        response?.metrics.filter((metric) => {
          return metric.cpu_usage * 100 > 80 || metric.memory_usage * 100 > 90;
        })
      );
      setProcessAlerts(
        response?.metrics.flatMap((metric) => {
          return metric.process_data.filter(
            (process) =>
              process.cpu_usage * 100 > 20 || process.memory_usage * 100 > 20
          );
        })
      );
      setError(null);
    } catch (err) {
      setError("Failed to fetch range data");
      console.error("Error fetching range data:", err);
    } finally {
      setLoading(false);
    }
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
          Performance Alert Report
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
      <Box>
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
      </Box>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {/* High Usage Alerts Chart */}
      <Typography variant="h6" padding={"10px"}>
        High Usage Alerts (CPU `{">"}` 80% or Memory `{"<"}` 90%)
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={highUsageAlerts}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="cpu_usage" stroke="#8884d8" />
          <Line type="monotone" dataKey="memory_usage" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>

      {/* Process Alerts Chart */}
      <Typography variant="h6" padding={"10px"}>
        Process Alerts (CPU `{">"}` 20% or Memory `{">"}` 20%)
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={processAlerts}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="cpu_usage" stroke="#ff7300" />
          <Line type="monotone" dataKey="memory_usage" stroke="#ff0000" />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default SummaryReports;

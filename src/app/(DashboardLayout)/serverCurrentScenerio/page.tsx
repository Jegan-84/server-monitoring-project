"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectServerDetail } from "@/store/slices/serverDetailSlice";
import { serverService } from "@/services/serverService";
import html2canvas from "html2canvas";
import { format, parseISO } from "date-fns";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  Computer as ComputerIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import {
  // ... existing imports ...
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
} from "recharts";
import { alertRulesService } from "@/services/alertRules";

interface ProcessData {
  pid: number;
  name: string;
  cpu_usage: number;
  memory_usage: number;
  start_time: string;
}

interface MetricsData {
  bytes_recv: number;
  bytes_sent: number;
  cpu_usage: number;
  current_time: string;
  disk_usage: number;
  memory_usage: number;
  process_data: ProcessData[];
}

interface ChartData {
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_recv: number;
  network_sent: number;
}

const ServerMonitorDashboard = () => {
  const serverData = useSelector(selectServerDetail);
  const [currentMetrics, setCurrentMetrics] = useState<MetricsData | null>(
    null
  );
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [cpuUsage, setCpuUsage] = useState<number>(0); // Replace with actual CPU usage fetching logic
  const [severityColor, setSeverityColor] = useState<string>(""); // Replace with actual CPU usage fetching logic
  const [cpuCardColor, setCpuCardColor] = useState<string>(""); // New state for card color

  const dashboardRef = useRef<HTMLDivElement>(null);

  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const exportAsImage = async (elementId: string, fileName: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `${fileName}-${format(
        new Date(),
        "yyyy-MM-dd-HH-mm"
      )}.png`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error("Error exporting image:", err);
      setError("Failed to export image");
    }
    handleExportClose();
  };

  const fetchCurrentData = async () => {
    if (!serverData?.ip_address) return;

    setLoading(true);
    try {
      const response = await serverService.getCurrentData({
        ip_address: serverData.ip_address,
        port: 5000,
      });

      setCurrentMetrics(response);

      // Update chart data
      const newChartPoint = {
        timestamp: response.current_time,
        cpu_usage: response.cpu_usage,
        memory_usage: response.memory_usage,
        disk_usage: response.disk_usage,
        network_recv: response.bytes_recv / 1024 / 1024, // Convert to MB
        network_sent: response.bytes_sent / 1024 / 1024, // Convert to MB
      };

      setChartData((prev) => [...prev, newChartPoint].slice(-30)); // Keep last 30 points
      setError(null);
    } catch (err) {
      setError("Failed to fetch current data");
      console.error("Error fetching current data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentData();
    const interval = setInterval(fetchCurrentData, 60000); // Update every 1 minute
    return () => clearInterval(interval);
  }, [serverData?.ip_address]);

  if (!serverData?.ip_address) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No server selected</Alert>
      </Box>
    );
  }

  const [memoryFilter, setMemoryFilter] = useState<string>("all");

  const handleMemoryFilterChange = (event: SelectChangeEvent) => {
    setMemoryFilter(event.target.value);
  };

  const getFilteredProcesses = () => {
    if (!currentMetrics?.process_data) return [];

    const sortedProcesses = [...currentMetrics.process_data].sort(
      (a, b) => b.memory_usage - a.memory_usage
    );

    switch (memoryFilter) {
      case "high":
        return sortedProcesses.filter((p) => p.memory_usage >= 10);
      case "medium":
        return sortedProcesses.filter(
          (p) => p.memory_usage >= 5 && p.memory_usage < 10
        );
      case "low":
        return sortedProcesses.filter(
          (p) => p.memory_usage >= 1 && p.memory_usage < 5
        );
      default:
        return sortedProcesses.filter((p) => p.memory_usage >= 1);
    }
  };
  useEffect(() => {
    const fetchAlertRules = async () => {
      try {
        const rules = await alertRulesService.getByConditionType("CPU_USAGE");
        console.log("rules", rules);
        if (rules.length > 0) {
          const latestRule = rules[0]; // Assuming you want the latest rule
          setCpuUsage(latestRule.threshold); // Replace with actual CPU usage value

          // Determine color based on severity
          if (latestRule.severity === "low") {
            setSeverityColor("green");
          } else if (latestRule.severity === "medium") {
            setSeverityColor("orange");
          } else {
            setSeverityColor("red");
          }
        }
      } catch (error) {
        console.error("Error fetching alert rules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlertRules();
  }, []);

  const getCpuCardColor = async (cpuUsage: number) => {
    const rules = await alertRulesService.getByConditionType("CPU_USAGE");
    console.log("currentMetrics?.cpu_usage", cpuUsage);

    for (const rule of rules) {
      if (cpuUsage <= rule.threshold_value) {
        console.log("rule------>", rule.color);
        return rule.color; // Return the color based on the severity
      }
    }
  };

  useEffect(() => {
    const fetchAlertRules = async () => {
      try {
        const rules = await alertRulesService.getByConditionType("CPU_USAGE");
        if (rules && rules.length > 0) {
          // Sort rules by threshold_value in ascending order
          const sortedRules = rules.sort(
            (a, b) => a.threshold_value - b.threshold_value
          );

          let matchedRule = null;

          for (const rule of sortedRules) {
            if (currentMetrics?.cpu_usage !== undefined) {
              // Check if the CPU usage is less than or equal to the current threshold
              if (currentMetrics.cpu_usage <= rule.threshold_value) {
                matchedRule = rule;
                break; // Exit loop once a match is found
              }
            }
          }

          if (matchedRule) {
            console.log("Matched Rule:", matchedRule);
            setSeverityColor(matchedRule.color); // Set the severity color
          } else {
            console.log(
              "No matching rule found for CPU usage:",
              currentMetrics?.cpu_usage
            );
          }
        }
      } catch (error) {
        console.error("Error fetching alert rules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlertRules();
  }, [currentMetrics]);
  console.log("severityColor", severityColor);
  return (
    <Box sx={{ p: 3 }} ref={dashboardRef} id="dashboard-content">
      {/* Header Section */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: "primary.dark" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h4" color="white">
            Server Monitoring Dashboard
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Export Dashboard">
              <IconButton onClick={handleExportClick} sx={{ color: "white" }}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={fetchCurrentData}
              disabled={loading}
              sx={{ color: "white" }}
            >
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Menu
          anchorEl={exportAnchorEl}
          open={Boolean(exportAnchorEl)}
          onClose={handleExportClose}
        >
          <MenuItem
            onClick={() => exportAsImage("dashboard-content", "full-dashboard")}
          >
            Export Full Dashboard
          </MenuItem>
          <MenuItem
            onClick={() => exportAsImage("metrics-cards", "metrics-summary")}
          >
            Export Metrics Summary
          </MenuItem>
          <MenuItem
            onClick={() => exportAsImage("metrics-graphs", "metrics-graphs")}
          >
            Export Graphs
          </MenuItem>
          <MenuItem
            onClick={() => exportAsImage("process-table", "process-data")}
          >
            Export Process Table
          </MenuItem>
        </Menu>

        <Stack direction="row" spacing={2}>
          <Chip
            label={`Status: ${loading ? "Updating" : "Active"}`}
            color="success"
            sx={{ color: "white", borderColor: "white" }}
            variant="outlined"
          />
          <Chip
            label={`Server: ${serverData.server_name}`}
            color="success"
            sx={{ color: "white", borderColor: "white" }}
            variant="outlined"
          />
          <Chip
            label={`IP: ${serverData.ip_address}`}
            sx={{ color: "white", borderColor: "white" }}
            variant="outlined"
          />
          <Chip
            label={`Last Updated: ${currentMetrics?.current_time || "N/A"}`}
            sx={{ color: "white", borderColor: "white" }}
            variant="outlined"
          />
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }} id="metrics-cards">
        <Grid item xs={12} md={6} lg={3}>
          <Card
            elevation={3}
            sx={{
              bgcolor: severityColor,
              color: "white",
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <ComputerIcon color="inherit" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">CPU Usage</Typography>
                </Stack>
                {loading ? (
                  <CircularProgress />
                ) : (
                  <Typography variant="h4" align="center">
                    {currentMetrics?.cpu_usage.toFixed(1)}%
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={3}>
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <MemoryIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">Memory Usage</Typography>
                </Stack>
                {loading ? (
                  <CircularProgress />
                ) : (
                  <Typography variant="h4" align="center">
                    {currentMetrics?.memory_usage.toFixed(1)}%
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={3}>
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <StorageIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">Disk Usage</Typography>
                </Stack>
                {loading ? (
                  <CircularProgress />
                ) : (
                  <Typography variant="h4" align="center">
                    {currentMetrics?.disk_usage.toFixed(1)}%
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={3}>
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <NetworkIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">Network Traffic</Typography>
                </Stack>
                {loading ? (
                  <CircularProgress />
                ) : (
                  <>
                    <Typography variant="h6" align="center">
                      ↓{" "}
                      {(
                        (currentMetrics?.bytes_recv || 0) /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </Typography>
                    <Typography variant="h6" align="center">
                      ↑{" "}
                      {(
                        (currentMetrics?.bytes_sent || 0) /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </Typography>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Process Table */}
      <Paper sx={{ p: 2, mb: 3 }} id="process-table">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">High Memory Processes</Typography>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Memory Usage</InputLabel>
            <Select
              value={memoryFilter}
              label="Memory Usage"
              onChange={handleMemoryFilterChange}
              size="small"
            >
              <MenuItem value="all">All (≥1%)</MenuItem>
              <MenuItem value="high">High (≥10%)</MenuItem>
              <MenuItem value="medium">Medium (5-10%)</MenuItem>
              <MenuItem value="low">Low (1-5%)</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>PID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>CPU Usage (%)</TableCell>
                <TableCell>Memory Usage (%)</TableCell>
                <TableCell>Start Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredProcesses().map((process) => (
                <TableRow key={process.pid}>
                  <TableCell>{process.pid}</TableCell>
                  <TableCell>{process.name}</TableCell>
                  <TableCell>{process.cpu_usage.toFixed(1)}</TableCell>
                  <TableCell>{process.memory_usage.toFixed(1)}</TableCell>
                  <TableCell>{process.start_time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Graphs Section */}
      <Grid container spacing={3} id="metrics-graphs">
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              CPU Usage Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  tickFormatter={(timestamp) =>
                    format(parseISO(timestamp), "HH:mm:ss")
                  }
                />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cpu_usage"
                  stroke="#8884d8"
                  name="CPU Usage (%)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Memory Usage Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  tickFormatter={(timestamp) =>
                    format(parseISO(timestamp), "HH:mm:ss")
                  }
                />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="memory_usage"
                  stroke="#82ca9d"
                  name="Memory Usage (%)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Network Traffic Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  tickFormatter={(timestamp) =>
                    format(parseISO(timestamp), "HH:mm:ss")
                  }
                />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="network_recv"
                  stroke="#8884d8"
                  name="Download (MB)"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="network_sent"
                  stroke="#82ca9d"
                  name="Upload (MB)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Disk Usage Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  tickFormatter={(timestamp) =>
                    format(parseISO(timestamp), "HH:mm:ss")
                  }
                />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="disk_usage"
                  stroke="#ffc658"
                  name="Disk Usage (%)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServerMonitorDashboard;

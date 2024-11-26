"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectServerDetail } from "@/store/slices/serverDetailSlice";
import { serverService } from "@/services/dateRangeServerService";
import {
  format,
  subHours,
  subDays,
  subWeeks,
  subMonths,
  parseISO,
  formatDistanceToNow,
  addMinutes,
} from "date-fns";
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
  ButtonGroup,
  Button,
} from "@mui/material";
import {
  Computer as ComputerIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DateRangeSelector from "../../../components/DateRangeSelector";
import { FormControl, Select, MenuItem } from "@mui/material";

interface ProcessData {
  pid: number;
  name: string;
  cpu_percent: number;
  memory_percent: number;
}

interface TimeSeriesData {
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_recv: number;
  network_sent: number;
  process_data: ProcessData[];
}

const groupDataByHalfHour = (data: TimeSeriesData[]) => {
  const groupedData = data.reduce(
    (acc: { [key: string]: TimeSeriesData[] }, curr) => {
      const date = parseISO(curr.timestamp);
      const minutes = date.getMinutes();
      const roundedMinutes = Math.floor(minutes / 30) * 30;
      date.setMinutes(roundedMinutes, 0, 0);

      const key = format(date, "yyyy-MM-dd HH:mm");

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(curr);
      return acc;
    },
    {}
  );

  return Object.entries(groupedData)
    .map(([timestamp, values]) => {
      const averages = values.reduce(
        (acc, curr) => ({
          cpu_usage: acc.cpu_usage + curr.cpu_usage,
          memory_usage: acc.memory_usage + curr.memory_usage,
          disk_usage: acc.disk_usage + curr.disk_usage,
          network_recv: acc.network_recv + curr.network_recv,
          network_sent: acc.network_sent + curr.network_sent,
        }),
        {
          cpu_usage: 0,
          memory_usage: 0,
          disk_usage: 0,
          network_recv: 0,
          network_sent: 0,
        }
      );

      const count = values.length;
      return {
        timestamp,
        cpu_usage: averages.cpu_usage / count,
        memory_usage: averages.memory_usage / count,
        disk_usage: averages.disk_usage / count,
        network_recv: averages.network_recv / count,
        network_sent: averages.network_sent / count,
        process_data: values[values.length - 1].process_data,
      };
    })
    .sort(
      (a, b) =>
        parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime()
    );
};

const ServerMonitorPage = () => {
  const serverData = useSelector(selectServerDetail);
  const [metrics, setMetrics] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>(subHours(new Date(), 6));
  const [endTime, setEndTime] = useState<Date>(new Date());
  type MetricType = "cpu_usage" | "memory_usage" | "disk_usage";
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("cpu_usage");

  const handleTimeRangeSelect = (range: string) => {
    const now = new Date();
    switch (range) {
      case "1h":
        setStartTime(subHours(now, 1));
        break;
      case "6h":
        setStartTime(subHours(now, 6));
        break;
      case "24h":
        setStartTime(subHours(now, 24));
        break;
      case "7d":
        setStartTime(subDays(now, 7));
        break;
      case "30d":
        setStartTime(subDays(now, 30));
        break;
    }
    setEndTime(now);
    fetchRangeData();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = parseISO(timestamp);
    const diffInHours = Math.abs(new Date().getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      return format(date, "HH:mm");
    } else if (diffInHours < 168) {
      return format(date, "EEE HH:mm");
    } else {
      return format(date, "MMM dd");
    }
  };

  const tooltipFormatter = (value: number) => `${value.toFixed(2)}`;
  const tooltipLabelFormatter = (label: string) => {
    const date = parseISO(label);
    const endDate = addMinutes(date, 30);
    return `${format(date, "HH:mm")} - ${format(endDate, "HH:mm")} (${format(
      date,
      "MMM dd, yyyy"
    )})`;
  };

  const fetchRangeData = async () => {
    if (!serverData?.ip_address) return;

    setLoading(true);
    try {
      const formattedStartTime = format(startTime, "yyyy-MM-dd HH:mm:ss");
      const formattedEndTime = format(endTime, "yyyy-MM-dd HH:mm:ss");

      const response = await serverService.getRangeData({
        ip_address: serverData.ip_address,
        port: 5000,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
      });

      const transformedData = response.metrics.map((item: any) => ({
        timestamp: item.timestamp,
        cpu_usage: item.cpu_usage,
        memory_usage: item.memory_usage,
        disk_usage: item.disk_usage,
        network_recv: item.bytes_recv / 1024,
        network_sent: item.bytes_sent / 1024,
        process_data: item.process_data,
      }));

      const groupedData = groupDataByHalfHour(transformedData);
      setMetrics(groupedData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError("Failed to fetch range data");
      console.error("Error fetching range data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRangeData();
    const interval = setInterval(fetchRangeData, 300000);
    return () => clearInterval(interval);
  }, [serverData?.ip_address]);

  const getLatestMetrics = () => {
    if (metrics.length === 0) return null;
    return metrics[metrics.length - 1];
  };

  const calculateAverages = () => {
    if (metrics.length === 0) return null;

    return metrics.reduce(
      (acc, curr) => ({
        cpu_usage: acc.cpu_usage + curr.cpu_usage,
        memory_usage: acc.memory_usage + curr.memory_usage,
        disk_usage: acc.disk_usage + curr.disk_usage,
        network_recv: acc.network_recv + curr.network_recv,
        network_sent: acc.network_sent + curr.network_sent,
      }),
      {
        cpu_usage: 0,
        memory_usage: 0,
        disk_usage: 0,
        network_recv: 0,
        network_sent: 0,
      }
    );
  };

  const latestMetrics = getLatestMetrics();
  const averageMetrics = calculateAverages();

  if (!serverData?.ip_address) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No server selected</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
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
          <IconButton
            onClick={fetchRangeData}
            disabled={loading}
            sx={{ color: "white" }}
          >
            <RefreshIcon />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <ButtonGroup variant="contained" size="small">
            <Button
              onClick={() => handleTimeRangeSelect("1h")}
              sx={{ color: "white" }}
            >
              1H
            </Button>
            <Button
              onClick={() => handleTimeRangeSelect("6h")}
              sx={{ color: "white" }}
            >
              6H
            </Button>
            <Button
              onClick={() => handleTimeRangeSelect("24h")}
              sx={{ color: "white" }}
            >
              24H
            </Button>
            <Button
              onClick={() => handleTimeRangeSelect("7d")}
              sx={{ color: "white" }}
            >
              7D
            </Button>
            <Button
              onClick={() => handleTimeRangeSelect("30d")}
              sx={{ color: "white" }}
            >
              30D
            </Button>
          </ButtonGroup>

          <DateRangeSelector
            startTime={startTime}
            endTime={endTime}
            onStartTimeChange={(date) => date && setStartTime(date)}
            onEndTimeChange={(date) => date && setEndTime(date)}
            onFetchData={fetchRangeData}
          />
        </Stack>

        <Stack direction="row" spacing={2}>
          <Chip
            label={`Status: ${loading ? "Updating" : "Active"}`}
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
            label={`Last Updated: ${lastUpdated.toLocaleTimeString()}`}
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

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={3}>
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <ComputerIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h6">CPU Usage</Typography>
                </Stack>
                {loading ? (
                  <CircularProgress />
                ) : (
                  <>
                    <Typography variant="h4" align="center">
                      {latestMetrics?.cpu_usage.toFixed(1)}%
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      align="center"
                    >
                      Avg:{" "}
                      {(averageMetrics?.cpu_usage / metrics.length).toFixed(1)}%
                    </Typography>
                  </>
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
                  <>
                    <Typography variant="h4" align="center">
                      {latestMetrics?.memory_usage.toFixed(1)}%
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      align="center"
                    >
                      Avg:{" "}
                      {(averageMetrics?.memory_usage / metrics.length).toFixed(
                        1
                      )}
                      %
                    </Typography>
                  </>
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
                  <>
                    <Typography variant="h4" align="center">
                      {latestMetrics?.disk_usage.toFixed(1)}%
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      align="center"
                    >
                      Avg:{" "}
                      {(averageMetrics?.disk_usage / metrics.length).toFixed(1)}
                      %
                    </Typography>
                  </>
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
                      ↓ {(latestMetrics?.network_recv || 0).toFixed(1)} KB/s
                    </Typography>
                    <Typography variant="h6" align="center">
                      ↑ {(latestMetrics?.network_sent || 0).toFixed(1)} KB/s
                    </Typography>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              CPU Usage Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  tickFormatter={formatTimestamp}
                />
                <YAxis />
                <Tooltip
                  formatter={tooltipFormatter}
                  labelFormatter={tooltipLabelFormatter}
                />
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
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  tickFormatter={formatTimestamp}
                />
                <YAxis />
                <Tooltip
                  formatter={tooltipFormatter}
                  labelFormatter={tooltipLabelFormatter}
                />
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
              Disk Usage Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  tickFormatter={formatTimestamp}
                />
                <YAxis />
                <Tooltip
                  formatter={tooltipFormatter}
                  labelFormatter={tooltipLabelFormatter}
                />
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

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Network Traffic Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  tickFormatter={formatTimestamp}
                />
                <YAxis />
                <Tooltip
                  formatter={tooltipFormatter}
                  labelFormatter={tooltipLabelFormatter}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="network_recv"
                  stroke="#8884d8"
                  name="Download (KB/s)"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="network_sent"
                  stroke="#82ca9d"
                  name="Upload (KB/s)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Add new table section */}
      <Grid container sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Top 5 Peak Usage Periods</Typography>
              <FormControl sx={{ minWidth: 200 }}>
                <Select
                  value={selectedMetric}
                  onChange={(e) =>
                    setSelectedMetric(e.target.value as MetricType)
                  }
                  size="small"
                >
                  <MenuItem value="cpu_usage">CPU Usage</MenuItem>
                  <MenuItem value="memory_usage">Memory Usage</MenuItem>
                  <MenuItem value="disk_usage">Disk Usage</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "rgba(0, 0, 0, 0.04)" }}>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "center",
                        borderBottom: "2px solid rgba(224, 224, 224, 1)",
                        width: "10%",
                      }}
                    >
                      Rank
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "right",
                        borderBottom: "2px solid rgba(224, 224, 224, 1)",
                        width: "30%",
                      }}
                    >
                      Peak Value
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        borderBottom: "2px solid rgba(224, 224, 224, 1)",
                        width: "60%",
                      }}
                    >
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...metrics]
                    .sort((a, b) => b[selectedMetric] - a[selectedMetric])
                    .slice(0, 5)
                    .map((data, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "white" : "rgba(0, 0, 0, 0.02)",
                        }}
                      >
                        <td
                          style={{
                            padding: "16px",
                            borderBottom: "1px solid rgba(224, 224, 224, 1)",
                            textAlign: "center",
                          }}
                        >
                          #{index + 1}
                        </td>
                        <td
                          style={{
                            padding: "16px",
                            borderBottom: "1px solid rgba(224, 224, 224, 1)",
                            textAlign: "right",
                            fontWeight: index === 0 ? "bold" : "normal",
                          }}
                        >
                          {data[selectedMetric].toFixed(2)}%
                        </td>
                        <td
                          style={{
                            padding: "16px",
                            borderBottom: "1px solid rgba(224, 224, 224, 1)",
                          }}
                        >
                          {format(
                            parseISO(data.timestamp),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServerMonitorPage;

"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Stack,
  Tooltip,
  Paper,
  IconButton,
} from "@mui/material";
import { format } from "date-fns";
interface MetricsData {
  bytes_recv: number;
  bytes_sent: number;
  cpu_usage: number;
  current_time: string;
  disk_usage: number;
  memory_usage: number;
}
const AlertDashboard = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServer, setSelectedServer] = useState("");
  const [currentMetrics, setCurrentMetrics] = useState<MetricsData | null>(
    null
  );
  const [selectedServerData, setSelectedServerData] = useState([]);
  const [loading, setLoading] = useState(false);
  console.log("servers", servers);

  // Fetch servers and alerts
  useEffect(() => {
    const fetchServersAndAlerts = async () => {
      // Fetch servers
      const { data: serverData, error: serverError } = await supabase
        .from("server_details")
        .select("*");

      if (serverError) {
        console.error("Error fetching servers:", serverError.message);
        return;
      }
      setServers(serverData);

      // Fetch alerts
      const { data: alertData, error: alertError } = await supabase
        .from("alerts")
        .select("*, server_details(*)");
      console.log("alertData", alertData);

      // setSelectedServer()
      if (alertError) {
        console.error("Error fetching alerts:", alertError.message);
        return;
      }
      setAlerts(alertData);
    };

    fetchServersAndAlerts();
  }, []);

  const handleServerChange = (event: any) => {
    setSelectedServer(event.target.value);
  };
  console.log("selectedServer", selectedServer);

  const filteredServers = servers.filter(
    (server) => server.server_details_id === selectedServer
  );
  console.log("filteredServers", filteredServers);
  // Filter alerts based on selected server
  const filteredAlerts = selectedServer
    ? alerts.filter((alert) => alert.server_details_id === selectedServer)
    : alerts;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Alert Dashboard
      </Typography>

      {/* Server Dropdown */}
      <FormControl sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel id="server-select-label">Select Server</InputLabel>
        <Select
          labelId="server-select-label"
          value={selectedServer}
          onChange={handleServerChange}
        >
          <MenuItem value="">
            <em>All Servers</em>
          </MenuItem>
          {servers.map((server) => (
            <MenuItem
              key={server.server_details_id}
              value={server.server_details_id}
            >
              {server.ip_address + " " + server.server_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: "primary.dark" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Stack direction="row" spacing={1}></Stack>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Chip
            label={`Status: ${loading ? "Updating" : "Active"}`}
            color="success"
            sx={{ color: "white", borderColor: "white" }}
            variant="outlined"
          />
          <Chip
            label={`Server: ${alerts[0]?.server_details?.server_name}`}
            color="success"
            sx={{ color: "white", borderColor: "white" }}
            variant="outlined"
          />
          <Chip
            label={`IP: ${alerts[0]?.server_details?.ip_address}`}
            sx={{ color: "white", borderColor: "white" }}
            variant="outlined"
          />
          <Chip
            label={`Last Updated: ${
              format(new Date(), "yyyy-mm-dd HH:MM") || "N/A"
            }`}
            sx={{ color: "white", borderColor: "white" }}
            variant="outlined"
          />
        </Stack>
      </Paper>
      {/* Alert Cards */}
      <Grid container spacing={3}>
        {filteredAlerts.map((alert) => (
          <Grid item xs={12} sm={6} md={4} key={alert.alert_id}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                {/* Highlight Timestamp */}
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Timestamp: {new Date(alert.timestamp).toLocaleString()}
                </Typography>

                {/* Severity */}
                <Chip
                  label={`Severity: ${alert.severity}`}
                  color={
                    alert.severity === "High"
                      ? "error"
                      : alert.severity === "Medium"
                      ? "warning"
                      : "success"
                  }
                  sx={{ mb: 2 }}
                />

                {/* Alert Details */}
                <Typography variant="body1" fontWeight="bold">
                  {alert.description || "No Description Provided"}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Summary Data */}
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="space-between"
                >
                  <Typography variant="body2">
                    <strong>CPU Usage:</strong> {alert.process_data?.cpu_usage}%
                  </Typography>
                  <Typography variant="body2">
                    <strong>Memory Usage:</strong>{" "}
                    {alert.process_data?.memory_usage}%
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="space-between"
                  sx={{ mt: 1 }}
                >
                  <Typography variant="body2">
                    <strong>Disk Usage:</strong>{" "}
                    {alert.process_data?.disk_usage}%
                  </Typography>
                  <Typography variant="body2">
                    <strong>Current Time:</strong>{" "}
                    {new Date(
                      alert.process_data?.current_time
                    ).toLocaleString()}
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="space-between"
                  sx={{ mt: 1 }}
                >
                  <Typography variant="body2">
                    <strong>Bytes Received:</strong>{" "}
                    {alert.process_data?.bytes_recv}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Bytes Sent:</strong>{" "}
                    {alert.process_data?.bytes_sent}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Process Data */}
                {alert.process_data?.process_data && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Process Details:
                    </Typography>
                    {alert.process_data.process_data.map(
                      (process: any, index: any) => (
                        <Card
                          key={index}
                          sx={{
                            mb: 1,
                            backgroundColor: "#f5f5f5",
                            boxShadow: 1,
                            padding: 1,
                          }}
                        >
                          <Typography variant="body2">
                            <strong>Process Name:</strong> {process.name}
                          </Typography>
                          <Typography variant="body2">
                            <strong>PID:</strong> {process.pid}
                          </Typography>
                          <Typography variant="body2">
                            <strong>CPU Usage:</strong> {process.cpu_usage}%
                          </Typography>
                          <Typography variant="body2">
                            <strong>Memory Usage:</strong>{" "}
                            {process.memory_usage} MB
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Start Time:</strong>{" "}
                            {new Date(process.start_time).toLocaleString()}
                          </Typography>
                        </Card>
                      )
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AlertDashboard;

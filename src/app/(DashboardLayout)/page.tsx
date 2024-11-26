"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { supabase } from "@/utils/supabase";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import { serverService } from "@/services/serverService";

interface ProcessData {
  pid: number;
  name: string;
  start_time: string;
  cpu_usage: number;
  memory_usage: number;
}

interface ServerData {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  bytes_recv: number;
  bytes_sent: number;
  current_time: string;
  process_data: ProcessData[];
}

interface ServerInfo {
  server_details_id: string;
  server_name: string;
  ip_address: string;
  port: number;
  status?: "active" | "inactive";
}

const ServerMonitoring = () => {
  const user = useSelector(selectCurrentUser);
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [selectedServer, setSelectedServer] = useState<ServerInfo | null>(null);
  const [serverData, setServerData] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch servers from Supabase
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const { data, error } = await supabase
          .from("server_details")
          .select("*");

        if (error) throw error;
        setServers(data);

        // Set the first server as the default selected
        if (data.length > 0) setSelectedServer(data[0]);
      } catch (err) {
        setError("Failed to fetch servers");
        console.error(err);
      }
    };

    if (user) {
      fetchServers();
    }
  }, [user]);

  // Fetch server data when server is selected
  useEffect(() => {
    const fetchServerData = async () => {
      if (!selectedServer) return;

      setLoading(true);
      try {
        const response: ServerData = await serverService.getCurrentData({
          ip_address: selectedServer.ip_address,
          port: selectedServer.port,
        });
        setServerData(response);
        setError(null);
      } catch (err) {
        setError("Failed to fetch server data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const interval = setInterval(fetchServerData, 120000); // Set to 2 minutes (120000 milliseconds)
    fetchServerData();

    return () => clearInterval(interval);
  }, [selectedServer]);

  const MetricCard = ({ title, value, icon, color }: any) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" color="textSecondary">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderProcessTable = (processes: ProcessData[]) => {
    // Sort by memory usage first, then CPU usage, and take the top 5
    const topProcesses = processes
      .sort(
        (a, b) => b.memory_usage - a.memory_usage || b.cpu_usage - a.cpu_usage
      )
      .slice(0, 5);

    return (
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>PID</strong>
              </TableCell>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>CPU Usage (%)</strong>
              </TableCell>
              <TableCell>
                <strong>Memory Usage (%)</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topProcesses.map((process) => (
              <TableRow key={process.pid}>
                <TableCell>{process.pid}</TableCell>
                <TableCell>{process.name}</TableCell>
                <TableCell>{process.cpu_usage.toFixed(2)}</TableCell>
                <TableCell>{process.memory_usage.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Server Monitoring
          </Typography>
          <Typography variant="body2">
            User: {user?.additionalData?.email} | Role:{" "}
            {user?.additionalData?.role}
          </Typography>
          <Typography variant="body2" sx={{ textAlign: "right" }}>
            Current Time: {new Date().toLocaleString()}
          </Typography>
          <Select
            fullWidth
            sx={{ width: "300px", maxWidth: "100%", mt: 2 }}
            value={selectedServer?.server_details_id || ""}
            onChange={(e) => {
              const server = servers.find(
                (s) => s.server_details_id === e.target.value
              );
              setSelectedServer(server || null);
            }}
          >
            {servers.map((server) => (
              <MenuItem
                key={server.server_details_id}
                value={server.server_details_id}
              >
                {server.server_name} ({server.ip_address})
              </MenuItem>
            ))}
          </Select>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        serverData && (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  title="CPU Usage"
                  value={`${serverData.cpu_usage}%`}
                  icon={<SpeedIcon fontSize="large" />}
                  color="#1e88e5"
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  title="Memory Usage"
                  value={`${serverData.memory_usage}%`}
                  icon={<MemoryIcon fontSize="large" />}
                  color="#43a047"
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  title="Disk Usage"
                  value={`${serverData.disk_usage}%`}
                  icon={<StorageIcon fontSize="large" />}
                  color="#fb8c00"
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  title="Bytes Sent"
                  value={`${serverData.bytes_sent.toLocaleString()} bytes`}
                  icon={<ArrowUpwardIcon fontSize="large" />}
                  color="#8e24aa"
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  title="Bytes Received"
                  value={`${serverData.bytes_recv.toLocaleString()} bytes`}
                  icon={<ArrowDownwardIcon fontSize="large" />}
                  color="#f57c00"
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 4 }}>
              Top 5 Processes with High Resource Usage
            </Typography>
            {renderProcessTable(serverData.process_data)}
          </>
        )
      )}
    </Box>
  );
};

export default ServerMonitoring;

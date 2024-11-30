"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectServerDetail } from "@/store/slices/serverDetailSlice";
import { serverService } from "@/services/serverService";
import html2canvas from "html2canvas";
import { format } from "date-fns";
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
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  Computer as ComputerIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { alertRulesService } from "@/services/alertRules";

const ServerMonitorDashboard = () => {
  const serverData = useSelector(selectServerDetail);
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [severityColor, setSeverityColor] = useState<string>("green");

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

      const newChartPoint = {
        timestamp: response.current_time,
        cpu_usage: response.cpu_usage,
        memory_usage: response.memory_usage,
        disk_usage: response.disk_usage,
        network_recv: response.bytes_recv / 1024 / 1024,
        network_sent: response.bytes_sent / 1024 / 1024,
      };

      setChartData((prev: any) => [...prev, newChartPoint].slice(-30));
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

  useEffect(() => {
    const fetchAlertRules = async () => {
      try {
        const rules: any = await alertRulesService.getByConditionType(
          "CPU_USAGE"
        );
        if (rules && rules.length > 0) {
          const sortedRules = rules.sort(
            (a: any, b: any) => a.threshold_value - b.threshold_value
          );

          let matchedRule = null;
          for (const rule of sortedRules) {
            if (currentMetrics?.cpu_usage !== undefined) {
              if (currentMetrics.cpu_usage <= rule.threshold_value) {
                matchedRule = rule;
                break;
              }
            }
          }

          if (matchedRule) {
            setSeverityColor(matchedRule.color);
          }
        }
      } catch (error) {
        console.error("Error fetching alert rules:", error);
      }
    };

    if (currentMetrics?.cpu_usage !== undefined) {
      fetchAlertRules();
    }
  }, [currentMetrics]);

  if (!serverData?.ip_address) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No server selected</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }} ref={dashboardRef} id="dashboard-content">
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
        </Menu>
        <Stack direction="row" spacing={2}>
          <Chip
            label={`Status: ${loading ? "Updating" : "Active"}`}
            color="success"
          />
          <Chip label={`Server: ${serverData.server_name}`} color="success" />
        </Stack>
      </Paper>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={3} sx={{ bgcolor: severityColor, color: "white" }}>
            <CardContent>
              <Typography variant="h6">CPU Usage</Typography>
              {loading ? (
                <CircularProgress />
              ) : (
                <Typography variant="h4" align="center">
                  {currentMetrics?.cpu_usage.toFixed(1)}%
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServerMonitorDashboard;

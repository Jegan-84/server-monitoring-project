"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
} from "@mui/material";
import { Check, Assignment } from "@mui/icons-material";
import { supabase } from "@/utils/supabase";

interface Alert {
  alert_id: string;
  timestamp: string;
  affected_entity: string;
  alert_type: string;
  severity: string;
  status: string;
  description: string;
  assigned_to: string;
}

export default function ActiveAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("is_delete", false)
      .order("timestamp", { ascending: false });
    if (data) setAlerts(data);
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      LOW: "info",
      MEDIUM: "warning",
      HIGH: "error",
      CRITICAL: "error",
    };
    return colors[severity] || "default";
  };

  const handleStatusUpdate = async (alertId: string, newStatus: string) => {
    await supabase
      .from("alerts")
      .update({ status: newStatus })
      .eq("alert_id", alertId);
    fetchAlerts();
  };

  return (
    <Box>
      <Button
        variant="contained"
        onClick={async () => {
          await supabase
            .from("alerts")
            .update({ status: "ACKNOWLEDGED" })
            .eq("status", "ACTIVE");
          fetchAlerts();
        }}
        sx={{ mb: 2 }}
      >
        Acknowledge All
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.alert_id}>
                <TableCell>
                  {new Date(alert.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>{alert.affected_entity}</TableCell>
                <TableCell>{alert.alert_type}</TableCell>
                <TableCell>
                  <Chip
                    label={alert.severity}
                    color={getSeverityColor(alert.severity) as any}
                  />
                </TableCell>
                <TableCell>{alert.status}</TableCell>
                <TableCell>{alert.description}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() =>
                      handleStatusUpdate(alert.alert_id, "ACKNOWLEDGED")
                    }
                    disabled={alert.status !== "ACTIVE"}
                  >
                    <Check />
                  </IconButton>
                  <IconButton
                    onClick={() =>
                      handleStatusUpdate(alert.alert_id, "RESOLVED")
                    }
                    disabled={alert.status === "RESOLVED"}
                  >
                    <Assignment />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

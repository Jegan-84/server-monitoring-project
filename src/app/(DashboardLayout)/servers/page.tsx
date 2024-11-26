"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { supabase } from "@/utils/supabase";
import { setSelectedServer } from "@/store/slices/serverDetailSlice";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

interface ServerDetails {
  server_details_id: number;
  server_name: string;
  ip_address: string;
  operating_system: string;
  location?: string;
  description?: string;
}

const ServerPage = () => {
  const [servers, setServers] = useState<ServerDetails[]>([]);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<Partial<ServerDetails>>({
    server_name: "",
    ip_address: "",
    operating_system: "",
    location: "",
    description: "",
  });
  const router = useRouter();
  const dispatch = useDispatch();
  // Fetch servers
  const fetchServers = async () => {
    const { data, error } = await supabase
      .from("server_details")
      .select("*")
      .eq("is_delete", false);
    if (error) console.error("Error fetching servers:", error);
    else setServers(data || []);
  };

  useEffect(() => {
    fetchServers();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    if (isEdit) {
      const { error } = await supabase
        .from("server_details")
        .update({
          ...formData,
          updated_date: new Date().toISOString(),
        })
        .eq("server_details_id", formData.server_details_id);
      if (error) console.error("Error updating server:", error);
    } else {
      const { error } = await supabase
        .from("server_details")
        .insert([formData]);
      if (error) console.error("Error adding server:", error);
    }
    handleClose();
    fetchServers();
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    const { error } = await supabase
      .from("server_details")
      .update({ is_delete: true })
      .eq("server_details_id", id);
    if (error) console.error("Error deleting server:", error);
    fetchServers();
  };

  // Dialog handlers
  const handleOpen = (server?: ServerDetails) => {
    if (server) {
      setFormData(server);
      setIsEdit(true);
    } else {
      setFormData({
        server_name: "",
        ip_address: "",
        operating_system: "",
        location: "",
        description: "",
      });
      setIsEdit(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({});
  };

  const handleViewServer = (server: ServerDetails) => {
    dispatch(setSelectedServer(server));
    router.push(`/serverMonitor`);
  };
  const handleViewScenario = (server: ServerDetails) => {
    dispatch(setSelectedServer(server));
    router.push(`/serverCurrentScenerio`);
  };
  return (
    <div>
      <Button variant="contained" color="primary" onClick={() => handleOpen()}>
        Add Server
      </Button>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Server Name</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>OS</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {servers.map((server) => (
              <TableRow key={server.server_details_id}>
                <TableCell>{server.server_name}</TableCell>
                <TableCell>{server.ip_address}</TableCell>
                <TableCell>{server.operating_system}</TableCell>
                <TableCell>{server.location}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(server)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(server.server_details_id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton onClick={() => handleViewServer(server)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton onClick={() => handleViewScenario(server)}>
                    <TimelineIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEdit ? "Edit Server" : "Add Server"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Server Name"
            value={formData.server_name}
            onChange={(e) =>
              setFormData({ ...formData, server_name: e.target.value })
            }
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="IP Address"
            value={formData.ip_address}
            onChange={(e) =>
              setFormData({ ...formData, ip_address: e.target.value })
            }
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Operating System"
            value={formData.operating_system}
            onChange={(e) =>
              setFormData({ ...formData, operating_system: e.target.value })
            }
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            margin="normal"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEdit ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ServerPage;

"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Typography,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import {
  getUsers,
  registerUser,
  updateUser,
  deleteUser,
  resetUserPassword,
} from "@/utils/userManagement";
import { supabase } from "@/utils/supabase";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    email: "",
    username: "",
    role: "VIEWER",
    status: true, // Active by default
    can_view_servers: false,
    can_modify_servers: false,
    can_view_services: false,
    can_modify_services: false,
    can_manage_alerts: false,
    can_generate_reports: false,
    password: "", // Added for new user registration
  });
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await updateUser(formData.user_id, {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          status: formData.status ? "ACTIVE" : "INACTIVE",
          can_view_servers: formData.can_view_servers,
          can_modify_servers: formData.can_modify_servers,
          can_view_services: formData.can_view_services,
          can_modify_services: formData.can_modify_services,
          can_manage_alerts: formData.can_manage_alerts,
          can_generate_reports: formData.can_generate_reports,
        });
      } else {
        const { user, error } = await registerUser(
          formData.email,
          formData.password,
          formData.username,
          formData.role,
          formData.can_view_servers,
          formData.can_modify_servers,
          formData.can_view_services,
          formData.can_modify_services,
          formData.can_manage_alerts,
          formData.can_generate_reports
        );

        if (error) {
          console.error("Error registering user:", error);
          return;
        }

        // Store the Supabase user ID in user_management
        await updateUser(user.id, { supabase_user_id: user.id });
      }
      handleClose();
      fetchUsers();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleOpen = (user?: any) => {
    if (user) {
      setFormData({
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status === "ACTIVE",
        can_view_servers: user.can_view_servers,
        can_modify_servers: user.can_modify_servers,
        can_view_services: user.can_view_services,
        can_modify_services: user.can_modify_services,
        can_manage_alerts: user.can_manage_alerts,
        can_generate_reports: user.can_generate_reports,
        password: "", // Do not show password
      });
      setIsEdit(true);
    } else {
      setFormData({
        user_id: "",
        email: "",
        username: "",
        role: "VIEWER",
        status: true,
        can_view_servers: false,
        can_modify_servers: false,
        can_view_services: false,
        can_modify_services: false,
        can_manage_alerts: false,
        can_generate_reports: false,
        password: "",
      });
      setIsEdit(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      user_id: "",
      email: "",
      username: "",
      role: "VIEWER",
      status: true,
      can_view_servers: false,
      can_modify_servers: false,
      can_view_services: false,
      can_modify_services: false,
      can_manage_alerts: false,
      can_generate_reports: false,
      password: "",
    });
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await resetUserPassword(userId);
      alert("Password reset email sent.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <Box sx={{ p: 3, bgcolor: "#f5f5f5", borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <TextField
            label="Filter by Username"
            variant="outlined"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ flexGrow: 1, mr: 2 }} // Flex grow for responsive design
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpen()}
            sx={{ height: "100%" }} // Match height with TextField
          >
            Add User
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Checkbox checked={user.status === "ACTIVE"} disabled />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user.user_id)}>
                    <DeleteIcon />
                  </IconButton>
                  <Button
                    onClick={() => handleResetPassword(user.supabase_user_id)}
                  >
                    Reset Password
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        sx={{ width: 400 }}
      >
        <div style={{ width: 400, padding: 20 }}>
          <h2>{isEdit ? "Edit User" : "Add User"}</h2>
          <TextField
            fullWidth
            label="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            margin="normal"
            required
          />
          {!isEdit && (
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              margin="normal"
              required
            />
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              required
            >
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="OPERATOR">Operator</MenuItem>
              <MenuItem value="VIEWER">Viewer</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.can_view_servers}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    can_view_servers: e.target.checked,
                  })
                }
              />
            }
            label="Can View Servers"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.can_modify_servers}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    can_modify_servers: e.target.checked,
                  })
                }
              />
            }
            label="Can Modify Servers"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.can_view_services}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    can_view_services: e.target.checked,
                  })
                }
              />
            }
            label="Can View Services"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.can_modify_services}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    can_modify_services: e.target.checked,
                  })
                }
              />
            }
            label="Can Modify Services"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.can_manage_alerts}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    can_manage_alerts: e.target.checked,
                  })
                }
              />
            }
            label="Can Manage Alerts"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.can_generate_reports}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    can_generate_reports: e.target.checked,
                  })
                }
              />
            }
            label="Can Generate Reports"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.checked })
                }
              />
            }
            label="Active"
          />
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEdit ? "Update" : "Add"}
          </Button>
        </div>
      </Drawer>
    </div>
  );
};

export default UserManagement;

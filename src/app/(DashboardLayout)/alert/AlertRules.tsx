"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { alertRulesService } from "@/services/alertRules";
import { AlertRule } from "@/types/alertRules";

export default function AlertRules() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRule, setCurrentRule] = useState<Partial<AlertRule>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    ruleId: string | null;
  }>({
    open: false,
    ruleId: null,
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const data = await alertRulesService.getAll();
      setRules(data);
    } catch (error) {
      console.error("Error fetching rules:", error);
      // Add error handling/notification here
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setCurrentRule({ ...currentRule, [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case "rule_name":
        if (!currentRule.rule_name?.trim()) {
          newErrors.rule_name = "Rule name is required";
        } else {
          delete newErrors.rule_name;
        }
        break;
      case "monitored_entity":
        if (!currentRule.monitored_entity) {
          newErrors.monitored_entity = "Monitored entity is required";
        } else {
          delete newErrors.monitored_entity;
        }
        break;
      case "condition_type":
        if (!currentRule.condition_type) {
          newErrors.condition_type = "Condition type is required";
        } else {
          delete newErrors.condition_type;
        }
        break;
      case "threshold_value":
        if (!currentRule.threshold_value && currentRule.threshold_value !== 0) {
          newErrors.threshold_value = "Threshold value is required";
        } else {
          delete newErrors.threshold_value;
        }
        break;
      case "severity":
        if (!currentRule.severity) {
          newErrors.severity = "Severity is required";
        } else {
          delete newErrors.severity;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleOpenDialog = (rule?: AlertRule) => {
    setCurrentRule(rule || {});
    setErrors({});
    setTouched({});
    setOpenDialog(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!currentRule.rule_name?.trim()) {
      newErrors.rule_name = "Rule name is required";
    }
    if (!currentRule.monitored_entity) {
      newErrors.monitored_entity = "Monitored entity is required";
    }
    if (!currentRule.condition_type) {
      newErrors.condition_type = "Condition type is required";
    }
    if (!currentRule.threshold_value && currentRule.threshold_value !== 0) {
      newErrors.threshold_value = "Threshold value is required";
    }
    if (!currentRule.severity) {
      newErrors.severity = "Severity is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Mark all fields as touched
    const allFields = [
      "rule_name",
      "monitored_entity",
      "condition_type",
      "threshold_value",
      "severity",
      "color",
    ];
    const newTouched = allFields.reduce(
      (acc, field) => ({ ...acc, [field]: true }),
      {}
    );
    setTouched(newTouched);

    // Validate all fields
    if (!validateForm()) {
      return;
    }

    try {
      if (currentRule.alert_rule_id) {
        await alertRulesService.update(currentRule.alert_rule_id, currentRule);
        setSnackbar({
          open: true,
          message: "Alert rule updated successfully!",
          severity: "success",
        });
      } else {
        await alertRulesService.create(currentRule);
        setSnackbar({
          open: true,
          message: "Alert rule created successfully!",
          severity: "success",
        });
      }
      setOpenDialog(false);
      fetchRules();
    } catch (error) {
      console.error("Error saving rule:", error);
      setSnackbar({
        open: true,
        message: "Error saving alert rule. Please try again.",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmation({
      open: true,
      ruleId: id,
    });
  };

  const handleConfirmedDelete = async () => {
    try {
      if (deleteConfirmation.ruleId) {
        await alertRulesService.delete(deleteConfirmation.ruleId);
        setSnackbar({
          open: true,
          message: "Alert rule deleted successfully!",
          severity: "success",
        });
        fetchRules();
      }
    } catch (error) {
      console.error("Error deleting rule:", error);
      setSnackbar({
        open: true,
        message: "Error deleting alert rule. Please try again.",
        severity: "error",
      });
    } finally {
      setDeleteConfirmation({ open: false, ruleId: null });
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        // onClick={() => {
        //   setCurrentRule({});
        //   setOpenDialog(true);
        // }}

        onClick={() => handleOpenDialog()}
        sx={{ mb: 2 }}
      >
        Add New Rule
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rule Name</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Condition</TableCell>
              <TableCell>Threshold</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.alert_rule_id}>
                <TableCell>{rule.rule_name}</TableCell>
                <TableCell>{rule.monitored_entity}</TableCell>
                <TableCell>{rule.condition_type}</TableCell>
                <TableCell>{rule.threshold_value}</TableCell>
                <TableCell>{rule.severity}</TableCell>
                <TableCell sx={{ color: rule.color }}>{rule.color}</TableCell>
                <TableCell>
                  <IconButton
                    // onClick={() => {
                    //   setCurrentRule(rule);
                    //   setOpenDialog(true);
                    // }}
                    onClick={() => handleOpenDialog(rule)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(rule.alert_rule_id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={undefined}
        disableEscapeKeyDown
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        disablePortal
        disableScrollLock
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentRule.alert_rule_id ? "Edit Rule" : "New Rule"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Rule Name"
              value={currentRule.rule_name || ""}
              onChange={(e) => handleFieldChange("rule_name", e.target.value)}
              onBlur={() => handleBlur("rule_name")}
              error={touched.rule_name && !!errors.rule_name}
              helperText={touched.rule_name && errors.rule_name}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Threshold Value"
              type="number"
              inputProps={{
                step: "0.01",
                min: "0",
                max: "100",
              }}
              value={currentRule.threshold_value || ""}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = value
                  ? Math.min(parseFloat(value), 100)
                  : undefined;
                const formattedValue = numValue
                  ? parseFloat(numValue.toFixed(2))
                  : undefined;
                setCurrentRule({
                  ...currentRule,
                  threshold_value: formattedValue,
                });
              }}
              sx={{ mb: 2 }}
              error={!!errors.threshold_value}
              helperText={errors.threshold_value}
            />

            <TextField
              fullWidth
              label="Duration (minutes)"
              type="number"
              inputProps={{
                min: "1",
                step: "1",
              }}
              value={currentRule.duration || ""}
              onChange={(e) =>
                setCurrentRule({
                  ...currentRule,
                  duration: Number(e.target.value),
                })
              }
              helperText="Specify the duration in minutes"
              sx={{ mb: 2 }}
            />

            <FormControl
              fullWidth
              variant="outlined"
              error={touched.monitored_entity && !!errors.monitored_entity}
              sx={{ mb: 2 }}
            >
              <InputLabel
                sx={{
                  backgroundColor: "white",
                  px: 1,
                }}
              >
                Monitored Entity
              </InputLabel>
              <Select
                value={currentRule.monitored_entity || ""}
                onChange={(e) =>
                  handleFieldChange("monitored_entity", e.target.value)
                }
                onBlur={() => handleBlur("monitored_entity")}
                label="Monitored Entity"
                sx={{
                  "& .MuiSelect-select": {
                    padding: "16.5px 14px",
                  },
                }}
              >
                <MenuItem value="SERVER">Server</MenuItem>
                <MenuItem value="SERVICE">Service</MenuItem>
              </Select>
              {touched.monitored_entity && errors.monitored_entity && (
                <FormHelperText error>{errors.monitored_entity}</FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              variant="outlined"
              error={touched.condition_type && !!errors.condition_type}
              sx={{ mb: 2 }}
            >
              <InputLabel
                sx={{
                  backgroundColor: "white",
                  px: 1,
                }}
              >
                Condition Type
              </InputLabel>
              <Select
                value={currentRule.condition_type || ""}
                onChange={(e) =>
                  handleFieldChange("condition_type", e.target.value)
                }
                onBlur={() => handleBlur("condition_type")}
                label="Condition Type"
                sx={{
                  "& .MuiSelect-select": {
                    padding: "16.5px 14px",
                  },
                }}
              >
                <MenuItem value="CPU_USAGE">CPU USAGE</MenuItem>
                <MenuItem value="MEMORY_USAGE">MEMORY USAGE</MenuItem>
                <MenuItem value="DISK_USAGE">DISK USAGE</MenuItem>
                <MenuItem value="SERVICE_DOWN">SERVICE DOWN</MenuItem>
                <MenuItem value="CUSTOM">CUSTOM</MenuItem>
              </Select>
              {touched.condition_type && errors.condition_type && (
                <FormHelperText error>{errors.condition_type}</FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              variant="outlined"
              error={touched.severity && !!errors.severity}
              sx={{ mb: 2 }}
            >
              <InputLabel
                sx={{
                  backgroundColor: "white",
                  px: 1,
                }}
              >
                Severity
              </InputLabel>
              <Select
                value={currentRule.severity || ""}
                onChange={(e) => handleFieldChange("severity", e.target.value)}
                onBlur={() => handleBlur("severity")}
                label="Severity"
                sx={{
                  "& .MuiSelect-select": {
                    padding: "16.5px 14px",
                  },
                }}
              >
                <MenuItem value="LOW">LOW</MenuItem>
                <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                <MenuItem value="HIGH">HIGH</MenuItem>
                <MenuItem value="CRITICAL">CRITICAL</MenuItem>
              </Select>
              {touched.severity && errors.severity && (
                <FormHelperText error>{errors.severity}</FormHelperText>
              )}
            </FormControl>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Color"
                value={currentRule.color || ""}
                onChange={(e) => handleFieldChange("color", e.target.value)}
                sx={{ mb: 2 }}
              />
            </Box>
            {/* Add other fields similarly */}

            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={currentRule.notification_email || false}
                    onChange={(e) =>
                      setCurrentRule({
                        ...currentRule,
                        notification_email: e.target.checked,
                      })
                    }
                  />
                }
                label="Email Notifications"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={currentRule.notification_sms || false}
                    onChange={(e) =>
                      setCurrentRule({
                        ...currentRule,
                        notification_sms: e.target.checked,
                      })
                    }
                  />
                }
                label="SMS Notifications"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={currentRule.notification_webhook || false}
                    onChange={(e) =>
                      setCurrentRule({
                        ...currentRule,
                        notification_webhook: e.target.checked,
                      })
                    }
                  />
                }
                label="Webhook Notifications"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={currentRule.notification_slack || false}
                    onChange={(e) =>
                      setCurrentRule({
                        ...currentRule,
                        notification_slack: e.target.checked,
                      })
                    }
                  />
                }
                label="Slack Notifications"
              />
              {/* Add other notification checkboxes */}
            </Box>
            <Box
              sx={{
                mt: 2,
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
              }}
            >
              <Button
                onClick={() => setOpenDialog(false)}
                variant="outlined"
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                disabled={Object.keys(errors).length > 0}
              >
                Save
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, ruleId: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this alert rule?
        </DialogContent>
        <Box sx={{ p: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            onClick={() => setDeleteConfirmation({ open: false, ruleId: null })}
            variant="outlined"
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmedDelete}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </Box>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

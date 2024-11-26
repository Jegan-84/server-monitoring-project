"use client";
import { useState } from "react";
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { supabase } from "@/utils/supabase";
import { ReportTemplate } from "@/types/reportTemplate";

interface Props {
  template: ReportTemplate | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportTemplateForm({
  template,
  onClose,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState({
    template_name: template?.template_name || "",
    description: template?.description || "",
    schedule_status: template?.schedule_status || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = (await supabase.auth.getUser()).data.user;
    const created_by = user?.email || "unknown";

    if (template) {
      // Update
      const { error } = await supabase
        .from("report_templates")
        .update({
          ...formData,
          last_modified: new Date().toISOString(),
          created_by,
        })
        .eq("report_templates_id", template.report_templates_id);

      if (error) {
        console.error("Error updating template:", error);
        return;
      }
    } else {
      // Create
      const { error } = await supabase.from("report_templates").insert({
        ...formData,
        created_by,
      });

      if (error) {
        console.error("Error creating template:", error);
        return;
      }
    }

    onSuccess();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogTitle>{template ? "Edit Template" : "Add Template"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField
            label="Template Name"
            required
            value={formData.template_name}
            onChange={(e) =>
              setFormData({ ...formData, template_name: e.target.value })
            }
          />
          <TextField
            label="Description"
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.schedule_status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    schedule_status: e.target.checked,
                  })
                }
              />
            }
            label="Schedule Status"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained">
          {template ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Box>
  );
}

"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabase } from "@/utils/supabase";
import { ReportTemplate } from "@/types/reportTemplate";
import ReportTemplateForm from "./ReportTemplateForm";

export default function ReportTemplatePage() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from("report_templates")
      .select("*")
      .eq("is_delete", false)
      .order("created_date", { ascending: false });

    if (error) {
      console.error("Error fetching templates:", error);
      return;
    }
    setTemplates(data || []);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("report_templates")
      .update({ is_delete: true })
      .eq("report_templates_id", id);

    if (error) {
      console.error("Error deleting template:", error);
      return;
    }
    fetchTemplates();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4">Report Templates</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedTemplate(null);
              setOpen(true);
            }}
          >
            Add Template
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Template Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Schedule Status</TableCell>
                <TableCell>Last Generated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.report_templates_id}>
                  <TableCell>{template.template_name}</TableCell>
                  <TableCell>{template.description}</TableCell>
                  <TableCell>
                    {template.schedule_status ? "Active" : "Inactive"}
                  </TableCell>
                  <TableCell>
                    {template.last_generated
                      ? new Date(template.last_generated).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setSelectedTemplate(template);
                        setOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(template.report_templates_id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <ReportTemplateForm
            template={selectedTemplate}
            onClose={() => setOpen(false)}
            onSuccess={() => {
              setOpen(false);
              fetchTemplates();
            }}
          />
        </Dialog>
      </Box>
    </Container>
  );
}

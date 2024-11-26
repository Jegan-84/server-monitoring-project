"use client";
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextField, Button, MenuItem, Typography, Box } from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../../utils/auth/firebaseConfig"; // Import your Firebase config
import projectService from "@/services/projectService";

// Validation schema
const validationSchema = Yup.object({
  projectId: Yup.string().required("Project ID is required"),
  title: Yup.string().required("Title is required"),
  description: Yup.string()
    .min(10, "Description should be at least 10 characters")
    .required("Description is required"),
  createdAt: Yup.date().required("Created date is required"),
  priority: Yup.string()
    .oneOf(["high", "medium", "low"], "Invalid priority level")
    .required("Priority is required"),
});

const AddProjectForm = () => {
  const formik = useFormik({
    initialValues: {
      projectId: "",
      title: "",
      description: "",
      createdAt: new Date().toISOString().split("T")[0], // Initialize with today's date
      priority: "medium",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        // Add project data to Firestore
        const projectData = {
          ...values,
          createdAt: new Date(), // Ensure it's a Date object
        };
        console.log("projectData", projectData);

        // Add project data to Firestore
        const docRef = await projectService.postProject(projectData);
        console.log("Project added with ID:", docRef);
      } catch (e) {
        console.error("Error adding project: ", e);
      }
    },
  });

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{ maxWidth: 500, mx: "auto", mt: 4 }}
    >
      <Typography variant="h5" gutterBottom>
        Add New Project
      </Typography>

      <TextField
        fullWidth
        label="Project ID"
        name="projectId"
        margin="normal"
        value={formik.values.projectId}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.projectId && Boolean(formik.errors.projectId)}
        helperText={formik.touched.projectId && formik.errors.projectId}
      />

      <TextField
        fullWidth
        label="Title"
        name="title"
        margin="normal"
        value={formik.values.title}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.title && Boolean(formik.errors.title)}
        helperText={formik.touched.title && formik.errors.title}
      />

      <TextField
        fullWidth
        label="Description"
        name="description"
        margin="normal"
        multiline
        rows={4}
        value={formik.values.description}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.description && Boolean(formik.errors.description)}
        helperText={formik.touched.description && formik.errors.description}
      />

      <TextField
        fullWidth
        label="Created At"
        name="createdAt"
        type="date"
        margin="normal"
        value={formik.values.createdAt}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.createdAt && Boolean(formik.errors.createdAt)}
        helperText={formik.touched.createdAt && formik.errors.createdAt}
        InputLabelProps={{
          shrink: true,
        }}
      />

      <TextField
        fullWidth
        label="Priority"
        name="priority"
        select
        margin="normal"
        value={formik.values.priority}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.priority && Boolean(formik.errors.priority)}
        helperText={formik.touched.priority && formik.errors.priority}
      >
        <MenuItem value="high">High</MenuItem>
        <MenuItem value="medium">Medium</MenuItem>
        <MenuItem value="low">Low</MenuItem>
      </TextField>

      <Button
        color="primary"
        variant="contained"
        fullWidth
        type="submit"
        sx={{ mt: 2 }}
      >
        Submit
      </Button>
    </Box>
  );
};

export default AddProjectForm;

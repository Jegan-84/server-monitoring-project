"use client";
import React from "react";
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

const Page = () => {
  const router = useRouter(); // Initialize router for navigation

  const handleSummaryReport = () => {
    router.push("/report/summary-report"); // Navigate to summary report
  };

  const handleProcessReport = () => {
    router.push("/report/process-report"); // Navigate to process report
  };

  const handleAlertReport = () => {
    router.push("/report/alert-report"); // Navigate to alert report
  };

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Report Pages
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Summary Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View the summary of the reports generated.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={handleSummaryReport}>
                Go to Summary
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Process Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Process the reports for further analysis.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={handleProcessReport}>
                Go to Process
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Alert Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Process the reports for Alert analysis.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={handleAlertReport}>
                Go to Process
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Page;

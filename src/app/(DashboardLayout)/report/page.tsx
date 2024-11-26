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
import { useRouter } from "next/navigation"; // Import useHistory for navigation

const page = () => {
  const history = useRouter(); // Initialize history for navigation

  const handleSummaryReport = () => {
    history.push("/report/summary-report"); // Navigate to summary report
  };

  const handleProcessReport = () => {
    history.push("/report/process-report"); // Navigate to process report
  };
  const handleAlertReport = () => {
    history.push("/report/alert-report"); // Navigate to process report
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

export default page;

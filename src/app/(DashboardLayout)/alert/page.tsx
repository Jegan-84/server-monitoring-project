"use client";
import { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import AlertRules from "./AlertRules";
import ActiveAlerts from "./ActiveAlerts";

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AlertManagement() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Alert Rules" />
        <Tab label="Active Alerts" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <AlertRules />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <ActiveAlerts />
      </TabPanel>
    </Box>
  );
}

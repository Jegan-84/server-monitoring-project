import React from "react";
import { TextField, Box, Button } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

interface DateRangeSelectorProps {
  startTime: Date;
  endTime: Date;
  onStartTimeChange: (date: Date | null) => void;
  onEndTimeChange: (date: Date | null) => void;
  onFetchData: () => void;
}

const DateRangeSelector = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  onFetchData,
}: DateRangeSelectorProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
        <DateTimePicker
          label="Start Time"
          value={startTime}
          onChange={onStartTimeChange}
          maxDateTime={endTime}
          slotProps={{ textField: { size: "small" } }}
          sx={{ bgcolor: "white", borderRadius: 1 }}
        />
        <DateTimePicker
          label="End Time"
          value={endTime}
          onChange={onEndTimeChange}
          minDateTime={startTime}
          slotProps={{ textField: { size: "small" } }}
          sx={{ bgcolor: "white", borderRadius: 1 }}
        />
        <Button variant="contained" onClick={onFetchData} sx={{ height: 40 }}>
          Fetch Data
        </Button>
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangeSelector;

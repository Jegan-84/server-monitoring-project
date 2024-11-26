// src/app/(DashboardLayout)/layout/sidebar/Sidebar.tsx
import {
  useMediaQuery,
  Box,
  Drawer,
  Typography,
  IconButton,
} from "@mui/material";
import SidebarItems from "./SidebarItems";
import { Upgrade } from "./Updrade";
import { Sidebar, Logo } from "react-mui-sidebar";
import {
  Close,
  CloseFullscreenSharp,
  CloseOutlined,
} from "@mui/icons-material";

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const MSidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
  setSidebarOpen,
}: ItemType) => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));

  const sidebarWidth = isSidebarOpen ? "270px" : "0";

  // Custom CSS for short scrollbar
  const scrollbarStyles = {
    "&::-webkit-scrollbar": {
      width: "7px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#eff2f7",
      borderRadius: "15px",
    },
  };

  if (lgUp) {
    return (
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
        }}
      >
        {/* ------------------------------------------- */}
        {/* Sidebar for desktop */}
        {/* ------------------------------------------- */}
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="persistent"
          PaperProps={{
            sx: {
              boxSizing: "border-box",
              ...scrollbarStyles,
            },
          }}
        >
          {/* ------------------------------------------- */}
          {/* Sidebar Box */}
          {/* ------------------------------------------- */}
          <Box
            sx={{
              height: "100%",
            }}
          >
            <Sidebar
              width={isSidebarOpen ? "270px" : "0"} // Update width based on isSidebarOpen
              collapsewidth={isSidebarOpen ? "80px" : "0"}
              open={false}
              themeColor="#5d87ff"
              themeSecondaryColor="#49beff"
              showProfile={false}
            >
              {/* ------------------------------------------- */}
              {/* Logo & Title */}
              {/* ------------------------------------------- */}
              <Box
                sx={{
                  padding: "10px 16px",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center", // Align items vertically
                  justifyContent: "space-between", // Space between title and icon
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700, // Make the font bolder
                    color: "primary.dark", // Change the color to match the theme
                    textAlign: "left", // Align text to the left
                    letterSpacing: "1px", // Increase letter spacing for a more elegant look
                    // Add padding for better spacing
                    // Add a subtle shadow for depth
                    flexGrow: 1, // Allow title to take available space
                  }}
                >
                  Server Monitoring
                </Typography>
                <IconButton
                  onClick={() => setSidebarOpen(false)}
                  aria-label="close sidebar"
                >
                  <CloseOutlined />{" "}
                  {/* Replace with your close icon component */}
                </IconButton>
              </Box>
              <Box>
                {/* ------------------------------------------- */}
                {/* Sidebar Items */}
                {/* ------------------------------------------- */}
                <SidebarItems />
                <Upgrade />
              </Box>
            </Sidebar>
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose} // Close when the sidebar is not open
      variant="temporary"
      PaperProps={{
        sx: {
          boxShadow: (theme) => theme.shadows[8],
          ...scrollbarStyles,
        },
      }}
    >
      {/* ------------------------------------------- */}
      {/* Sidebar Box */}
      {/* ------------------------------------------- */}
      <Box px={2}>
        <Sidebar
          width={"270px"}
          collapsewidth="80px"
          isCollapse={isSidebarOpen} // Update to reflect the isSidebarOpen state
          mode="light"
          direction="ltr"
          themeColor="#5d87ff"
          themeSecondaryColor="#49beff"
          showProfile={false}
        >
          {/* ------------------------------------------- */}
          {/* Logo */}
          {/* ------------------------------------------- */}
          {/* <Logo img="/images/logos/dark-logo.svg" /> */}
          <Box
            sx={{
              padding: "24px 16px",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: (theme) => theme.palette.text.primary,
                textAlign: "center",
                letterSpacing: "0.5px",
              }}
            >
              Aalam Server Monitoring
            </Typography>
          </Box>
          {/* ------------------------------------------- */}
          {/* Sidebar Items */}
          {/* ------------------------------------------- */}
          <SidebarItems />
          <Upgrade />
        </Sidebar>
      </Box>
      {/* ------------------------------------------- */}
      {/* Sidebar For Mobile */}
      {/* ------------------------------------------- */}
    </Drawer>
  );
};

export default MSidebar;

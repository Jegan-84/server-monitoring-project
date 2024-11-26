import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  Badge,
  Button,
  Typography,
} from "@mui/material";
import PropTypes from "prop-types";
import Link from "next/link";
// components
import Profile from "./Profile";
import { IconBellRinging, IconMenu } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectAccessToken } from "@/store/slices/authSlice"; // Import selectors

interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
  setSidebarOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
}

const Header = ({
  toggleMobileSidebar,
  setSidebarOpen,
  isSidebarOpen,
}: ItemType) => {
  // const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  // const lgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const user = useSelector(selectCurrentUser); // Get current user
  console.log("user", user?.additionalData);
  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: "none",
    background: theme.palette.background.paper,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    [theme.breakpoints.up("lg")]: {
      minHeight: "70px",
    },
  }));
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: "100%",
    color: theme.palette.text.secondary,
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        {!isSidebarOpen ? (
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            onClick={() => setSidebarOpen(!isSidebarOpen)} // Toggle sidebar open state
            sx={{
              display: {
                lg: "inline", // Show on larger screens
                xs: "none",
              },
            }}
          >
            <IconMenu width="20" height="20" />
          </IconButton>
        ) : null}

        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          {user?.additionalData && (
            <Box textAlign="center">
              {" "}
              {/* Center align the text */}
              <Typography
                variant="h6" // Use MUI Typography for consistent styling
                component="span"
                fontWeight="bold"
                textTransform="uppercase"
                fontSize="1.5rem" // Larger font size for username
              >
                {user.additionalData.username}
              </Typography>
              <Typography
                variant="body2" // Use MUI Typography for role
                component="span"
                color="primary" // Use primary color for highlighting
                fontSize="0.875rem" // Smaller font size for role
                display="block"
                marginTop="4px"
              >
                {user.additionalData.role}
              </Typography>
            </Box>
          )}
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;

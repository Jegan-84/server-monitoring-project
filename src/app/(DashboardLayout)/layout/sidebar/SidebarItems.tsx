import React from "react";
import { usePathname } from "next/navigation";
import { Box, List } from "@mui/material";
import NavItem from "./NavItem";
import NavGroup from "./NavGroup/NavGroup";
import {
  IconAlertCircle,
  IconFileReport,
  IconLayoutDashboard,
  IconServerBolt,
  IconUsersGroup,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/slices/authSlice";
const Menuitems = [
  {
    navlabel: true,
    subheader: "Home",
  },

  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
    roles: ["ADMIN", "VIEWER", "OPERATOR"],
  },
  {
    id: uniqueId(),
    title: "Servers",
    icon: IconServerBolt,
    href: "/servers",
    roles: ["ADMIN", "VIEWER", "OPERATOR"],
  },

  {
    id: uniqueId(),
    title: "Alert Management",
    icon: IconAlertCircle,
    href: "/alert",
    roles: ["ADMIN"],
  },
  {
    id: uniqueId(),
    title: "Reports",
    icon: IconFileReport,
    href: "/report",
    roles: ["ADMIN", "VIEWER", "OPERATOR"],
  },
  {
    id: uniqueId(),
    title: "User Management",
    icon: IconUsersGroup,
    href: "/user-management",
    roles: ["ADMIN"],
  },
];

const SidebarItems = ({ toggleMobileSidebar }: any) => {
  const pathname = usePathname();
  const pathDirect = pathname;
  const user: any = useSelector(selectCurrentUser); // Get current user

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav" component="div">
        {Menuitems.map((item) => {
          // {/********SubHeader**********/}
          if (item.subheader) {
            return <NavGroup item={item} key={item.subheader} />;

            // {/********If Sub Menu**********/}
            /* eslint no-else-return: "off" */
          } else {
            if (
              item.roles &&
              !item.roles.includes(user?.additionalData?.role)
            ) {
              return null; // Skip rendering this item if the role doesn't match
            }
            return (
              <NavItem
                item={item}
                key={item.id}
                pathDirect={pathDirect}
                onClick={toggleMobileSidebar}
              />
            );
          }
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;

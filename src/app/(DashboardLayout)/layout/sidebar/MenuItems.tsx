import {
  IconAlertCircle,
  IconFileReport,
  IconLayoutDashboard,
  IconServerBolt,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

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
  },
  {
    id: uniqueId(),
    title: "Servers",
    icon: IconServerBolt,
    href: "/servers",
  },

  {
    id: uniqueId(),
    title: "Alert Management",
    icon: IconAlertCircle,
    href: "/alert",
  },
  {
    id: uniqueId(),
    title: "Report Template",
    icon: IconFileReport,
    href: "/report-template",
  },
];

export default Menuitems;

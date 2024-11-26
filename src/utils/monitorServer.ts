// utils/monitorServer.ts
import serverConfig from "./serverConfig";

export const checkServerHealth = async (): Promise<{
  status: string;
  data?: any;
}> => {
  const url = `http://${serverConfig.ip}:${serverConfig.port}${serverConfig.healthEndpoint}`;
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return { status: "healthy", data };
    }
    return { status: "unhealthy" };
  } catch (error) {
    return { status: "unreachable" };
  }
};

import axios from "axios";

interface DateRangeParams {
  ip_address: string;
  port?: number;
  start_time: string;
  end_time: string;
}

const serverService = {
  getRangeData: async (params: DateRangeParams) => {
    try {
      const url = `http://${params.ip_address}:${
        params.port || 5000
      }/monitor/range`;
      console.log(" params.start_time", params.start_time);
      console.log(" params.end", params.end_time);
      console.log("DateRangeParams", params);

      // Make POST request with JSON body
      const response = await axios.post(
        url,
        {
          start_time: params.start_time,
          end_time: params.end_time,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("response");

      return response.data;
    } catch (error) {
      console.error("Error in getRangeData:", error);
      throw error;
    }
  },
};

export { serverService };

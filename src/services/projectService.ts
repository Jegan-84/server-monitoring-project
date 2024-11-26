import axios from "axios";
type ProjectData = {
  name: string;
  fields: {
    [key: string]: {
      stringValue?: string;
      numberValue?: number;
      booleanValue?: boolean;
      timestampValue?: string;
    };
  };
};

type ExtractedFields = {
  title: string;
  description: string;
  priority: string;
  projectId: string;
  createdAt: string;
};

const extractFieldValuesAsObject = (data: ProjectData[]): ExtractedFields[] => {
  return data.map((project) => ({
    title:
      project.fields.title?.stringValue ||
      project.fields.title?.numberValue?.toString() ||
      project.fields.title?.booleanValue?.toString() ||
      "",
    description:
      project.fields.description?.stringValue ||
      project.fields.description?.numberValue?.toString() ||
      project.fields.description?.booleanValue?.toString() ||
      "",
    priority:
      project.fields.priority?.stringValue ||
      project.fields.priority?.numberValue?.toString() ||
      project.fields.priority?.booleanValue?.toString() ||
      "",
    projectId:
      project.fields.projectId?.stringValue ||
      project.fields.projectId?.numberValue?.toString() ||
      project.fields.projectId?.booleanValue?.toString() ||
      "",
    createdAt: project.fields.createdAt?.timestampValue || "",
  }));
};
const postProject = async (projectData: any) => {
  // Retrieve the Firebase ID token from localStorage
  const token = localStorage.getItem("token");
  console.log("token", token);

  if (!token) {
    console.error("No token found in localStorage.");
    return;
  }
  console.log("projectData", projectData);
  const data = {
    fields: projectData,
  };

  console.log("data", data);

  // POST request to Firestore REST API with token
  try {
    const response = await axios.post(
      "https://firestore.googleapis.com/v1/projects/customer-portal-ee2e5/databases/(default)/documents/project",
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Passing token in the header
        },
      }
    );
    console.log("Project posted successfully", response.data);
  } catch (error) {
    console.error("Error posting project", error);
  }
};
const getProjectList = async () => {
  // Retrieve the Firebase ID token from localStorage
  const token = localStorage.getItem("token");
  console.log("token", token);

  if (!token) {
    console.error("No token found in localStorage.");
    return;
  }

  // POST request to Firestore REST API with token
  try {
    const response = await axios.get(
      "https://firestore.googleapis.com/v1/projects/customer-portal-ee2e5/databases/(default)/documents/project",
      {
        headers: {
          Authorization: `Bearer ${token}`, // Passing token in the header
        },
      }
    );
    console.log("Project get successfully", response.data);
    const extractedData = extractFieldValuesAsObject(response.data?.documents);
    console.log(extractedData);
    return extractedData;
  } catch (error) {
    console.error("Error get project", error);
  }
};

export default { postProject, getProjectList };

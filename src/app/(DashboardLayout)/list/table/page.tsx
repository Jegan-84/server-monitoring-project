"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Paper,
  Typography,
  Button,
} from "@mui/material";
import projectService from "@/services/projectService";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useRouter } from "next/navigation";

interface Project {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const router = useRouter();
  useEffect(() => {
    // Fetch projects from an API or a local source
    const fetchProjects = async () => {
      // Replace with your API call
      const response: any = await projectService.getProjectList();
      //   const data = response;
      setProjects(response);
    };

    fetchProjects();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page on search
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page on rows per page change
  };

  const filteredProjects = projects?.filter((project) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer title="Sample Page" description="this is Sample page">
      <DashboardCard title="Project">
        <Paper>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push("/list")} // Navigate to create project page
            style={{ marginBottom: "16px" }} // Add some margin for spacing
          >
            Create Project
          </Button>
          <TextField
            label="Search Projects"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            margin="normal"
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>SI NO</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects
                  ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  ?.map((project, index) => (
                    <TableRow key={project.id}>
                      <TableCell>{index}</TableCell>
                      <TableCell>{project.title}</TableCell>
                      <TableCell>{project.description}</TableCell>
                      <TableCell>{project.createdAt}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredProjects?.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </DashboardCard>
    </PageContainer>
  );
};

export default ProjectList;

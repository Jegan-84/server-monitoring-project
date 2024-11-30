"use client";
import React, { useState } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { supabase } from "../../../utils/supabase"; // Importing the Supabase client
import { useRouter } from "next/navigation"; // Importing useRouter for navigation
interface loginType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
}
const AuthRegister = ({ title, subtitle, subtext }: loginType) => {
  const [email, setEmail] = useState(""); // State for email
  const [password, setPassword] = useState(""); // State for password
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Initializing the router

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    console.log("data", data);

    if (error) {
      setError("Error signing up: " + error.message);
    } else {
      // Redirect to login page after successful registration
      router.push("/authentication/login");
    }
  };

  return (
    <>
      <Typography fontWeight="700" variant="h2" mb={1}>
        Register
      </Typography>
      {error && <Typography color="error">{error}</Typography>}{" "}
      {/* Display error message */}
      <form onSubmit={handleRegister}>
        <Stack spacing={2}>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="email"
              mb="5px"
            >
              Email
            </Typography>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update email state
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="password"
              mb="5px"
            >
              Password
            </Typography>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Update password state
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </Box>
          <Box>
            <Button
              color="primary"
              variant="contained"
              size="large"
              fullWidth
              type="submit" // Ensure this is a submit button
            >
              Register
            </Button>
          </Box>
        </Stack>
      </form>
    </>
  );
};

export default AuthRegister;

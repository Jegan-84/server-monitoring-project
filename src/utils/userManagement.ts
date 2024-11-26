// src/utils/userManagement.ts
import { supabase } from "./supabase";

// Function to register a user
export const registerUser = async (
  email: string,
  password: string,
  username: string,
  role: string,
  can_view_servers: boolean,
  can_modify_servers: boolean,
  can_view_services: boolean,
  can_modify_services: boolean,
  can_manage_alerts: boolean,
  can_generate_reports: boolean
) => {
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  const { error: dbError } = await supabase.from("user_management").insert([
    {
      supabase_user_id: data.user?.id,
      username,
      email,
      role,
      password,
      status: "ACTIVE",
      can_view_servers, // Updated to use parameter
      can_modify_servers, // Updated to use parameter
      can_view_services, // Updated to use parameter
      can_modify_services, // Updated to use parameter
      can_manage_alerts, // Updated to use parameter
      can_generate_reports, // Updated to use parameter
    },
  ]);

  if (dbError) {
    throw new Error(dbError.message);
  }

  return data;
};

// Function to get all users
export const getUsers = async () => {
  const { data, error } = await supabase.from("user_management").select("*");
  if (error) throw new Error(error.message);
  return data;
};

// Function to update a user
export const updateUser = async (userId: string, updates: any) => {
  const { error } = await supabase
    .from("user_management")
    .update(updates)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
};

// Function to delete a user
export const deleteUser = async (userId: string) => {
  const { error } = await supabase
    .from("user_management")
    .delete()
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
};

// Function to reset user password
export const resetUserPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
};

import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mseufnqrzgiqjrxwvwvh.supabase.co";
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZXVmbnFyemdpcWpyeHd2d3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyOTAzMzIsImV4cCI6MjA1OTg2NjMzMn0.xVf3-jVzik-uhxwraeeNF5tcnb3YeRDOTN7ohGhpCoE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

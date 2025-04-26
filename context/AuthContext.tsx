import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/utils/supabase";

// Define the Profile type to hold the profile data.
type Profile = {
    first_name: string;
    middle_name?: string;
    last_name: string;
    contact_number: string;
    age?: number;
    birthday?: string;
    sex?: string;
    address?: string;
};

// Define the User type, which includes both auth data and profile data.
type User = {
    id: string;
    email: string;
    profile: Profile | null; // Include profile data as part of the user object
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch the profile data based on userId
    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from("profiles")
            .select("first_name, middle_name, last_name, contact_number, age, birthday, sex, address")
            .eq("id", userId)
            .single();

        if (error) {
            console.error("Error fetching profile:", userId, error.message);
            return null;
        }
        return data;
    };

    useEffect(() => {
        // Initialize by checking the session and setting user & profile
        const initialize = async () => {
            const { data } = await supabase.auth.getSession();
            const currentUser = data?.session?.user ?? null;

            if (currentUser) {
                const profile = await fetchProfile(currentUser.id);
                setUser({
                    id: currentUser.id,
                    email: currentUser.email ?? "", // Fallback to an empty string if email is undefined
                    profile,
                });
            }
            setLoading(false);
        };

        initialize();

        // Listen for authentication state changes (login/logout)
        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            if (currentUser) {
                const profile = await fetchProfile(currentUser.id);
                setUser({
                    id: currentUser.id,
                    email: currentUser.email ?? "", // Fallback to an empty string if email is undefined
                    profile,
                });
            } else {
                setUser(null);
            }
        });

        // Cleanup listener on component unmount
        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    // Return the context provider to make this state accessible globally
    return <AuthContext.Provider value={{ user, loading, setUser }}>{children}</AuthContext.Provider>;
};

// Custom hook to access Auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

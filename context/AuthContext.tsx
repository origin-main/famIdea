import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/utils/supabase";

type Profile = {
    first_name: string;
    middle_name?: string;
    last_name: string;
    contact_number: string;
    age?: number;
    birthday?: string;
    sex?: string;
    address?: string;
    profile_picture_url?: string;
};

type User = {
    id: string;
    email: string;
    profile: Profile | null;
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
            .select("first_name, middle_name, last_name, contact_number, age, birthday, sex, address, profile_picture_url")
            .eq("id", userId)
            .single();

        if (error) {
            console.error("Error fetching profile:", userId, error.message);
            return null;
        }
        return data;
    };

    useEffect(() => {
        let profileChannel: any;

        const initialize = async () => {
            const { data } = await supabase.auth.getSession();
            const currentUser = data?.session?.user ?? null;

            if (currentUser) {
                const profile = await fetchProfile(currentUser.id);
                setUser({
                    id: currentUser.id,
                    email: currentUser.email ?? "",
                    profile,
                });

                // Listen for changes in the current user's profile
                profileChannel = supabase
                    .channel("profile-updates")
                    .on(
                        "postgres_changes",
                        {
                            event: "UPDATE",
                            schema: "public",
                            table: "profiles",
                            filter: `id=eq.${currentUser.id}`,
                        },
                        async (payload) => {
                            console.log("Profile updated:", payload);

                            setUser((prevUser) => {
                                if (!prevUser) return prevUser;

                                return {
                                    ...prevUser,
                                    profile: {
                                        ...prevUser.profile,
                                        ...payload.new,
                                    } as Profile,
                                };
                            });
                        }
                    )
                    .subscribe();
            }

            setLoading(false);
        };

        initialize();

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            if (currentUser) {
                const profile = await fetchProfile(currentUser.id);
                setUser({
                    id: currentUser.id,
                    email: currentUser.email ?? "",
                    profile,
                });
            } else {
                setUser(null);
            }
        });

        // Cleanup listeners on component unmount
        return () => {
            authListener?.subscription.unsubscribe();
            profileChannel?.unsubscribe();
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

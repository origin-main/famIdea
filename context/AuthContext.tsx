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
    emergency_contact: string;
    emergency_contact_number: string;
    estimated_due_date: Date | undefined;
    previous_pregnancies: string;
    deliveries: string;
    complications: string;
    medical_conditions: string;
    allergies: string;
    medications: string;
    blood_type: string;
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

    // Fetch the patient data based on userId
    const fetchPatient = async (userId: string) => {
        const { data, error } = await supabase
            .from("patients")
            .select(
                `first_name, 
                middle_name, 
                last_name, 
                contact_number, 
                age, birthday, 
                sex, 
                address, 
                profile_picture_url,
                emergency_contact,
                emergency_contact_number,
                estimated_due_date,
                previous_pregnancies,
                deliveries,
                complications,
                medical_conditions,
                allergies,
                medications,
                blood_type`
            )
            .eq("id", userId)
            .single();

        if (error) {
            console.error("Error fetching patient:", userId, error.message);
            return null;
        }
        return data;
    };

    useEffect(() => {
        let patientChannel: any;

        const initialize = async () => {
            const { data } = await supabase.auth.getSession();
            const currentUser = data?.session?.user ?? null;

            if (currentUser) {
                const profile = await fetchPatient(currentUser.id);
                setUser({
                    id: currentUser.id,
                    email: currentUser.email ?? "",
                    profile,
                });

                // Listen for changes in the current user's patient
                patientChannel = supabase
                    .channel("patient-updates")
                    .on(
                        "postgres_changes",
                        {
                            event: "UPDATE",
                            schema: "public",
                            table: "patients",
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
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            const currentUser = session?.user ?? null;

            if (currentUser) {
                setTimeout(async () => {
                    try {
                        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                            const profile = await fetchPatient(currentUser.id);
                            setUser({
                                id: currentUser.id,
                                email: currentUser.email ?? "",
                                profile,
                            });
                        } else {
                            setUser({
                                id: currentUser.id,
                                email: currentUser.email ?? "",
                                profile: null,
                            });
                        }
                    } catch (error: any) {
                        console.error("Error fetching patient profile:", error.message);
                        setUser({
                            id: currentUser.id,
                            email: currentUser.email ?? "",
                            profile: null,
                        });
                    }
                }, 0);
            } else {
                setUser(null);
            }
        });

        // Cleanup listeners on component unmount
        return () => {
            authListener?.subscription.unsubscribe();
            patientChannel?.unsubscribe();
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

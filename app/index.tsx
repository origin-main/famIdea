// app/index.tsx
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace("/(tabs)/home");
            } else {
                router.replace("/login");
            }
        }
    }, [user, loading]);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
        </View>
    );
}

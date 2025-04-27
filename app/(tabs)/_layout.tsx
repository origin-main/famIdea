import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/components/constants";

export default function TabLayout() {
    //   const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: COLORS.lightBlue,
                tabBarInactiveTintColor: "grey", // Unselected tab text color

                headerShown: false,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: Platform.select({
                    ios: {
                        position: "absolute",
                        backgroundColor: COLORS.darkBlue,
                    },
                    default: {
                        backgroundColor: COLORS.darkBlue,
                    },
                }),
                tabBarLabelStyle: {
                    color: "white",
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: () => <Ionicons size={28} name="home" color={"white"} />,
                }}
            />
            <Tabs.Screen
                name="messaging"
                options={{
                    title: "Messaging",
                    tabBarIcon: () => <Ionicons size={28} name="chatbox-ellipses" color={"white"} />,
                }}
            />
            <Tabs.Screen
                name="appointment/appointment"
                options={{
                    title: "Appointment",
                    tabBarIcon: () => <Ionicons size={28} name="calendar" color={"white"} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: () => <Ionicons size={28} name="person-circle-outline" color={"white"} />,
                }}
            />
        </Tabs>
    );
}

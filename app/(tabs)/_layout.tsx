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
                    href: "/home",
                    tabBarIcon: () => <Ionicons size={28} name="home" color={"white"} />,
                }}
            />
            <Tabs.Screen
                name="messaging"
                options={{
                    title: "Messaging",
                    href: "/messaging",
                    tabBarIcon: () => <Ionicons size={28} name="chatbox-ellipses" color={"white"} />,
                }}
            />
            <Tabs.Screen
                name="appointment/index"
                options={{
                    title: "Appointment",
                    href: "/appointment",
                    tabBarIcon: () => <Ionicons size={28} name="calendar" color={"white"} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    href: "/profile",
                    tabBarIcon: () => <Ionicons size={28} name="person-circle-outline" color={"white"} />,
                }}
            />
        </Tabs>
    );
}

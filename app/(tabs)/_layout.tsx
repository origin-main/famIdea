import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View, Text } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/components/constants";
import { useAlert } from "@/context/AlertContext";

export default function TabLayout() {
    const { messageCount } = useAlert();

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
                    tabBarIcon: () => (
                        <>
                            {messageCount > 0 && (
                                <View style={styles.badgeCount}>
                                    <Text style={{ fontSize: 12, fontWeight: "bold", color: "white" }}>{messageCount > 9 ? "9+" : messageCount}</Text>
                                </View>
                            )}
                            <Ionicons size={28} name="chatbox-ellipses" color={"white"} />
                        </>
                    ),
                }}
            />
            <Tabs.Screen
                name="appointment"
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

const styles = StyleSheet.create({
    badgeCount: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: "red",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        width: 20,
        height: 20,
        borderRadius: 100,
        zIndex: 100,
    },
});

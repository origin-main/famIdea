import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, Text, ImageBackground, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/components/constants";
import { Card } from "react-native-paper";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { router } from "expo-router";
import { useAlert } from "@/context/AlertContext";

export type Notification = {
    id: number;
    type: string;
    patientId: string | null;
    title: string;
    body: string;
    createdAt: string;
    appointmentId: string | null;
    birthCenter: {
        id: string;
        name: string;
        pictureUrl: string | null;
    } | null;
};

export default function Notifications() {
    const { user } = useAuth();
    const { markNotificationsAsSeen } = useAlert();
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        fetchNotifications();
        markNotificationsAsSeen();

        const channel = supabase
            .channel("notifications-changes")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `receiver_id=eq.${user?.id}`,
                },
                (payload) => {
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const fetchNotifications = async () => {
        if (!user?.id) return;

        setLoading(true);
        const { data, error } = await supabase
            .from("notifications")
            .select(
                `id, type, patient_id, title, body, appointment_id, created_at,
                birth_centers (id, name, picture_url)
                `
            )
            .eq("receiver_id", user.id)
            .neq("type", "message")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Failed to fetch notifications:", error.message);
        } else {
            const notificationData: any = data;
            const notifications: Notification[] = (notificationData || []).map((n: any) => ({
                id: n.id,
                type: n.type,
                patientId: n.patient_id,
                title: n.title,
                body: n.body,
                appointmentId: n.appointment_id,
                createdAt: n.created_at,
                birthCenter: n.birth_centers
                    ? {
                          id: n.birth_centers.id,
                          name: n.birth_centers.name,
                          pictureUrl: n.birth_centers.picture_url,
                      }
                    : null,
            }));

            setNotifications(notifications);
        }

        setLoading(false);
    };

    const handleNotificationClick = (notification: Notification) => {
        if (notification.type === "appointment") {
            router.replace({
                pathname: "/appointment/appointment-details",
                params: { id: notification.appointmentId },
            });
        }
    };

    return (
        <ImageBackground
            source={require("@/assets/images/background.png")}
            style={{
                flex: 1,
                justifyContent: "center",
                backgroundColor: COLORS.white,
                alignItems: "center",
            }}
            resizeMode="cover"
        >
            <SafeAreaView style={{ width: "100%", height: "100%", padding: 20 }}>
                <View
                    style={{
                        alignItems: "flex-end",
                        width: "100%",
                        marginTop: 10,
                        marginBottom: 30,
                    }}
                >
                    <Text style={{ fontSize: 27 }}>Notifications</Text>
                </View>

                <FlatList
                    data={notifications}
                    keyExtractor={(item, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchNotifications} />}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => {
                                handleNotificationClick(item);
                            }}
                            activeOpacity={0.8}
                        >
                            <Card style={{ width: "100%", height: 110, marginBottom: 10 }}>
                                <Card.Content style={{ width: "100%", height: "100%" }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", paddingBottom: 10, flex: 1 }}>
                                        <Image
                                            style={{
                                                width: 50,
                                                height: 50,
                                                backgroundColor: COLORS.lightBlue,
                                                objectFit: "fill",
                                                marginRight: 20,
                                                borderRadius: 50,
                                            }}
                                            source={item.birthCenter?.pictureUrl || require("@/assets/images/service-icons/health-clinic.png")}
                                        />
                                        <View style={{ gap: 5, flex: 1 }}>
                                            <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
                                            <Text style={{ width: "100%" }} numberOfLines={2}>
                                                {item.body}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text
                                        style={{
                                            position: "absolute",
                                            right: 10,
                                            bottom: 10,
                                            color: "lightgrey",
                                        }}
                                    >
                                        {formatDistanceToNow(new Date(item.createdAt), {
                                            addSuffix: true,
                                        })}
                                    </Text>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                    )}
                />
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        width: 250,
        borderRadius: 20,
    },
    title: {
        fontSize: 32,
        fontFamily: "Roboto",
        fontWeight: "bold",
        margin: 20,
    },
    button: {
        backgroundColor: COLORS.lightBlue,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        width: 200,
    },
    buttonText: {
        color: "black",
        fontSize: 18,
        fontWeight: "bold",
    },
});

import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, Text, ImageBackground, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/components/constants";
import { ActivityIndicator, Card, IconButton } from "react-native-paper";
import { router } from "expo-router";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

type Chat = {
    birth_center_id: string;
    latest_message: string;
    latest_message_time: string;
    name: string;
    picture_url: string;
    receiver_id: string;
    sender_id: string;
    unread_count: number;
};

export default function Index() {
    const { user } = useAuth();
    const [chatList, setChatList] = useState<Chat[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchChatList();
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        fetchChatList();

        const channel = supabase
            .channel("chat-list")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "messages",
                    filter: `patient_id=eq.${user.id}`,
                },
                fetchChatList
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    const fetchChatList = async () => {
        setLoading(true);
        const { data, error } = await supabase.rpc("get_latest_birth_center_chats", { patient_uuid: user?.id });

        if (error) {
            console.error("Failed to fetch latest chats:", error.message);
        } else {
            setChatList(data);
        }

        setLoading(false);
    };

    const handleMessageClick = (item: Chat) => {
        router.navigate({
            pathname: "/messaging/chat",
            params: { birthCenterId: item?.birth_center_id, name: item?.name },
        });
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
                    <Text style={{ fontSize: 27 }}>Messages</Text>
                </View>
                {loading ? (
                    <ActivityIndicator style={{ flex: 1 }} color={COLORS.lightBlue} />
                ) : (
                    <FlatList
                        data={chatList}
                        keyExtractor={(item, index) => `${item.birth_center_id}-${index}`}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchChatList} />}
                        renderItem={({ item }) => (
                            <Card
                                style={{
                                    width: "100%",
                                    marginBottom: 10,
                                }}
                                onPress={() => {
                                    handleMessageClick(item);
                                }}
                            >
                                <Card.Content style={{ width: "100%" }}>
                                    {item.unread_count > 0 && (
                                        <View style={styles.badgeCount}>
                                            <Text style={{ fontWeight: "bold" }}>{item.unread_count}</Text>
                                        </View>
                                    )}
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <Image
                                            style={{
                                                width: 60,
                                                height: 60,
                                                backgroundColor: COLORS.lightBlue,
                                                objectFit: "fill",
                                                marginRight: 20,
                                                borderRadius: 50,
                                            }}
                                            source={
                                                item.picture_url
                                                    ? { uri: item.picture_url }
                                                    : require("@/assets/images/service-icons/health-clinic.png")
                                            }
                                        />
                                        <View style={{ flex: 1, flexDirection: "column", gap: 5 }}>
                                            <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                                            <Text style={{ width: "90%" }} numberOfLines={1}>
                                                {item.latest_message}
                                            </Text>
                                            <Text style={{ marginTop: 5, color: "grey", alignSelf: "flex-end" }}>
                                                {formatDistanceToNow(new Date(item.latest_message_time + "Z"), {
                                                    addSuffix: true,
                                                })}
                                            </Text>
                                        </View>
                                    </View>
                                </Card.Content>
                            </Card>
                        )}
                    />
                )}
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    badgeCount: {
        position: "absolute",
        top: 5,
        right: 5,
        backgroundColor: COLORS.darkBlue,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        width: 30,
        height: 30,
        borderRadius: 100,
    },
});

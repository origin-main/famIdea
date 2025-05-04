import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ImageBackground, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/components/constants";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";

interface Message {
    id: number;
    senderId: string;
    receiverId: string;
    content: string;
    sentAt: string;
}

const ChatRoom = () => {
    const { birthCenterId, name } = useLocalSearchParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        markMessagesAsRead();
    }, []);

    useEffect(() => {
        if (!user?.id || !birthCenterId) return;

        fetchMessages();

        const channel = supabase
            .channel("chat-" + user.id + "-" + birthCenterId)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `patient_id=eq.${user.id}`,
                },
                (payload) => {
                    const msg = payload.new;

                    if (msg.birth_center_id === birthCenterId) {
                        setMessages((prev) => [
                            ...prev,
                            {
                                id: msg.id,
                                senderId: msg.sender_id,
                                receiverId: msg.receiver_id,
                                content: msg.content,
                                sentAt: msg.created_at,
                            },
                        ]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, birthCenterId]);

    const markMessagesAsRead = async () => {
        await supabase
            .from("messages")
            .update({ read_at: new Date().toISOString() })
            .eq("receiver_id", user?.id)
            .eq("sender_id", birthCenterId)
            .eq("patient_id", user?.id)
            .eq("birth_center_id", birthCenterId)
            .is("read_at", null);
    };

    const fetchMessages = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("messages")
            .select("id, content, created_at, sender_id, receiver_id")
            .eq("patient_id", user?.id)
            .eq("birth_center_id", birthCenterId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Failed to fetch messages:", error.message);
        } else {
            const formatted = data.map((msg) => ({
                id: msg.id,
                senderId: msg.sender_id,
                receiverId: msg.receiver_id,
                content: msg.content,
                sentAt: msg.created_at,
            }));
            setMessages(formatted);
        }

        setLoading(false);
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const { error } = await supabase.from("messages").insert([
            {
                sender_id: user?.id,
                receiver_id: birthCenterId,
                content: message.trim(),
                birth_center_id: birthCenterId,
                patient_id: user?.id,
            },
        ]);

        if (error) {
            console.error("Error sending message:", error.message);
        } else {
            setMessage("");
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMine = item.senderId === user?.id;
        const formattedTime = new Date(item.sentAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        return (
            <View style={{ marginBottom: 10 }}>
                <View style={[styles.messageContainer, isMine ? styles.myMessage : styles.theirMessage]}>
                    <Text style={styles.messageText}>{item.content}</Text>
                </View>
                <Text style={[styles.timestamp, { alignSelf: isMine ? "flex-end" : "flex-start" }]}>{formattedTime}</Text>
            </View>
        );
    };

    return (
        <ImageBackground source={require("@/assets/images/background.png")} style={{ flex: 1, justifyContent: "flex-start" }} resizeMode="cover">
            <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
                <View style={styles.titleBar}>
                    <TouchableOpacity onPress={() => router.back()} style={{ position: "absolute", left: 20 }}>
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.title}>{name || "Chat"}</Text>
                </View>

                <View style={{ padding: 10, flex: 1 }}>
                    {messages.length === 0 && !loading ? (
                        <Text
                            style={{
                                textAlign: "center",
                                color: "gray",
                                marginTop: 20,
                            }}
                        >
                            No messages yet. Send a message below.
                        </Text>
                    ) : (
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={(item) => item.id.toString()}
                            inverted
                        />
                    )}
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
                    <TextInput style={styles.input} placeholder="Type a message..." value={message} onChangeText={setMessage} multiline />
                    <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
                        <Ionicons name="send" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    titleBar: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        backgroundColor: COLORS.white,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "black",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
    },
    input: {
        flex: 1,
        marginRight: 10,
        borderWidth: 1,
        padding: 10,
        width: "80%",
        borderRadius: 20,
        borderColor: COLORS.gray,
        backgroundColor: COLORS.white,
    },
    sendButton: {
        backgroundColor: COLORS.darkBlue,
        padding: 10,
        borderRadius: 100,
    },
    messageContainer: {
        padding: 10,
        maxWidth: "80%",
        borderRadius: 15,
        marginLeft: 10,
        marginRight: 10,
        flexDirection: "column",
    },
    myMessage: {
        backgroundColor: COLORS.darkBlue,
        alignSelf: "flex-end",
    },
    theirMessage: {
        backgroundColor: COLORS.gray,
        alignSelf: "flex-start",
    },
    messageText: {
        color: "white",
        fontSize: 16,
    },
    timestamp: {
        fontSize: 12,
        color: "lightgray",
        alignSelf: "flex-end",
        marginTop: 5,
        paddingHorizontal: 10,
    },
});

export default ChatRoom;

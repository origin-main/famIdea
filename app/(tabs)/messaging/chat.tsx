import React, { useState } from "react";
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ImageBackground, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/components/constants";
import { router, useLocalSearchParams } from "expo-router";

// Simulated current user ID and birth center ID
const USER = { id: "current-user-id" };
const BIRTH_CENTER_ID = "birth-center-id";

// Define the Message type
interface Message {
    id: number;
    sender_id: string;
    reciever_id: string;
    content: string;
    sent_at: string;
}

// Static sample messages (mock data based on the table definition)
const sampleMessages: Message[] = [
    {
        id: 1,
        sender_id: BIRTH_CENTER_ID,
        reciever_id: USER.id,
        content: "Hello! How can we assist you today?",
        sent_at: new Date().toISOString(),
    },
    {
        id: 2,
        sender_id: USER.id,
        reciever_id: BIRTH_CENTER_ID,
        content: "I'm looking for more information about your services.",
        sent_at: new Date().toISOString(),
    },
    {
        id: 3,
        sender_id: BIRTH_CENTER_ID,
        reciever_id: USER.id,
        content: "Sure! We offer a variety of maternity services. Would you like to schedule a consultation?",
        sent_at: new Date().toISOString(),
    },
];

const ChatRoom = () => {
    const { chatId } = useLocalSearchParams(); // This will receive the chatId from navigation params
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>(sampleMessages);

    const handleSendMessage = () => {
        if (message.trim()) {
            const newMessage: Message = {
                id: messages.length + 1,
                sender_id: USER.id,
                reciever_id: BIRTH_CENTER_ID,
                content: message,
                sent_at: new Date().toISOString(),
            };

            setMessages([...messages, newMessage]); // Add the new message to the list
            setMessage(""); // Clear the input field after sending
        }
    };

    // Render each message based on sender
    const renderMessage = ({ item }: { item: Message }) => {
        const messageTime = new Date(item.sent_at);
        const formattedTime = messageTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        return (
            <View style={{ marginBottom: 10 }}>
                <View style={[styles.messageContainer, item.sender_id === USER.id ? styles.myMessage : styles.theirMessage]}>
                    <Text style={styles.messageText}>{item.content}</Text>
                </View>
                <Text style={[styles.timestamp, { alignSelf: item.sender_id === USER.id ? "flex-end" : "flex-start" }]}>{formattedTime}</Text>
            </View>
        );
    };

    return (
        <ImageBackground
            source={require("@/assets/images/background.png")}
            style={{ flex: 1, justifyContent: "flex-start", backgroundColor: COLORS.white }}
            resizeMode="cover"
        >
            <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
                <View style={styles.titleBar}>
                    <View style={{ position: "absolute", left: 20 }}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.title}>Margarita Birthing Center</Text>
                </View>

                <View style={{ padding: 10, flex: 1 }}>
                    {/* Displaying the messages */}
                    <FlatList data={messages} renderItem={renderMessage} keyExtractor={(item) => item.id.toString()} />
                </View>

                {/* Message Input Area */}
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

import React from "react";
import { View, StyleSheet, Image, Text, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/components/constants";
import { Card, IconButton } from "react-native-paper";
import { router } from "expo-router";

export default function Index() {
    const sampleMessages = [
        {
            messenger: "Margarita Birthing Center",
            msg: "hello",
            time: "1:30pm",
            isRead: false,
        },
        {
            messenger: "St. Claire Paanakan",
            msg: "the quick brown fox jumps over the lazy dog.",
            time: "2:30pm",
            isRead: true,
        },
    ];

    return (
        <ImageBackground
            source={require("@/assets/images/background.png")} // Correct way to set a background image
            style={{
                flex: 1,
                justifyContent: "center",
                backgroundColor: COLORS.white,
                alignItems: "center",
            }}
            resizeMode="cover"
        >
            <SafeAreaView style={{ alignItems: "center" }}>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        width: "90%",
                        marginBottom: 10,
                    }}
                >
                    <Text style={{ fontSize: 27 }}>Messages</Text>
                </View>
                <View
                    style={{
                        flexDirection: "column",
                        alignItems: "center",
                        width: "90%",
                        height: "85%",
                        margin: 10,
                        gap: 10,
                    }}
                >
                    {sampleMessages.map((data, index) => (
                        <Card
                            key={index}
                            style={{
                                width: 350,
                            }}
                            onPress={() => {
                                router.push("/messaging/chat");
                            }}
                        >
                            <Card.Content style={{ width: "100%" }}>
                                <View style={{ flexDirection: "row" }}>
                                    <Image
                                        style={{
                                            width: 50,
                                            height: 50,
                                            backgroundColor: COLORS.lightBlue,
                                            objectFit: "fill",
                                            marginRight: 20,
                                            borderRadius: 20,
                                        }}
                                        source={require("@/assets/images/service-icons/health-clinic.png")}
                                    />
                                    <View style={{ flexDirection: "column", gap: 5 }}>
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                gap: 3,
                                            }}
                                        >
                                            <Text style={{ fontWeight: "bold" }}>{data.messenger}</Text>
                                            {data.isRead ? null : <Ionicons name="mail-unread" size={15} color="red" />}
                                        </View>
                                        <View style={{ flexDirection: "row" }}>
                                            <Text
                                                style={{
                                                    flexShrink: 1,
                                                    flexWrap: "wrap",
                                                    width: "70%",
                                                }}
                                            >
                                                {data.msg}
                                            </Text>
                                            <Text
                                                style={{
                                                    alignSelf: "flex-end",
                                                }}
                                            >
                                                {data.time}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    ))}
                </View>
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

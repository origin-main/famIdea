import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, Text, ImageBackground, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/components/constants";
import { supabase } from "@/utils/supabase";
import { ActivityIndicator, Button, TextInput } from "react-native-paper";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import * as QueryParams from "expo-auth-session/build/QueryParams";

export default function Index() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);

    const createSessionFromUrl = async (url: string) => {
        const { params } = QueryParams.getQueryParams(url);
        const { access_token, refresh_token } = params;

        console.log("access token", access_token);

        if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({
                access_token,
                refresh_token,
            });
            if (error) console.error("Session error:", error.message);
            console.log("Session set!");
        }
        setLoading(false);
    };

    const url = Linking.useURL();
    useEffect(() => {
        if (url) createSessionFromUrl(url);
    }, [url]);

    const handleUpdatePassword = async () => {
        setSubmitted(true);
        if (!password || !confirmPassword || password !== confirmPassword || password.length < 6) {
            return;
        }

        try {
            const { data, error } = await supabase.auth.updateUser({ password });
            if (error) {
                console.log(error);
                return;
            }
            if (data) {
                Alert.alert(
                    "Success",
                    "Password updated successfully!",
                    [
                        {
                            text: "OK",
                            onPress: () => router.replace("/login"),
                        },
                    ],
                    { cancelable: false }
                );
            }
        } catch (error: any) {
            console.error(error?.message || "Unknown error occurred");
        }
    };

    if (loading) return <ActivityIndicator color={COLORS.lightBlue} style={{ flex: 1 }} />;

    return (
        <ImageBackground
            source={require("../assets/images/background.png")}
            style={{
                flex: 1,
                justifyContent: "center",
                backgroundColor: COLORS.white,
                alignItems: "center",
            }}
            resizeMode="cover"
        >
            <SafeAreaView style={{ alignItems: "center", width: "100%" }}>
                <Image
                    style={{
                        width: 250,
                        height: 150,
                    }}
                    source={require("../assets/images/logo.png")}
                />
                <Text style={styles.title}>FamIdea</Text>
                <Text style={styles.subtitle}>Update Password</Text>
                <View style={{ width: "70%", marginBottom: 20 }}>
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        onChangeText={setPassword}
                        value={password}
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        placeholderTextColor={COLORS.gray}
                        theme={{ roundness: 30 }}
                        right={
                            <TextInput.Icon
                                style={{ marginTop: 25 }}
                                icon={showPassword ? "eye" : "eye-off"}
                                onPress={() => setShowPassword((prev) => !prev)}
                            />
                        }
                    />
                    {submitted && password.length < 6 && (
                        <Text style={{ fontSize: 11, color: "red", textAlign: "center" }}>Password must be at least 6 characters long</Text>
                    )}
                </View>
                <View style={{ width: "70%", marginBottom: 20 }}>
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        onChangeText={setConfirmPassword}
                        value={confirmPassword}
                        placeholder="Confirm Password"
                        secureTextEntry={!showPassword}
                        placeholderTextColor={COLORS.gray}
                        theme={{ roundness: 30 }}
                        right={
                            <TextInput.Icon
                                style={{ marginTop: 25 }}
                                icon={showPassword ? "eye" : "eye-off"}
                                onPress={() => setShowPassword((prev) => !prev)}
                            />
                        }
                    />
                    {submitted && password !== confirmPassword && (
                        <Text style={{ fontSize: 11, color: "red", textAlign: "center" }}>Passwords do not match</Text>
                    )}
                </View>

                <Button onPress={handleUpdatePassword} buttonColor={COLORS.lightBlue} textColor="black" mode="contained">
                    Update Password
                </Button>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    input: {
        height: 20,
        padding: 10,
        width: "100%",
    },
    title: {
        fontSize: 32,
        fontFamily: "Roboto",
        fontWeight: "bold",
        margin: 20,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "Roboto",
        marginBottom: 20,
    },
    infoRow: {
        width: "100%",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 5,
        marginBottom: 5,
    },
    infoLabel: {
        width: "40%",
        fontSize: 12,
        fontWeight: "bold",
        marginTop: 10,
    },
    infoText: {
        width: "100%",
        fontSize: 12,
    },
});

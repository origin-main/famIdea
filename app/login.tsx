import React from "react";
import { View, TextInput, StyleSheet, Image, Text, TouchableOpacity, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { COLORS } from "@/components/constants";
import { supabase } from "@/utils/supabase";

export default function Index() {
    const [username, setUsername] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message.includes("Email not confirmed")) {
                    alert("Please verify your email before signing in.");
                } else {
                    alert("Sign in failed: " + error.message);
                }
                return;
            } else if (data?.user?.user_metadata?.user_type !== "patient") {
                alert("Account does not exist!");
                return;
            }

            alert("Signed in successfully!");
            router.replace("/(tabs)/home");
        } catch (error: any) {
            console.error(error?.message || "Unknown error occurred");
        }
    };

    return (
        <ImageBackground
            source={require("../assets/images/background.png")} // Correct way to set a background image
            style={{
                flex: 1,
                justifyContent: "center",
                backgroundColor: COLORS.white,
                alignItems: "center",
            }}
            resizeMode="cover"
        >
            <SafeAreaView style={{ alignItems: "center" }}>
                <Image
                    style={{
                        width: 250,
                        height: 150,
                    }}
                    source={require("../assets/images/logo.png")}
                />
                <Text style={styles.title}>FamIdea</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="mail" size={32} color="#9CD9FC" />

                    <TextInput style={styles.input} onChangeText={setEmail} value={email} placeholder="Email" placeholderTextColor={COLORS.gray} />
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="lock-closed" size={32} color="#9CD9FC" />
                    <TextInput
                        style={styles.input}
                        onChangeText={setPassword}
                        value={password}
                        placeholder="Password"
                        placeholderTextColor={COLORS.gray}
                        secureTextEntry
                    />
                </View>
                <TouchableOpacity style={styles.button} onPress={() => handleLogin()}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                <Text
                    onPress={() => {
                        alert("clicked");
                    }}
                    style={{ padding: 10, textDecorationLine: "underline" }}
                >
                    Forgot Password
                </Text>
                <Text
                    onPress={() => {
                        router.push("/sign_up");
                    }}
                    style={{ paddingTop: 30, justifyContent: "flex-end" }}
                >
                    Don't have an account?
                </Text>
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

import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../components/constants";
import { supabase } from "@/utils/supabase";
import { ActivityIndicator } from "react-native-paper";

export default function Index() {
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes countdown
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Countdown logic
        const interval = setInterval(() => {
            setTimeRemaining((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeRemaining]);

    const handleResend = async () => {
        setLoading(true);
        const { error } = await supabase.auth.resend({
            type: "signup",
            email: email as string,
        });
        if (error) {
            console.error("Error resending email:", error.message);
        } else {
            alert("Confirmation email has been resent.");
        }

        // Reset the countdown and prevent further resend until countdown ends
        setTimeRemaining(120);
        setCanResend(false);
        setLoading(false);
    };

    return (
        <ImageBackground source={require("../assets/images/background.png")} style={styles.background} resizeMode="cover">
            {loading ? (
                <>
                    <ActivityIndicator style={{ marginBottom: 20 }} color={COLORS.lightBlue} />
                    <Text style={{ fontWeight: "bold" }}>Resending...</Text>
                </>
            ) : (
                <SafeAreaView style={styles.safeArea}>
                    <Ionicons name="mail" size={150} color="black" />
                    <Text style={styles.title}>Please Verify Account</Text>
                    <Text style={styles.subtitle}>
                        We have sent a <Text style={styles.boldText}>confirmation link</Text> to {email}. Please check your inbox.
                    </Text>

                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>Didn't receive an email?</Text>
                        {canResend ? (
                            <TouchableOpacity onPress={() => handleResend()}>
                                <Text style={styles.resendLink}>Resend</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text>
                                Resend in {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
                        <Text style={styles.buttonText}>Go to Login</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            )}
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: COLORS.white,
        alignItems: "center",
    },
    safeArea: {
        width: "100%",
        alignItems: "center",
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginVertical: 10,
    },
    subtitle: {
        fontSize: 20,
        textAlign: "center",
        marginVertical: 10,
        paddingHorizontal: 30,
    },
    boldText: {
        fontWeight: "bold",
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        marginVertical: 20,
    },
    input: {
        height: 50,
        width: 50,
        borderWidth: 1,
        borderColor: COLORS.gray,
        borderRadius: 10,
        textAlign: "center",
        fontSize: 24,
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
    resendContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    resendText: {
        padding: 5,
    },
    resendLink: {
        padding: 5,
        textDecorationLine: "underline",
        color: "blue",
    },
});

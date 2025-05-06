import React, { useState } from "react";
import { View, TextInput, StyleSheet, Image, Text, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/components/constants";
import { supabase } from "@/utils/supabase";
import { Button } from "react-native-paper";

export default function Index() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            alert("Please enter your email.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: "myapp://update-password",
            });

            if (error) {
                alert(error.message);
                return;
            }
            alert("Password reset email sent!");
            console.log("Password reset email sent!");
        } catch (error: any) {
            console.error(error?.message || "Unknown error occurred");
        } finally {
            setLoading(false);
        }
    };

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
            <SafeAreaView style={{ alignItems: "center" }}>
                <Image
                    style={{
                        width: 250,
                        height: 150,
                    }}
                    source={require("../assets/images/logo.png")}
                />
                <Text style={styles.title}>FamIdea</Text>
                <Text style={styles.subtitle}>Forgot Password</Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                    <TextInput style={styles.input} onChangeText={setEmail} value={email} placeholder="Email" placeholderTextColor={COLORS.gray} />
                </View>

                <Button loading={loading} onPress={handleResetPassword} buttonColor={COLORS.lightBlue} textColor="black" mode="contained">
                    Reset Password
                </Button>
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
    subtitle: {
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "Roboto",
        marginBottom: 20,
    },
});

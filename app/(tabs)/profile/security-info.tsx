import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button, TextInput } from "react-native-paper";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import SessionExpiredModal from "@/components/ui/SessionExpiredModal";

export default function Index() {
    const router = useRouter();

    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSessionExpired, setShowSessionExpired] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChangeEmail = async () => {
        setLoading(true);
        if (!formData.email) {
            alert("Please enter an email address.");
            setLoading(false);
            return;
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                email: formData.email,
            });

            if (updateError) {
                alert(updateError.message);
                setLoading(false);
                return;
            }

            Alert.alert(
                "Email Change Request Sent",
                "Please check your old and new email addresses to confirm the change.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            setShowSessionExpired(true);
                        },
                    },
                ],
                { cancelable: false }
            );
        } catch (error: any) {
            console.error("Error changing email:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setLoading(true);
        if (!formData.password || !formData.newPassword || !formData.confirmPassword) {
            alert("Please fill in all fields.");
            setLoading(false);
            return;
        }

        if (formData.newPassword.length < 6) {
            alert("New password must be at least 6 characters long.");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.rpc("confirm_current_user_password", {
                current_plain_password: formData.password,
            });

            if (error) {
                alert(error.message);
                setLoading(false);
                return;
            }

            // Update to new password
            const { error: updateError } = await supabase.auth.updateUser({
                password: formData.newPassword,
            });

            if (updateError) {
                alert(updateError.message);
                setLoading(false);
                return;
            }

            Alert.alert(
                "Success",
                "Password changed successfully.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            setShowSessionExpired(true);
                        },
                    },
                ],
                { cancelable: false }
            );
        } catch (error: any) {
            console.error("Error changing password:", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.titleBar}>
                <View style={{ position: "absolute", left: 20 }}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.title}>Security & Privacy</Text>
            </View>

            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    alignItems: "center",
                    paddingVertical: 10,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Account Settings  */}
                <View
                    style={{
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        width: "100%",
                        paddingHorizontal: 30,
                        paddingTop: 10,
                    }}
                >
                    <Text
                        style={{
                            justifyContent: "flex-start",
                            width: "100%",
                            fontSize: 16,
                            marginVertical: 12,
                            fontWeight: "bold",
                        }}
                    >
                        Account Settings
                    </Text>

                    {/* First Name  */}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Update Email:</Text>
                        <TextInput
                            style={styles.infoText}
                            mode="outlined"
                            dense={true}
                            value={formData.email}
                            onChangeText={(value) => setFormData({ ...formData, email: value })}
                        ></TextInput>
                    </View>
                    <Button mode="contained" loading={loading} onPress={handleChangeEmail} style={styles.saveButton}>
                        Change email
                    </Button>

                    {/* Update password */}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Update password:</Text>
                        <TextInput
                            style={styles.infoText}
                            mode="outlined"
                            placeholder="Current password"
                            dense={true}
                            value={formData.password}
                            secureTextEntry={!showPassword}
                            onChangeText={(value) => setFormData({ ...formData, password: value })}
                            right={
                                <TextInput.Icon
                                    style={{ marginTop: 5 }}
                                    icon={showPassword ? "eye" : "eye-off"}
                                    onPress={() => setShowPassword((prev) => !prev)}
                                />
                            }
                        />
                    </View>

                    <View style={styles.infoRow}>
                        <TextInput
                            style={styles.infoText}
                            mode="outlined"
                            placeholder="New password"
                            dense={true}
                            value={formData.newPassword}
                            secureTextEntry={!showPassword}
                            onChangeText={(value) => setFormData({ ...formData, newPassword: value })}
                            right={
                                <TextInput.Icon
                                    style={{ marginTop: 5 }}
                                    icon={showPassword ? "eye" : "eye-off"}
                                    onPress={() => setShowPassword((prev) => !prev)}
                                />
                            }
                        />
                    </View>

                    <View style={styles.infoRow}>
                        <TextInput
                            style={styles.infoText}
                            mode="outlined"
                            placeholder="Confirm new password"
                            dense={true}
                            secureTextEntry={!showPassword}
                            value={formData.confirmPassword}
                            onChangeText={(value) => {
                                setFormData({ ...formData, confirmPassword: value });
                                if (value !== formData.newPassword) {
                                    setPasswordError("Passwords do not match");
                                } else {
                                    setPasswordError("");
                                }
                            }}
                            right={
                                <TextInput.Icon
                                    style={{ marginTop: 5 }}
                                    icon={showPassword ? "eye" : "eye-off"}
                                    onPress={() => setShowPassword((prev) => !prev)}
                                />
                            }
                        />
                        {passwordError && <Text style={{ color: "red" }}>{passwordError}</Text>}
                    </View>
                </View>
                <Button mode="contained" loading={loading} onPress={handleChangePassword} style={styles.saveButton}>
                    Change password
                </Button>
            </ScrollView>
            <SessionExpiredModal visible={showSessionExpired} setVisible={setShowSessionExpired} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "white",
    },
    titleBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 60,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
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
    saveButton: {
        marginVertical: 20,
        alignSelf: "center",
    },
});

import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Avatar, Button, TextInput } from "react-native-paper";
import { useState } from "react";

export default function Index() {
    const router = useRouter();

    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "", //TODO: Add password value from db
        newPassword: "",
        address: "",
    });

    const handleSave = () => {
        Alert.alert("Updated Patient Info", JSON.stringify(formData, null, 2));
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

                    {/* Update password  */}
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
                        ></TextInput>
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
                        ></TextInput>
                    </View>

                    <View style={styles.infoRow}>
                        <TextInput
                            style={styles.infoText}
                            mode="outlined"
                            placeholder="Confirm password"
                            dense={true}
                            secureTextEntry={!showPassword}
                            value={formData.password}
                            onChangeText={(value) => {
                                if (value !== formData.password) {
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
                        ></TextInput>
                        {passwordError ? (
                            <Text style={{ color: "red" }}>{passwordError}</Text>
                        ) : null}
                    </View>

                    {/* Address  */}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Address:</Text>
                        <TextInput
                            style={styles.infoText}
                            mode="outlined"
                            dense={true}
                            value={formData.address}
                            onChangeText={(value) => setFormData({ ...formData, address: value })}
                        ></TextInput>
                    </View>
                </View>
                <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
                    Save
                </Button>
            </ScrollView>
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
        marginTop: 10
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

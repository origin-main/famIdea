import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ImageBackground, ScrollView } from "react-native";
import { Divider, TextInput, ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "react-native-paper-dropdown";
import { DatePickerInput } from "react-native-paper-dates";
import { router } from "expo-router";
import { COLORS } from "@/components/constants";
import { supabase } from "@/utils/supabase";

type formData = {
    firstName: string;
    middleName: string;
    lastName: string;
    address: string;
    age: number;
    birthday: Date;
    sex: string;
    email: string;
    phoneNumber: string;
    password: string;
};

export default function Index() {
    const [loading, setLoading] = useState(false);

    const [passwordError, setPasswordError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = React.useState<formData>({
        firstName: "",
        middleName: "",
        lastName: "",
        address: "",
        age: 0,
        birthday: new Date(),
        sex: "",
        email: "",
        phoneNumber: "09",
        password: "",
    });

    const options = [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
    ];

    const handleChange = (key: keyof formData, value: string | number | Date) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const checkFormValue = (): boolean => {
        const requiredFields = [
            formData.firstName,
            formData.lastName,
            formData.address,
            formData.sex,
            formData.email,
            formData.phoneNumber,
            formData.password,
        ];

        const hasEmptyField = requiredFields.some((field) => !field.trim());
        const isUnderage = formData.age < 18;
        const isInvalidPhone = formData.phoneNumber.length !== 11;
        const isWeakPassword = formData.password.length < 6;

        return !(hasEmptyField || isUnderage || isInvalidPhone || isWeakPassword);
    };

    const handleSignUp = async () => {
        setLoading(true);
        setSubmitted(true);

        if (checkFormValue()) {
            try {
                //sign up user
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                });

                if (authError) {
                    throw new Error(`Signup error: ${authError.message}`);
                }

                const userId = authData.user?.id;

                if (!userId) {
                    throw new Error("No user ID returned");
                }

                // Insert into profiles
                const { error: profileError } = await supabase.from("profiles").insert([
                    {
                        id: userId,
                        role: "patient",
                        first_name: formData.firstName,
                        middle_name: formData.middleName || null,
                        last_name: formData.lastName,
                        contact_number: formData.phoneNumber,
                        age: formData.age,
                        birthday: formData.birthday.toISOString().split("T")[0],
                        sex: formData.sex,
                        address: formData.address,
                    },
                ]);

                if (profileError) {
                    throw new Error(`Insert profile error: ${profileError.message}`);
                }

                // Insert into patient_info
                const { error: patientInfoError } = await supabase.from("patient_info").insert([
                    {
                        id: userId,
                    },
                ]);

                if (patientInfoError) {
                    throw new Error(`Insert patient_info error: ${patientInfoError.message}`);
                }

                // Insert into child_info
                const { error: childInfoError } = await supabase.from("child_info").insert([
                    {
                        id: userId,
                    },
                ]);

                if (childInfoError) {
                    throw new Error(`Insert child_info error: ${childInfoError.message}`);
                }

                alert("Account created successfully!");

                // Navigate to the confirmation page
                router.push("/confirmation_page");
            } catch (error: any) {
                console.error(error?.message || "Unknown error occurred");
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
            alert("Please fill in all required fields correctly.");
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
            <SafeAreaView style={{ width: "100%", alignItems: "center" }}>
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        alignItems: "center",
                        paddingVertical: 10,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.title}>Create Your Account</Text>
                    {loading ? (
                        <ActivityIndicator style={{ flex: 1 }} color={COLORS.lightBlue} />
                    ) : (
                        <View style={styles.container}>
                            <TextInput
                                mode="outlined"
                                style={styles.input}
                                onChangeText={(value) => handleChange("firstName", value)}
                                defaultValue={formData.firstName}
                                placeholder="First Name"
                                placeholderTextColor={COLORS.gray}
                                theme={{ roundness: 30 }}
                            />
                            {submitted && formData.firstName == "" ? <Text style={{ color: "red" }}>required</Text> : null}
                            <TextInput
                                mode="outlined"
                                style={styles.input}
                                onChangeText={(value) => handleChange("middleName", value)}
                                value={formData.middleName}
                                placeholder="Middle Name"
                                placeholderTextColor={COLORS.gray}
                                theme={{ roundness: 30 }}
                            />
                            <TextInput
                                mode="outlined"
                                style={styles.input}
                                onChangeText={(value) => handleChange("lastName", value)}
                                value={formData.lastName}
                                placeholder="Last Name"
                                placeholderTextColor={COLORS.gray}
                                theme={{ roundness: 30 }}
                            />
                            {submitted && formData.lastName == "" ? <Text style={{ color: "red" }}>required</Text> : null}
                            <TextInput
                                mode="outlined"
                                style={styles.input}
                                onChangeText={(value) => handleChange("address", value)}
                                value={formData.address}
                                placeholder="Address"
                                placeholderTextColor={COLORS.gray}
                                theme={{ roundness: 30 }}
                            />
                            {submitted && formData.address == "" ? <Text style={{ color: "red" }}>required</Text> : null}
                            {/* Age, Birthdate and Gender */}
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    width: "90%",
                                    gap: 10,
                                }}
                            >
                                <TextInput
                                    mode="outlined"
                                    style={{ width: "30%", height: 20, marginTop: 6 }}
                                    onChangeText={(value) => {
                                        handleChange("age", value ? parseInt(value) || 0 : 0);
                                    }}
                                    value={formData.age == 0 ? "" : formData.age.toString()}
                                    placeholder="Age"
                                    placeholderTextColor={COLORS.gray}
                                    keyboardType="numeric"
                                    maxLength={2}
                                />
                                <DatePickerInput
                                    mode="outlined"
                                    style={{ fontSize: 10 }}
                                    locale="en"
                                    value={formData.birthday}
                                    onChange={(value) => handleChange("birthday", value as Date)}
                                    inputMode="start"
                                />

                                <View style={{ width: "30%" }}>
                                    <Dropdown
                                        label="Sex"
                                        mode="outlined"
                                        options={options}
                                        value={formData.sex}
                                        onSelect={(value) => handleChange("sex", value as string)}
                                    />
                                </View>
                            </View>
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    width: "80%",
                                }}
                            >
                                {submitted && (formData.age == 0 || formData.age < 18) ? (
                                    <Text style={{ color: "red" }}>required</Text>
                                ) : (
                                    <Text style={{ color: "red" }}></Text>
                                )}
                                {submitted && !formData.birthday ? (
                                    <Text style={{ color: "red" }}>required</Text>
                                ) : (
                                    <Text style={{ color: "red" }}></Text>
                                )}
                                {submitted && !formData.sex ? <Text style={{ color: "red" }}>required</Text> : <Text style={{ color: "red" }}></Text>}
                            </View>

                            <TextInput
                                mode="outlined"
                                style={styles.input}
                                onChangeText={(value) => {
                                    handleChange("email", value);
                                    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
                                    setEmailError(emailRegex.test(value) ? "" : "Invalid email address");
                                }}
                                value={formData.email}
                                placeholder="Email Address"
                                placeholderTextColor={COLORS.gray}
                                theme={{ roundness: 30 }}
                                keyboardType="email-address"
                            />
                            {emailError || (submitted && formData.email == "") ? (
                                <Text style={{ color: "red" }}>{emailError || "required"}</Text>
                            ) : null}
                            <TextInput
                                mode="outlined"
                                style={styles.input}
                                onChangeText={(value) => {
                                    handleChange("phoneNumber", value);
                                }}
                                value={formData.phoneNumber}
                                placeholder="Phone Number"
                                keyboardType="numeric"
                                maxLength={11}
                                placeholderTextColor={COLORS.gray}
                                theme={{ roundness: 30 }}
                            />
                            {submitted && (formData.phoneNumber == "" || formData.phoneNumber.length != 11) ? (
                                <Text style={{ color: "red" }}>required</Text>
                            ) : null}
                            <Divider style={{ width: "90%", margin: 20 }} />
                            <TextInput
                                mode="outlined"
                                style={styles.input}
                                onChangeText={(value) => handleChange("password", value)}
                                value={formData.password}
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
                            {submitted && (formData.password == "" || formData.password.length < 6) ? (
                                <Text style={{ color: "red" }}>Password should be at least 6 characters</Text>
                            ) : null}
                            <TextInput
                                mode="outlined"
                                style={styles.input}
                                onChangeText={(value) => {
                                    if (value !== formData.password) {
                                        setPasswordError("Passwords do not match");
                                    } else {
                                        setPasswordError("");
                                    }
                                }}
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
                            {passwordError ? <Text style={{ color: "red" }}>{passwordError}</Text> : null}
                        </View>
                    )}

                    <TouchableOpacity style={styles.button} onPress={() => handleSignUp()}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={{ padding: 5 }}>Already have an account?</Text>
                        <Text
                            style={{
                                padding: 5,
                                textDecorationLine: "underline",
                                color: "blue",
                            }}
                            onPress={() => {
                                router.push("/");
                            }}
                        >
                            Login
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        alignItems: "center",
        gap: 10,
    },
    input: {
        height: 20,
        padding: 10,
        width: "90%",
    },
    title: {
        fontSize: 32,
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

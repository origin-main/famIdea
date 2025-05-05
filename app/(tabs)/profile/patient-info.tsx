import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, Avatar, Button, TextInput } from "react-native-paper";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";
import { DatePickerInput } from "react-native-paper-dates";
import { COLORS } from "@/components/constants";
import { formatDateToYMD, getPicture } from "@/utils/common";

type PatientInfo = {
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: Date | undefined;
    address: string;
    phoneNumber: string;
    emergencyContact: string;
    emergencyContactNumber: string;
    estimatedDueDate: Date | undefined;
    previousPregnancies: string;
    deliveries: string;
    complications: string;
    medicalConditions: string;
    allergies: string;
    medications: string;
    bloodType: string;
};

export default function Index() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<PatientInfo>({
        firstName: "",
        middleName: "",
        lastName: "",
        dateOfBirth: undefined,
        address: "",
        phoneNumber: "",
        emergencyContact: "",
        emergencyContactNumber: "",
        estimatedDueDate: undefined,
        previousPregnancies: "",
        deliveries: "",
        complications: "",
        medicalConditions: "",
        allergies: "",
        medications: "",
        bloodType: "",
    });
    // for image
    const [markedForDeletion, setMarkedForDeletion] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [newImage, setNewImage] = useState<{
        uri: string;
        mimeType?: string;
    } | null>(null);

    useEffect(() => {
        if (user) {
            getInitialFormData();

            if (user?.profile?.profile_picture_url) {
                const url = getPicture(user?.profile?.profile_picture_url);
                setImageUrl(url);
            }
        }
    }, [user]);

    const getInitialFormData = () => {
        setFormData({
            firstName: user?.profile?.first_name || "",
            middleName: user?.profile?.middle_name || "",
            lastName: user?.profile?.last_name || "",
            dateOfBirth: user?.profile?.birthday ? new Date(user?.profile?.birthday) : undefined,
            address: user?.profile?.address || "",
            phoneNumber: user?.profile?.contact_number || "",
            emergencyContact: user?.profile?.emergency_contact || "",
            emergencyContactNumber: user?.profile?.emergency_contact_number || "",
            estimatedDueDate: user?.profile?.estimated_due_date ? new Date(user?.profile?.estimated_due_date) : undefined,
            previousPregnancies: user?.profile?.previous_pregnancies || "",
            deliveries: user?.profile?.deliveries || "",
            complications: user?.profile?.complications || "",
            medicalConditions: user?.profile?.medical_conditions || "",
            allergies: user?.profile?.allergies || "",
            medications: user?.profile?.medications || "",
            bloodType: user?.profile?.blood_type || "",
        });
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsMultipleSelection: false,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
                exif: false,
            });

            if (result.canceled || !result.assets?.length) {
                return;
            }

            const image = result.assets[0];

            if (!image.uri) {
                throw new Error("No image uri!");
            }

            setNewImage({
                uri: image.uri,
                mimeType: image.mimeType ?? "image/jpeg",
            });

            setImageUrl(image.uri);
            setMarkedForDeletion(false);
        } catch (error: any) {
            console.error("Error picking image:", error.message);
        }
    };

    const markProfilePictureForDeletion = () => {
        setMarkedForDeletion(true);
        setImageUrl(null);
        setNewImage(null);
    };

    const checkFormValue = (): boolean => {
        const requiredFields = [formData.firstName, formData.lastName, formData.address, formData.phoneNumber];

        const hasEmptyField = requiredFields.some((field) => !field.trim());
        const isInvalidPhone = formData.phoneNumber.length !== 11;

        return !(hasEmptyField || isInvalidPhone);
    };

    const handleSave = async () => {
        if (!user) {
            console.error("No user found!");
            return;
        }

        if (!checkFormValue()) {
            Alert.alert("Oops!", "Please fill in all the required fields.");
            return;
        }

        try {
            setLoading(true);

            // 1. Upload new image if there is one
            let uploadedImagePath: string | undefined;
            if (newImage) {
                const response = await fetch(newImage.uri);
                const arrayBuffer = await response.arrayBuffer();
                const bytes = new Uint8Array(arrayBuffer);

                // Check size in MB
                const sizeInMB = bytes.length / (1024 * 1024);
                if (sizeInMB > 5) {
                    Alert.alert("Oops!", "Image size exceeds 5MB. Please choose a smaller file.");
                    return;
                }

                const fileExt = newImage.uri.split(".").pop()?.toLowerCase() || "jpeg";
                const fileName = `${user?.id}.${fileExt}`;

                const { data, error: uploadError } = await supabase.storage.from("profile-pictures").upload(fileName, bytes, {
                    contentType: newImage.mimeType,
                    upsert: true,
                });

                if (uploadError) {
                    throw uploadError;
                }

                uploadedImagePath = `https://mseufnqrzgiqjrxwvwvh.supabase.co/storage/v1/object/public/profile-pictures/${data.path}`;
            }
            // 1.1 Delete photo from db and storage if marked for deletion
            else if (markedForDeletion && user?.profile?.profile_picture_url) {
                const imagePath = user.profile.profile_picture_url;
                const fileName = imagePath.split("/").pop();

                if (fileName) {
                    const { error: storageError } = await supabase.storage.from("profile-pictures").remove([fileName]);

                    if (storageError) {
                        throw storageError;
                    }

                    const { error: dbError } = await supabase.from("patients").update({ profile_picture_url: null }).eq("id", user.id);

                    if (dbError) {
                        throw dbError;
                    }

                    console.log("Profile picture deleted successfully.");
                }
            }

            // 2. Update patients table
            const { error: patientError } = await supabase
                .from("patients")
                .update({
                    first_name: formData.firstName,
                    middle_name: formData.middleName,
                    last_name: formData.lastName,
                    birthday: formatDateToYMD(formData.dateOfBirth),
                    address: formData.address,
                    contact_number: formData.phoneNumber,
                    emergency_contact: formData.emergencyContact,
                    emergency_contact_number: formData.emergencyContactNumber,
                    estimated_due_date: formData.estimatedDueDate ? formatDateToYMD(formData.estimatedDueDate) : null,
                    previous_pregnancies: formData.previousPregnancies,
                    deliveries: formData.deliveries,
                    complications: formData.complications,
                    medical_conditions: formData.medicalConditions,
                    allergies: formData.allergies,
                    medications: formData.medications,
                    blood_type: formData.bloodType,
                    ...(uploadedImagePath ? { profile_picture_url: uploadedImagePath } : {}), // Only update image if uploaded
                })
                .eq("id", user?.id);

            if (patientError) {
                throw new Error(`Failed to update patient: ${patientError?.message}`);
            }

            alert("Information saved successfully!");

            // Clear the picked new image after saving
            setNewImage(null);
        } catch (error: any) {
            console.error("Error saving data:", error.message);
            alert(`Failed to save changes: ${error.message}`);
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
                <Text style={styles.title}>Patient Info</Text>
            </View>

            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    alignItems: "center",
                    paddingVertical: 10,
                }}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <ActivityIndicator style={{ flex: 1 }} color={COLORS.lightBlue} />
                ) : (
                    <>
                        {/* profile picture */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                                paddingHorizontal: 30,
                                paddingTop: 20,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 2,
                                }}
                            >
                                {imageUrl && (
                                    <TouchableOpacity
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            zIndex: 100,
                                        }}
                                        onPress={() => markProfilePictureForDeletion()}
                                    >
                                        <Ionicons name="close-circle" size={24} color="red" />
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={pickImage}>
                                    <Avatar.Image
                                        size={90}
                                        source={imageUrl ? { uri: imageUrl } : require("@/assets/images/user-default.png")}
                                        style={{ backgroundColor: "gray" }}
                                    />
                                </TouchableOpacity>

                                {/* Name */}
                                <View
                                    style={{
                                        flexDirection: "column",
                                        alignItems: "center",
                                    }}
                                >
                                    <Text style={styles.title}>
                                        {user?.profile?.first_name} {user?.profile?.last_name}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Patient Information  */}
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
                                Patient Information
                            </Text>

                            {/* First Name  */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>First Name:</Text>
                                <TextInput
                                    style={[styles.infoText, { backgroundColor: !formData.firstName ? COLORS.error : undefined }]}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.firstName}
                                    onChangeText={(value) => setFormData({ ...formData, firstName: value })}
                                ></TextInput>
                            </View>

                            {/* Middle Name  */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Middle Name:</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.middleName}
                                    onChangeText={(value) => setFormData({ ...formData, middleName: value })}
                                ></TextInput>
                            </View>

                            {/* Last Name  */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Last Name:</Text>
                                <TextInput
                                    style={[styles.infoText, { backgroundColor: !formData.lastName ? COLORS.error : undefined }]}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.lastName}
                                    onChangeText={(value) => setFormData({ ...formData, lastName: value })}
                                ></TextInput>
                            </View>

                            {/* Date of Birth */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Date of Birth:</Text>
                                <View style={styles.infoText}>
                                    <DatePickerInput
                                        style={{ fontSize: 12, backgroundColor: !formData.dateOfBirth ? COLORS.error : undefined }}
                                        mode="outlined"
                                        locale="en"
                                        dense={true}
                                        value={formData.dateOfBirth}
                                        onChange={(value) => setFormData({ ...formData, dateOfBirth: value as Date })}
                                        inputMode="start"
                                    />
                                </View>
                            </View>

                            {/* Address  */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Address:</Text>
                                <TextInput
                                    style={[styles.infoText, { backgroundColor: !formData.address ? COLORS.error : undefined }]}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.address}
                                    onChangeText={(value) => setFormData({ ...formData, address: value })}
                                ></TextInput>
                            </View>

                            {/* Phone Number  */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Phone Number:</Text>
                                <TextInput
                                    style={[styles.infoText, { backgroundColor: !formData.phoneNumber ? COLORS.error : undefined }]}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.phoneNumber}
                                    onChangeText={(value) => setFormData({ ...formData, phoneNumber: value })}
                                ></TextInput>
                            </View>

                            {/* Emergency Contact Person */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{`Emergency \nContact Person:`}</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.emergencyContact}
                                    onChangeText={(value) => setFormData({ ...formData, emergencyContact: value })}
                                ></TextInput>
                            </View>

                            {/* Emergency Contact Number */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{`Emergency \nContact Number:`}</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.emergencyContactNumber}
                                    onChangeText={(value) => setFormData({ ...formData, emergencyContactNumber: value })}
                                ></TextInput>
                            </View>
                        </View>

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
                                Medical & Pregnancy History
                            </Text>

                            {/* Estimated Due Date  */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Estimated Due Date (if applicable):</Text>
                                <View style={styles.infoText}>
                                    <DatePickerInput
                                        style={{ fontSize: 12 }}
                                        mode="outlined"
                                        locale="en"
                                        dense={true}
                                        value={formData.estimatedDueDate}
                                        onChange={(value) => setFormData({ ...formData, estimatedDueDate: value as Date })}
                                        inputMode="start"
                                    />
                                </View>
                            </View>

                            {/* Number of Previous Pregnancies */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Number of Previous Pregnancies:</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.previousPregnancies}
                                    onChangeText={(value) => setFormData({ ...formData, previousPregnancies: value })}
                                ></TextInput>
                            </View>

                            {/* Number of Deliveries  */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Number of Deliveries:</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.deliveries}
                                    onChangeText={(value) => setFormData({ ...formData, deliveries: value })}
                                ></TextInput>
                            </View>

                            {/* History of Miscarriages/Complications  */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>History of Miscarriages/Complications (if any):</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.complications}
                                    onChangeText={(value) => setFormData({ ...formData, complications: value })}
                                ></TextInput>
                            </View>

                            {/* Existing Medical Conditions */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Existing Medical Conditions (e.g., diabetes, hypertension, heart issues, etc.):</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.medicalConditions}
                                    onChangeText={(value) => setFormData({ ...formData, medicalConditions: value })}
                                ></TextInput>
                            </View>

                            {/* Allergies */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Allergies (medications, foods, latex, etc.):</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.allergies}
                                    onChangeText={(value) => setFormData({ ...formData, allergies: value })}
                                ></TextInput>
                            </View>

                            {/* Current Medications & Supplements */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Current Medications & Supplements:</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.medications}
                                    onChangeText={(value) => setFormData({ ...formData, medications: value })}
                                ></TextInput>
                            </View>

                            {/* Blood Type */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Blood Type:</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.bloodType}
                                    onChangeText={(value) => setFormData({ ...formData, bloodType: value })}
                                ></TextInput>
                            </View>
                        </View>

                        <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
                            Save
                        </Button>
                    </>
                )}
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
        width: "90%",
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginBottom: 5,
    },
    infoLabel: {
        width: "40%",
        fontSize: 12,
        fontWeight: "bold",
    },
    infoText: {
        width: "65%",
        fontSize: 12,
    },
    saveButton: {
        marginVertical: 20,
        alignSelf: "center",
    },
});

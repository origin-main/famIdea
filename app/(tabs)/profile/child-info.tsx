import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, Avatar, Button, TextInput } from "react-native-paper";
import { useEffect, useState } from "react";
import { DatePickerInput } from "react-native-paper-dates";
import { supabase } from "@/utils/supabase";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/components/constants";
import { formatDateToYMD, getPicture } from "@/utils/common";

type ChildInfo = {
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: Date | undefined;
    birthWeight: string;
    birthLength: string;
    gender: string;
    bloodType: string;
    medicalConditions: string;
    allergies: string;
    medications: string;
    immunizations: string;
    developmentalMilestones: string;
    retrictisonsOrSpecialNeeds: string;
    sleepPatternsAndHabits: string;
    behavioralConcerns: string;
    familyMedicalHistory: string;
    otherRelevantInfo: string;
    profilePicture: string | null;
};

export default function Index() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ChildInfo>({
        firstName: "",
        middleName: "",
        lastName: "",
        dateOfBirth: undefined,
        birthWeight: "",
        birthLength: "",
        gender: "",
        bloodType: "",
        medicalConditions: "",
        allergies: "",
        medications: "",
        immunizations: "",
        developmentalMilestones: "",
        retrictisonsOrSpecialNeeds: "",
        sleepPatternsAndHabits: "",
        behavioralConcerns: "",
        familyMedicalHistory: "",
        otherRelevantInfo: "",
        profilePicture: null,
    });
    // for image
    const [markedForDeletion, setMarkedForDeletion] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [newImage, setNewImage] = useState<{
        uri: string;
        mimeType?: string;
    } | null>(null);

    useEffect(() => {
        getInitialFormData();
    }, []);

    const getInitialFormData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from("child_info").select("*").eq("id", user?.id).single();

            if (error) {
                throw new Error(error.message);
            }

            setFormData({
                firstName: data.first_name || "",
                middleName: data.middle_name || "",
                lastName: data.last_name || "",
                dateOfBirth: data.birthdate ? new Date(data.birthdate) : undefined,
                birthWeight: data.birth_weight || "",
                birthLength: data.birth_length || "",
                gender: data.gender || "",
                bloodType: data.blood_type || "",
                medicalConditions: data.medical_conditions || "",
                allergies: data.allergies || "",
                medications: data.medications || "",
                immunizations: data.immunizations || "",
                developmentalMilestones: data.developmental_milestones || "",
                retrictisonsOrSpecialNeeds: data.restrictions || "",
                sleepPatternsAndHabits: data.sleep_patterns || "",
                behavioralConcerns: data.behavioral_concerns || "",
                familyMedicalHistory: data.family_medical_history || "",
                otherRelevantInfo: data.other_info || "",
                profilePicture: data.profile_picture_url || null,
            });

            if (data.profile_picture_url) {
                const url = getPicture(data.profile_picture_url);
                setImageUrl(url);
            }
        } catch (error: any) {
            console.error("Failed to fetch initial form data:", error.message);
            throw error;
        } finally {
            setLoading(false);
        }
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

    const handleSave = async () => {
        if (!user) {
            console.error("No user found!");
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

                // Force the extension to be 'jpeg'
                const fileName = `${user.id}-child.jpeg`;

                const { data, error: uploadError } = await supabase.storage.from("profile-pictures").upload(fileName, bytes, {
                    contentType: "image/jpeg", // Force JPEG content type
                    upsert: true,
                });

                if (uploadError) {
                    throw uploadError;
                }

                uploadedImagePath = `https://mseufnqrzgiqjrxwvwvh.supabase.co/storage/v1/object/public/profile-pictures/${data.path}`;

                console.log("Image uploaded! File path:", uploadedImagePath);
            }

            // 1.1 Delete photo from db and storage if marked for deletion
            else if (markedForDeletion && formData.profilePicture) {
                const imagePath = formData.profilePicture;

                const { error: storageError } = await supabase.storage.from("profile-pictures").remove([imagePath]);

                if (storageError) {
                    throw storageError;
                }

                const { error: dbError } = await supabase.from("child_info").update({ profile_picture_url: null }).eq("id", user.id);

                if (dbError) {
                    throw dbError;
                }

                console.log("Profile picture deleted successfully.");
            }

            // 2. Update child_info table
            const { error: childInfoError } = await supabase
                .from("child_info")
                .update({
                    first_name: formData.firstName,
                    middle_name: formData.middleName,
                    last_name: formData.lastName,
                    birthdate: formatDateToYMD(formData.dateOfBirth),
                    birth_weight: formData.birthWeight,
                    birth_length: formData.birthLength,
                    gender: formData.gender,
                    blood_type: formData.bloodType,
                    medical_conditions: formData.medicalConditions,
                    allergies: formData.allergies,
                    medications: formData.medications,
                    immunizations: formData.immunizations,
                    developmental_milestones: formData.developmentalMilestones,
                    restrictions: formData.retrictisonsOrSpecialNeeds,
                    sleep_patterns: formData.sleepPatternsAndHabits,
                    behavioral_concerns: formData.behavioralConcerns,
                    family_medical_history: formData.familyMedicalHistory,
                    other_info: formData.otherRelevantInfo,
                    ...(uploadedImagePath ? { profile_picture_url: uploadedImagePath } : {}), // Only update image if uploaded
                })
                .eq("id", user?.id);

            if (childInfoError) {
                throw new Error(`Failed to update child info: ${childInfoError?.message}`);
            }

            alert("Information saved successfully!");

            // Clear the picked new image after saving
            setNewImage(null);

            // Refresh image
            if (uploadedImagePath) {
                const url = getPicture(uploadedImagePath);
                setImageUrl(url);
            }
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
                                    <Text style={styles.title}>{`${formData.firstName} ${formData.lastName}`}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Child Information  */}
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
                                Child Information
                            </Text>

                            {/* First Name  */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>First Name:</Text>
                                <TextInput
                                    style={styles.infoText}
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
                                    style={styles.infoText}
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
                                        style={{ fontSize: 12 }}
                                        mode="outlined"
                                        locale="en"
                                        dense={true}
                                        value={formData.dateOfBirth}
                                        onChange={(value) => setFormData({ ...formData, dateOfBirth: value as Date })}
                                        inputMode="start"
                                    />
                                </View>
                            </View>

                            {/* Birth Weight  */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Birth Weight:</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.birthWeight}
                                    onChangeText={(value) => setFormData({ ...formData, birthWeight: value })}
                                ></TextInput>
                            </View>

                            {/* Birth Length  */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Birth Length:</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.birthLength}
                                    onChangeText={(value) => setFormData({ ...formData, birthLength: value })}
                                ></TextInput>
                            </View>

                            {/* Gender */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Gender:</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.gender}
                                    onChangeText={(value) => setFormData({ ...formData, gender: value })}
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

                            {/* Existing Medical Condition */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Existing Medical Condition:</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.medicalConditions}
                                    onChangeText={(value) => setFormData({ ...formData, medicalConditions: value })}
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
                                Medical History
                            </Text>

                            {/* Allergies */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Allergies:</Text>
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

                            {/* Existing Medical Conditions */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Existing Medical Conditions:</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.medicalConditions}
                                    onChangeText={(value) => setFormData({ ...formData, medicalConditions: value })}
                                ></TextInput>
                            </View>

                            {/* Immunization History */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Immunization History:</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.immunizations}
                                    onChangeText={(value) => setFormData({ ...formData, immunizations: value })}
                                ></TextInput>
                            </View>

                            {/* Developmental Milestones */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Developmental Milestones:</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.developmentalMilestones}
                                    onChangeText={(value) => setFormData({ ...formData, developmentalMilestones: value })}
                                ></TextInput>
                            </View>

                            {/* Dietary Restrictions or Special Needs */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Dietary Restrictions or Special Needs:</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.retrictisonsOrSpecialNeeds}
                                    onChangeText={(value) => setFormData({ ...formData, retrictisonsOrSpecialNeeds: value })}
                                ></TextInput>
                            </View>

                            {/* Sleep Patterns and Habits */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Sleep Patterns and Habits:</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.sleepPatternsAndHabits}
                                    onChangeText={(value) => setFormData({ ...formData, sleepPatternsAndHabits: value })}
                                ></TextInput>
                            </View>

                            {/* Behavioral Concerns or Observations */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Behavioral Concerns or Observations:</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.behavioralConcerns}
                                    onChangeText={(value) => setFormData({ ...formData, behavioralConcerns: value })}
                                ></TextInput>
                            </View>

                            {/* Family Medical History */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Family Medical History (relevant conditions):</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.familyMedicalHistory}
                                    onChangeText={(value) => setFormData({ ...formData, familyMedicalHistory: value })}
                                ></TextInput>
                            </View>

                            {/* Other medical Information */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Other Relevant Medical Information:</Text>
                                <TextInput
                                    style={styles.infoText}
                                    mode="outlined"
                                    dense={true}
                                    value={formData.otherRelevantInfo}
                                    onChangeText={(value) => setFormData({ ...formData, otherRelevantInfo: value })}
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

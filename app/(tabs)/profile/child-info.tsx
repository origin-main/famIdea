import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Avatar, Button, TextInput } from "react-native-paper";
import { useState } from "react";

export default function Index() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        fullName: "Sofia",
        middleName: "",
        lastName: "Smith",
        dateOfBirth: "12/12/1990",
        birthWeight: "3.5kg",
        birthLength: "50cm",
        gender: "Female",
        bloodType: "A+",
        medicalConditions: "none",

        allergies: "shrimps, shellfish",
        medications: "none",
        immunizations: "covid vaccine",
        developmentalMilestones: "crawling",
        retrictisonsOrSpecialNeeds: "none",
        sleepPatternsAndHabits: "none",
        behavioralConcerns: "none",
        familyMedicalHistory: "none",
        otherRelevantInfo: "none",
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
                        <Avatar.Image size={90} source={require("@/assets/images/user-default.png")} />
                        {/* Name */}
                        <View
                            style={{
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <Text style={styles.title}>Sofia Smith</Text>
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
                            value={formData.fullName}
                            onChangeText={(value) => setFormData({ ...formData, fullName: value })}
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
                        <TextInput
                            style={styles.infoText}
                            mode="outlined"
                            dense={true}
                            value={formData.dateOfBirth}
                            onChangeText={(value) => setFormData({ ...formData, dateOfBirth: value })}
                        ></TextInput>
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

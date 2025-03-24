import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/components/constants";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Avatar, Button, IconButton, TextInput } from "react-native-paper";
import { useState } from "react";

export default function Index() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "Avery Brown",
    dateOfBirth: "12/12/1990",
    address: "Cebu City",
    phoneNumber: "09123456789",
    emergencyContact: "John Brown",
    emergencyContactNumber: "09193242123",
    estimatedDueDate: "01/01/2020",
    previousPregnancies: "2",
    deliveries: "1",
    complications: "none",
    medicalConditions: "none",
    allergies: "crabs",
    medications: "Myra E, Berocca",
    bloodType: "A+",
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
            <Avatar.Image
              size={90}
              source={require("@/assets/images/icon.png")}
            />
            {/* Name */}
            <View
              style={{
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Text style={styles.title}>Hi, Avery Brown</Text>
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

          {/* Full Name  */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name:</Text>
            <TextInput
              style={styles.infoText}
              mode="outlined"
              dense={true}
              value={formData.fullName}
              onChangeText={(value) =>
                setFormData({ ...formData, fullName: value })
              }
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
              onChangeText={(value) =>
                setFormData({ ...formData, dateOfBirth: value })
              }
            ></TextInput>
          </View>

          {/* Address  */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address:</Text>
            <TextInput
              style={styles.infoText}
              mode="outlined"
              dense={true}
              value={formData.address}
              onChangeText={(value) =>
                setFormData({ ...formData, address: value })
              }
            ></TextInput>
          </View>

          {/* Phone Number  */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number:</Text>
            <TextInput
              style={styles.infoText}
              mode="outlined"
              dense={true}
              value={formData.phoneNumber}
              onChangeText={(value) =>
                setFormData({ ...formData, phoneNumber: value })
              }
            ></TextInput>
          </View>

          {/* Emergency Contact Person */}
          <View style={styles.infoRow}>
            <Text
              style={styles.infoLabel}
            >{`Emergency \nContact Person:`}</Text>
            <TextInput
              style={styles.infoText}
              mode="outlined"
              dense={true}
              value={formData.emergencyContact}
              onChangeText={(value) =>
                setFormData({ ...formData, emergencyContact: value })
              }
            ></TextInput>
          </View>

          {/* Emergency Contact Number */}
          <View style={styles.infoRow}>
            <Text
              style={styles.infoLabel}
            >{`Emergency \nContact Number:`}</Text>
            <TextInput
              style={styles.infoText}
              mode="outlined"
              dense={true}
              value={formData.emergencyContactNumber}
              onChangeText={(value) =>
                setFormData({ ...formData, emergencyContactNumber: value })
              }
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
            <Text style={styles.infoLabel}>
              Estimated Due Date (if applicable):
            </Text>
            <TextInput
              style={styles.infoText}
              mode="outlined"
              dense={true}
              value={formData.estimatedDueDate}
              onChangeText={(value) =>
                setFormData({ ...formData, estimatedDueDate: value })
              }
            ></TextInput>
          </View>

          {/* Number of Previous Pregnancies */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Number of Previous Pregnancies:
            </Text>
            <TextInput
              style={styles.infoText}
              mode="outlined"
              dense={true}
              value={formData.previousPregnancies}
              onChangeText={(value) =>
                setFormData({ ...formData, previousPregnancies: value })
              }
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
              onChangeText={(value) =>
                setFormData({ ...formData, deliveries: value })
              }
            ></TextInput>
          </View>

          {/* History of Miscarriages/Complications  */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              History of Miscarriages/Complications (if any):
            </Text>
            <TextInput
              style={styles.infoText}
              mode="outlined"
              dense={true}
              value={formData.complications}
              onChangeText={(value) =>
                setFormData({ ...formData, complications: value })
              }
            ></TextInput>
          </View>

          {/* Existing Medical Conditions */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Existing Medical Conditions (e.g., diabetes, hypertension, heart
              issues, etc.):
            </Text>
            <TextInput
              style={styles.infoText}
              mode="outlined"
              dense={true}
              value={formData.medicalConditions}
              onChangeText={(value) =>
                setFormData({ ...formData, medicalConditions: value })
              }
            ></TextInput>
          </View>

          {/* Allergies */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Allergies (medications, foods, latex, etc.):
            </Text>
            <TextInput
              style={styles.infoText}
              mode="outlined"
              dense={true}
              value={formData.allergies}
              onChangeText={(value) =>
                setFormData({ ...formData, allergies: value })
              }
            ></TextInput>
          </View>

          {/* Current Medications & Supplements */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Current Medications & Supplements:
            </Text>
            <TextInput
              style={styles.infoText}
              mode="outlined"
              dense={true}
              value={formData.medications}
              onChangeText={(value) =>
                setFormData({ ...formData, medications: value })
              }
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
              onChangeText={(value) =>
                setFormData({ ...formData, bloodType: value })
              }
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

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Divider, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "react-native-paper-dropdown";
import { DatePickerInput } from "react-native-paper-dates";
import { router } from "expo-router";
import { COLORS } from "./constants";

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
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [formData, setFormData] = React.useState<formData>({
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    age: 0,
    birthday: new Date(),
    sex: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const options = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ];

  const handleChange = (key: keyof formData, value: string | number | Date) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
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
        <Text style={styles.title}>Create Your Account</Text>
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
          <TextInput
            mode="outlined"
            style={styles.input}
            onChangeText={(value) => handleChange("address", value)}
            value={formData.address}
            placeholder="Address"
            placeholderTextColor={COLORS.gray}
            theme={{ roundness: 30 }}
          />
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
                handleChange("age", parseInt(value));
              }}
              value={formData.age == 0 ? "" : formData.age.toString()}
              placeholder="Age"
              placeholderTextColor={COLORS.gray}
              keyboardType="numeric"
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
          <TextInput
            mode="outlined"
            style={styles.input}
            onChangeText={(value) => {
              handleChange("email", value);
              const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
              setEmailError(
                emailRegex.test(value) ? "" : "Invalid email address"
              );
            }}
            value={formData.email}
            placeholder="Email Address"
            placeholderTextColor={COLORS.gray}
            theme={{ roundness: 30 }}
            keyboardType="email-address"
          />
          {emailError ? (
            <Text style={{ color: "red" }}>{emailError}</Text>
          ) : null}
          <TextInput
            mode="outlined"
            style={styles.input}
            onChangeText={(value) => handleChange("phoneNumber", value)}
            value={formData.phoneNumber}
            placeholder="Phone Number"
            keyboardType="numeric"
            placeholderTextColor={COLORS.gray}
            theme={{ roundness: 30 }}
          />
          <Divider style={{ width: "90%", margin: 20 }} />
          <TextInput
            mode="outlined"
            style={styles.input}
            onChangeText={(value) => handleChange("password", value)}
            value={formData.password}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor={COLORS.gray}
            theme={{ roundness: 30 }}
          />
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
            secureTextEntry
            placeholderTextColor={COLORS.gray}
            theme={{ roundness: 30 }}
          />
          {passwordError ? (
            <Text style={{ color: "red" }}>{passwordError}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            //alert(JSON.stringify(formData, null, 2));
            router.push("/confirmation_page");
          }}
        >
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

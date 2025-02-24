import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../components/constants";

export default function Index() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<TextInput[]>([]); // Store input refs

  const router = useRouter();

  // Handle OTP input change
  const handleOTPChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return; // Ensure only numbers

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus to next input
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace to move focus
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <Ionicons name="chatbox-ellipses" size={150} color="black" />
        <Text style={styles.title}>Please Verify Account</Text>
        <Text style={styles.subtitle}>
          We have sent you a{" "}
          <Text style={styles.boldText}>One-Time Password</Text> to your phone.
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref!)}
              style={styles.input}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleOTPChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            // alert(JSON.stringify(otp.join(""), null, 2))
            router.push("/confirmation_success_page");
          }}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive?</Text>
          <TouchableOpacity onPress={() => alert("Resend OTP")}>
            <Text style={styles.resendLink}>Resend</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
    paddingHorizontal: 10,
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

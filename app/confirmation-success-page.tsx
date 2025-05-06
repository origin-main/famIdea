import { StyleSheet, Text, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../components/constants";
import { Button } from "react-native-paper";

export default function Index() {
  return (
    <ImageBackground
      source={require("../assets/images/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <Ionicons name="checkmark-circle" size={150} color={COLORS.success} />
        <Text style={styles.title}>Verified!</Text>
        <Text style={styles.subtitle}>Registration Successful</Text>

        <Button mode="text" textColor="blue" onPress={() => router.push("/")}>
          LOGIN
        </Button>
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
});

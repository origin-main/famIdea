import { StyleSheet, Text, ImageBackground, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants";

export default function Index() {
  return (
    <View>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Appointment</Text>
      </SafeAreaView>
    </View>
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

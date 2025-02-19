import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Index() {
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  //color scheme
  // #D5556F
  // #F0F5F7
  // #ADBB2C
  // #9CD9FC
  // #FFFFFF

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <SafeAreaView style={{ alignItems: "center" }}>
        <Image
          style={{
            width: 250,
            height: 150,
          }}
          source={require("../assets/images/logo.png")}
        />
        <Text style={styles.title}>FamIdea</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="person-circle" size={32} color="#9CD9FC" />
          <TextInput
            style={styles.input}
            onChangeText={setUsername}
            value={username}
            placeholder="Username"
            placeholderTextColor="#999"
          />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="mail" size={32} color="#9CD9FC" />

          <TextInput
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            placeholder="Email"
            placeholderTextColor="#999"
          />
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="lock-closed" size={32} color="#9CD9FC" />
          <TextInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <Text
          onPress={() => {
            alert("clicked");
          }}
          style={{ padding: 10, textDecorationLine: "underline" }}
        >
          Forgot Password
        </Text>
        <Text
          onPress={() => {
            alert("sign up");
          }}
          style={{ paddingTop: 30, justifyContent: "flex-end" }}
        >
          Don't have an account?
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 250,
    borderRadius: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: "Roboto",
    fontWeight: "bold",
    margin: 20,
  },
  button: {
    backgroundColor: "#9CD9FC",
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

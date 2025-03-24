import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/components/constants";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Avatar, Button, IconButton } from "react-native-paper";

export default function Index() {
  const router = useRouter();

  return (
    <View>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.titleBar}>
          <View style={{ position: "absolute", left: 20 }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Profile</Text>
        </View>

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
              <Text style={styles.subtitle}>averybrown@gmail.com</Text>
            </View>
          </View>
        </View>

        <View
          style={{
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%",
            paddingHorizontal: 30,
            paddingTop: 20,
          }}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              router.push("/profile/patient-info");
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#65c95b",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="pencil-outline" size={24} color="white" />
            </View>
            <View
              style={{
                width: "90%",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ marginHorizontal: 20 }}>Edit Profile</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="black"
              />
            </View>
          </TouchableOpacity>

          {/* General Settings */}
          <Text
            style={{
              justifyContent: "flex-start",
              width: "100%",
              fontSize: 16,
              marginVertical: 12,
              fontWeight: "bold",
            }}
          >
            General Settings
          </Text>

          {/* Child Information  */}
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#f4be37",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="information-outline" size={24} color="white" />
            </View>
            <View
              style={{
                width: "90%",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ marginHorizontal: 20 }}>Child Information</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="black"
              />
            </View>
          </TouchableOpacity>

          {/* Security and Privacy  */}
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#e51116",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="lock-closed" size={24} color="white" />
            </View>
            <View
              style={{
                width: "90%",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ marginHorizontal: 20 }}>Security & Privacy</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="black"
              />
            </View>
          </TouchableOpacity>

          {/* FAQs  */}
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#dfdfdf",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="help" size={24} color="black" />
            </View>
            <View
              style={{
                width: "90%",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ marginHorizontal: 20 }}>FAQs</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="black"
              />
            </View>
          </TouchableOpacity>

          {/* Favorites  */}
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#825eff",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="star" size={24} color="white" />
            </View>
            <View
              style={{
                width: "90%",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ marginHorizontal: 20 }}>Favorites</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="black"
              />
            </View>
          </TouchableOpacity>

          {/* Feedbacks  */}
          <TouchableOpacity style={styles.button} onPress={() => {}}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#2963d6",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="alert-circle" size={24} color="white" />
            </View>
            <View
              style={{
                width: "90%",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ marginHorizontal: 20 }}>Feedbacks</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="black"
              />
            </View>
          </TouchableOpacity>

          {/* log out  */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              router.push("/");
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#e96ac4",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="log-out" size={24} color="white" />
            </View>
            <View
              style={{
                width: "90%",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ marginHorizontal: 20 }}>Log out</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="black"
              />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  titleBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
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
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 5,
  },
  subtitle: {
    fontSize: 20,
    textAlign: "center",
    marginVertical: 2,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    marginTop: 10,
    width: "100%",
    height: 50,
  },
});

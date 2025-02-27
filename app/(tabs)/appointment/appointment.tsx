import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../components/constants";
import { IconButton, TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Calendar, CalendarList, Agenda } from "react-native-calendars";

export default function Index() {
  const router = useRouter();
  const [selected, setSelected] = useState("");

  const servicePoints = [
    "Delivery costs, including natural spontaneous delivery (NSD) and cesarean section (CS)",
    "Room and board",
    "Meals",
    "Amenities",
    "Postnatal care",
    "Newborn care, including screening and hearing tests",
  ];

  return (
    <View>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.titleBar}>
          <View style={{ position: "absolute", left: 20 }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>My Appointment</Text>
        </View>
        <View
          style={{
            backgroundColor: COLORS.darkBlue,
            width: "100%",
            paddingVertical: 15,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <TouchableOpacity style={styles.button} onPress={() => {}}>
              <Text>Active</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => {}}>
              <Text>History</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            width: "100%",
            alignItems: "center",
            marginTop: 30,
          }}
        >
          <Image
            style={{
              width: 130,
              height: 130,
              backgroundColor: COLORS.lightBlue,
              objectFit: "fill",
              margin: 10,
            }}
            source={require("@/assets/images/service-icons/health-clinic.png")}
          />
          <Text style={{ fontWeight: "bold", fontSize: 20 }}>
            Margarita Birthing Center
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 5,
              alignItems: "center",
              margin: 10,
            }}
          >
            <Ionicons size={15} name="star-half" color={"black"} />
            <Text style={{ fontSize: 15, fontWeight: "bold" }}>4.5</Text>
          </View>

          <View
            style={{
              width: "100%",
              alignItems: "flex-start",
              paddingHorizontal: 20,
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Service:</Text>
            <Text style={{ fontSize: 18 }}>MATERNAL DELIVERY PACKAGE</Text>
            {servicePoints.map((point, index) => (
              <Text
                key={index}
                style={{ fontSize: 15, textAlign: "left", marginLeft: 10 }}
              >
                • {point}
              </Text>
            ))}
          </View>
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
    height: "100%",
    backgroundColor: COLORS.white,
    alignItems: "flex-start",
  },
  button: {
    backgroundColor: COLORS.lightBlue,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    width: 170,
    height: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "white",
  },
});

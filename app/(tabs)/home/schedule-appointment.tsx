import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../components/constants";
import { Button, IconButton, TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";

export default function Index() {
  const router = useRouter();
  const [selected, setSelected] = useState("");

  const timeSlots = [
    { label: "9:00", value: "9:00" },
    { label: "10:00", value: "10:00" },
    { label: "11:00", value: "11:00" },
    { label: "11:00", value: "11:00" },
    { label: "11:00", value: "11:00" },
    { label: "11:00", value: "11:00" },
    { label: "11:00", value: "11:00" },
    { label: "11:00", value: "11:00" },
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
          <Text style={styles.title}>Appointment Schedule</Text>
        </View>

        <View
          style={{
            width: "100%",
            padding: 10,
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: "100%",
              height: 170,
              backgroundColor: COLORS.white,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <Image
                style={{
                  width: "25%",
                  height: "50%",
                  backgroundColor: COLORS.lightBlue,
                  objectFit: "fill",
                  margin: 5,
                }}
                source={require("@/assets/images/service-icons/health-clinic.png")}
              />
              {/* Clinic Details */}
              <View style={{ alignItems: "flex-start", gap: 3, width: "50%" }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "bold" }}>
                    Margarita birthing center
                  </Text>
                  <IconButton
                    size={15}
                    icon="heart-outline"
                    iconColor={"black"}
                    onPress={() => {
                      alert("heart clicked");
                    }}
                  />
                </View>
                <View style={{ flexDirection: "row", gap: 5 }}>
                  <Ionicons size={15} name="star-half" color={"black"} />
                  <Text style={{ fontSize: 12, fontWeight: "bold" }}>4.5</Text>
                </View>
              </View>
            </View>
          </View>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Calendar
              onDayPress={(day: any) => {
                setSelected(day.dateString);
              }}
              markedDates={{
                [selected]: {
                  selected: true,
                  disableTouchEvent: true,
                  selectedDotColor: "orange",
                },
              }}
              style={{
                width: 400, // Adjust width to fit screen
                height: 350, // Set a fixed height to prevent overlap
              }}
              theme={{
                textDayFontSize: 12,
                textMonthFontSize: 14,
                textDayHeaderFontSize: 12,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: 5,
              margin: 10,
              maxWidth: "100%",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {timeSlots.map((data, index) => (
              <TouchableOpacity
                key={index}
                style={styles.button}
                onPress={() => {}}
              >
                <Text>{data.label}</Text>
              </TouchableOpacity>
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  button: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    width: 80,
    height: 50,
  },
});

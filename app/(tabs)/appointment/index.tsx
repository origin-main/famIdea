import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../components/constants";
import { Card, IconButton, TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Calendar, CalendarList, Agenda } from "react-native-calendars";
import { set } from "date-fns";

type BirthCenter = {
  id: string;
  name: string;
  address: string;
  pictureUrl: string;
};

export default function Index() {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [active, setActive] = useState(0);

  const staticActive: BirthCenter[] = [
    {
      id: "1",
      name: "Sunshine Birth Center (Active)",
      address: "123 Sakura St, Tokyo",
      pictureUrl: "https://via.placeholder.com/60",
    },
    {
      id: "2",
      name: "Hana Women's Clinic (Active)",
      address: "456 Ume Ave, Kyoto",
      pictureUrl: "https://via.placeholder.com/60",
    },
    {
      id: "3",
      name: "Miyabi Maternity Home (Active)",
      address: "789 Momiji Rd, Osaka",
      pictureUrl: "https://via.placeholder.com/60",
    },
  ];

  const staticHistory: BirthCenter[] = [
    {
      id: "1",
      name: "Sunshine Birth Center",
      address: "123 Sakura St, Tokyo",
      pictureUrl: "https://via.placeholder.com/60",
    },
    {
      id: "2",
      name: "Hana Women's Clinic",
      address: "456 Ume Ave, Kyoto",
      pictureUrl: "https://via.placeholder.com/60",
    },
    {
      id: "3",
      name: "Miyabi Maternity Home",
      address: "789 Momiji Rd, Osaka",
      pictureUrl: "https://via.placeholder.com/60",
    },
  ];

  const getRating = () => {
    return (Math.random() * 2 + 3).toFixed(1);
  };

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
            <TouchableOpacity style={[styles.button, active === 0 && styles.active]} onPress={() => { setActive(0) }}>
              <Text style={[active === 0 && { color: COLORS.white }]}>
                Active</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, active === 1 && styles.active]} onPress={() => { setActive(1) }}>
              <Text style={[active === 1 && { color: COLORS.white }]}>
                History</Text>
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
          {active === 0 ? (
            <View style={{ width: "90%" }} >
              <FlatList
                data={staticActive}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => { }} activeOpacity={0.8}>
                    <Card style={{ width: "100%", marginBottom: 10 }}>
                      <Card.Content style={{ width: "100%" }}>
                        <View style={{ flexDirection: "row" }}>
                          <Image
                            style={{
                              width: 60,
                              height: 60,
                              backgroundColor: COLORS.lightBlue,
                              objectFit: "fill",
                              marginRight: 20,
                              borderRadius: 50,
                            }}
                            source={
                              item.pictureUrl
                                ? { uri: item.pictureUrl }
                                : require("@/assets/images/service-icons/health-clinic.png")
                            }
                          />
                          <View style={{ flexDirection: "column", gap: 5 }}>
                            <View style={{ flexDirection: "row", gap: 3 }}>
                              <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                              <Text
                                style={{
                                  flexShrink: 1,
                                  flexWrap: "wrap",
                                  width: "70%",
                                }}
                              >
                                {item.address}
                              </Text>
                              <Text style={{ alignSelf: "flex-end" }}>
                                {getRating()} <Ionicons name="star" size={15} color="gold" />
                              </Text>
                            </View>
                          </View>
                        </View>
                      </Card.Content>
                    </Card>
                  </TouchableOpacity>
                )}
              />
            </View>
          ) : <View style={{ width: "90%" }} >
            <FlatList
              data={staticHistory}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => { }} activeOpacity={0.8}>
                  <Card style={{ width: "100%", marginBottom: 10 }}>
                    <Card.Content style={{ width: "100%" }}>
                      <View style={{ flexDirection: "row" }}>
                        <Image
                          style={{
                            width: 60,
                            height: 60,
                            backgroundColor: COLORS.lightBlue,
                            objectFit: "fill",
                            marginRight: 20,
                            borderRadius: 50,
                          }}
                          source={
                            item.pictureUrl
                              ? { uri: item.pictureUrl }
                              : require("@/assets/images/service-icons/health-clinic.png")
                          }
                        />
                        <View style={{ flexDirection: "column", gap: 5 }}>
                          <View style={{ flexDirection: "row", gap: 3 }}>
                            <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                          </View>
                          <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text
                              style={{
                                flexShrink: 1,
                                flexWrap: "wrap",
                                width: "70%",
                              }}
                            >
                              {item.address}
                            </Text>
                            <Text style={{ alignSelf: "flex-end" }}>
                              {getRating()} <Ionicons name="star" size={15} color="gold" />
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              )}
            />
          </View>}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  active: {
    backgroundColor: COLORS.primary,
  },

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

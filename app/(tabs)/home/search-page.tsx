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
import { Dropdown } from "react-native-paper-dropdown";

export default function Index() {
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const [sampleData, setSampleData] = useState([
    {
      name: "Margarita birthing center",
      rating: 4.5,
      image: require("@/assets/images/service-icons/health-clinic.png"),
    },
    {
      name: "Margarita birthing center",
      rating: 4.5,
      image: require("@/assets/images/service-icons/health-clinic.png"),
    },
    {
      name: "Margarita birthing center",
      rating: 4.5,
      image: require("@/assets/images/service-icons/health-clinic.png"),
    },
  ]);

  const router = useRouter();

  const options = [
    { label: "Name", value: "Name" },
    { label: "Date", value: "Date" },
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
          <Text style={styles.title}>Birthing Centers</Text>
        </View>

        {/* Search filters */}
        <View
          style={{
            width: "100%",
            paddingHorizontal: 30,
            paddingVertical: 10,
            gap: 10,
          }}
        >
          <TextInput
            mode="outlined"
            theme={{ roundness: 5 }}
            onChangeText={setSearchValue}
            value={searchValue}
            placeholder="Search here.."
            right={<TextInput.Icon icon="magnify" />}
            placeholderTextColor={COLORS.gray}
          />
          <View
            style={{
              width: "40%",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Dropdown
              mode="outlined"
              placeholder="Sort by"
              options={options}
              value={filterValue}
              onSelect={(value) => setFilterValue(value as string)}
            />
            <Ionicons name="filter" size={32} color="black" />
          </View>
        </View>

        <View
          style={{
            flex: 1,
            width: "100%",
            padding: 10,
            height: "100%",
            justifyContent: "center",
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {sampleData.map((_, index) => (
              <TouchableOpacity
                onPressIn={() => router.push("/home/clinic-page")}
                key={index}
                style={{
                  width: "100%",
                  height: 170,
                  backgroundColor: COLORS.white,
                  borderColor: "black",
                  borderWidth: 1,
                  alignItems: "flex-start",
                  justifyContent: "center",
                  borderRadius: 5,
                  marginBottom: 10,
                  paddingVertical: 10,
                }}
                onPress={() => {}}
              >
                <View
                  style={{
                    flexDirection: "row",
                    height: "100%",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Image
                    style={{
                      width: "40%",
                      height: "100%",
                      backgroundColor: COLORS.lightBlue,
                      objectFit: "fill",
                      margin: 5,
                    }}
                    source={require("@/assets/images/service-icons/health-clinic.png")}
                  />
                  {/* Clinic Details */}
                  <View
                    style={{ alignItems: "flex-start", gap: 3, width: "80%" }}
                  >
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

                    <Text
                      style={{
                        fontSize: 14,
                        flexWrap: "wrap",
                        width: "70%",
                      }}
                    >
                      <Text style={{ fontWeight: "bold" }}>Address: </Text>
                      Mandaue City, Cebu. Philippines 6000
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        flexWrap: "wrap",
                        width: "70%",
                      }}
                    >
                      <Text style={{ fontWeight: "bold" }}>Hours: </Text>
                      8:00 AM - 5:00 PM
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        flexWrap: "wrap",
                        width: "70%",
                      }}
                    >
                      <Text style={{ fontWeight: "bold" }}>Phone: </Text>
                      0999-999-9999
                    </Text>
                    <View style={{ flexDirection: "row", gap: 5 }}>
                      <Ionicons size={15} name="star-half" color={"black"} />
                      <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                        4.5
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    width: 70,
    height: 70,
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

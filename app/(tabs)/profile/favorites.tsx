import React from "react";
import { View, StyleSheet, Image, Text, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/components/constants";
import { Card, IconButton } from "react-native-paper";

export default function Index() {
  const favorites = [
    {
      name: "Margarita Birthing Center III",
      address: "96 - J Gorordo Ave, Cebu City, 6000 Cebu",
      rating: 4.5
    },
  ];

  return (
    <ImageBackground
      source={require("@/assets/images/background.png")} // Correct way to set a background image
      style={{
        flex: 1,
        justifyContent: "center",
        backgroundColor: COLORS.white,
        alignItems: "center",
      }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ alignItems: "center" }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "90%",
            // backgroundColor: "gray",
          }}
        >
          <IconButton
            size={24}
            icon="heart-plus"
            mode="outlined"
            iconColor={"black"}
            onPress={() => {
              alert("create msg");
            }}
          />
          <Text style={{ fontSize: 27 }}>Favorites</Text>
        </View>
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            width: "90%",
            height: "85%",
            margin: 10,
            gap: 10,
          }}
        >
          {favorites.map((data, index) => (
            <Card
              key={index}
              style={{
                width: 350,
              }}
              onPress={() => {
                alert("clicked");
              }}
            >
              <Card.Content style={{ width: "100%" }}>
                <View style={{ flexDirection: "row" }}>
                  <Image
                    style={{
                      width: 50,
                      height: 50,
                      backgroundColor: COLORS.lightBlue,
                      objectFit: "fill",
                      marginRight: 20,
                      borderRadius: 20,
                    }}
                    source={require("@/assets/images/service-icons/health-clinic.png")}
                  />
                  <View style={{ flexDirection: "column", gap: 5 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 3,
                      }}
                    >
                      <Text style={{ fontWeight: "bold" }}>
                        {data.name}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                      <Text
                        style={{
                          flexShrink: 1,
                          flexWrap: "wrap",
                          width: "70%",
                        }}
                      >
                        {data.address}
                      </Text>
                      <Text
                        style={{
                          alignSelf: "flex-end",
                        }}
                      >
                        {data.rating} <Ionicons name="star" size={15} color={COLORS.lightBlue} />
                      </Text>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

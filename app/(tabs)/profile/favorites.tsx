import React, { useEffect, useState } from "react";
import { View, Image, Text, ImageBackground, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/components/constants";
import { ActivityIndicator, Card } from "react-native-paper";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { getPicture } from "@/utils/common";

type BirthCenter = {
    id: string;
    name: string;
    address: string;
    pictureUrl: string | null;
    rating: number;
};

export default function Index() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<BirthCenter[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFavorites();
    }, [user]);

    const fetchFavorites = async () => {
        if (!user) return;

        setLoading(true);

        const { data, error } = await supabase
            .from("preferred_centers")
            .select("birth_center:birth_centers (id, name, address, picture_url, ratings:ratings(rating))")
            .eq("patient_id", user.id);

        if (error) {
            console.error("Error fetching preferred birth centers:", error);
        } else {
            const birthCenters = data?.map((item: any) => {
                const ratings = item.birth_center.ratings || [];
                const averageRating = ratings.length > 0 ? ratings.reduce((sum: any, r: any) => sum + r.rating, 0) / ratings.length : 0;
                return {
                    id: item.birth_center.id,
                    name: item.birth_center.name,
                    address: item.birth_center.address,
                    pictureUrl: getPicture(item.birth_center.picture_url),
                    rating: averageRating,
                };
            });

            setFavorites(birthCenters);
        }

        setLoading(false);
    };

    const handleBirthCenterClick = (centerId: string) => {
        router.push({
            pathname: "/clinic-page",
            params: { id: centerId },
        });
    };

    // Static random rating
    const getRating = () => {
        return (Math.random() * 2 + 3).toFixed(1);
    };

    return (
        <ImageBackground
            source={require("@/assets/images/background.png")}
            style={{
                flex: 1,
                justifyContent: "center",
                backgroundColor: COLORS.white,
                alignItems: "center",
            }}
            resizeMode="cover"
        >
            <SafeAreaView style={{ width: "100%", height: "100%", padding: 20 }}>
                <View
                    style={{
                        alignItems: "flex-end",
                        width: "100%",
                        marginTop: 10,
                        marginBottom: 30,
                    }}
                >
                    <Text style={{ fontSize: 27 }}>Favorites</Text>
                </View>
                {loading ? (
                    <ActivityIndicator style={{ flex: 1 }} color={COLORS.lightBlue} />
                ) : (
                    <FlatList
                        data={favorites}
                        keyExtractor={(item, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchFavorites} />}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleBirthCenterClick(item.id)} activeOpacity={0.8}>
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
                                                </View>
                                            </View>
                                        </View>
                                        <View
                                            style={{
                                                position: "absolute",
                                                bottom: 10,
                                                right: 10,
                                                alignItems: "center",
                                                flexDirection: "row",
                                                gap: 5,
                                            }}
                                        >
                                            <Text>{item.rating}</Text>
                                            <Ionicons name="star" size={15} color="gold" />
                                        </View>
                                    </Card.Content>
                                </Card>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </SafeAreaView>
        </ImageBackground>
    );
}

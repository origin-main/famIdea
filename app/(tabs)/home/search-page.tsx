import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../components/constants";
import { ActivityIndicator, Checkbox, Divider, IconButton, Menu, TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Dropdown } from "react-native-paper-dropdown";
import { supabase } from "@/utils/supabase";
import BirthCenterCard from "@/components/ui/BirthCenterCard";
import * as Location from "expo-location";
import { getDistance, orderByDistance } from "geolib";

type BirthCenter = {
    id: string;
    name: string;
    address: string;
    contactNumber: string;
    description?: string;
    latitude: string;
    longitude: string;
    pictureUrl: string;
    rating: number;
};

export default function Index() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    // Search, filter, sort
    const [searchValue, setSearchValue] = useState("");
    const [sortValue, setSortValue] = useState("");
    const [filterValue, setFilterValue] = useState();
    const [descChecked, setDescChecked] = useState(false);

    const [birthCenters, setBirthCenters] = useState<BirthCenter[]>([]);

    const options = [
        { label: "Name", value: "name" },
        { label: "Location", value: "location" },
        { label: "Rating", value: "rating" },
    ];

    const filters = [
        { label: "Pre Natal", value: "1" },
        { label: "Panganak", value: "2" },
        { label: "Well Baby", value: "3" },
        { label: "Immunization", value: "4" },
        { label: "Family Planning", value: "5" },
    ];

    useEffect(() => {
        fetchBirthCenters();
    }, []);

    // Get user's current location
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.log("Permission to access location was denied");
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
        })();
    }, []);

    const fetchBirthCenters = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("birth_centers")
            .select("id, name, address, contact_number, description, latitude, longitude, picture_url")
            .eq("status", "approved");

        if (error) {
            console.error("Failed to fetch birth centers:", error.message);
            setLoading(false);
            return;
        }

        setBirthCenters(
            (data as any).map((center: any) => ({
                id: center.id,
                name: center.name,
                address: center.address,
                contactNumber: center.contact_number,
                description: center.description,
                latitude: center.latitude,
                longitude: center.longitude,
                pictureUrl: center.picture_url,
                rating: getRating(),
            }))
        );

        setLoading(false);
    };

    // Filter birth centers based on search input
    const filteredCenters = birthCenters.filter(
        (center) => center.name.toLowerCase().includes(searchValue.toLowerCase()) || center.address.toLowerCase().includes(searchValue.toLowerCase())
    );

    const sortedCenters = [...filteredCenters].sort((a, b) => {
        let compareValue = 0;

        if (sortValue === "name") {
            compareValue = a.name.localeCompare(b.name);
        } else if (sortValue === "location" && location) {
            const distA = getDistance(location, {
                latitude: a.latitude,
                longitude: a.longitude,
            });

            const distB = getDistance(location, {
                latitude: b.latitude,
                longitude: b.longitude,
            });

            compareValue = distA - distB;
        } else if (sortValue === "rating") {
            compareValue = a.rating - b.rating;
        }

        return descChecked ? -compareValue : compareValue;
    });

    const handleCardClick = (centerId: string) => {
        router.navigate({
            pathname: "/home/clinic-page",
            params: { id: centerId },
        });
    };

    // Get random static rating
    const getRating = () => (Math.random() * 2 + 3).toFixed(1);

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
                        paddingHorizontal: 10,
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
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                            justifyContent: "space-between",
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, width: 150 }}>
                            <Dropdown
                                mode="outlined"
                                placeholder="Sort by"
                                options={options}
                                value={sortValue}
                                onSelect={(value) => setSortValue(value as string)}
                            />
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Checkbox
                                    status={descChecked ? "checked" : "unchecked"}
                                    onPress={() => {
                                        setDescChecked(!descChecked);
                                    }}
                                    color={COLORS.darkBlue}
                                    disabled={!sortValue}
                                />
                                <Text style={{ fontSize: 16 }}>Desc</Text>
                            </View>
                        </View>
                        <IconButton icon="filter-variant" size={32} iconColor="black" onPress={() => console.log("Filter")} />
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator color={COLORS.lightBlue} style={{ flex: 1, width: "100%" }} />
                ) : (
                    <View
                        style={{
                            flex: 1,
                            width: "100%",
                            padding: 10,
                            height: "100%",
                            justifyContent: "center",
                        }}
                    >
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchBirthCenters} />}
                        >
                            {sortedCenters.map((item, index) => (
                                <BirthCenterCard data={item} key={index} onPress={() => handleCardClick(item.id)} />
                            ))}
                        </ScrollView>
                    </View>
                )}
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

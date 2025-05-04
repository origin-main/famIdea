import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SERVICE_ICONS } from "@/components/constants";
import { ActivityIndicator, Button, Divider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/utils/supabase";
import BirthCenterCard from "@/components/ui/BirthCenterCard";
import ServiceModal from "@/components/ui/ServiceModal";
import { getAvailabilityText } from "@/utils/common";

type Service = {
    id: string;
    serviceId: number;
    name: string;
};

type BirthCenter = {
    id: string;
    name: string;
    address: string;
    contactNumber: string;
    description?: string;
    latitude?: string;
    longitude?: string;
    pictureUrl: string;
    openingTime: string;
    closingTime: string;
    availableDays: string[];
    services: Service[];
};

type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export default function Index() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [birthCenterData, setBirthCenterData] = useState<BirthCenter | null>(null);

    const [serviceModalVisible, setServiceModalVisible] = useState<boolean>(false);
    const [selectedService, setSelectedService] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchBirthCenterData(id as string);
        }
    }, [id]);

    const fetchBirthCenterData = async (id: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("birth_centers")
            .select(
                `id, name, address, contact_number, description, latitude, longitude, picture_url, opening_time, closing_time, available_days,
                services (
                  id,
                  service_id,
                  services_list (
                    id,
                    name
                  )
                )`
            )
            .eq("id", id)
            .single();

        if (error) {
            console.error("Failed to fetch birth center:", error.message);
            return null;
        }

        setBirthCenterData({
            id: data.id,
            name: data.name,
            address: data.address,
            contactNumber: data.contact_number,
            description: data.description,
            latitude: data.latitude,
            longitude: data.longitude,
            pictureUrl: data.picture_url,
            openingTime: data.opening_time,
            closingTime: data.closing_time,
            availableDays: data.available_days,
            services: data.services.map((s: any) => ({
                id: s.id,
                serviceId: s.services_list.id,
                name: s.services_list.name,
            })),
        });

        setLoading(false);
    };

    const handleMessageClick = () => {
        router.navigate({
            pathname: "/chat",
            params: { birthCenterId: birthCenterData?.id, name: birthCenterData?.name },
        });
    };

    // Function to render service rows
    const renderServiceRows = () => {
        if (!birthCenterData) {
            return null;
        }

        const rows = [];
        const itemsPerRow = 3;

        for (let i = 0; i < birthCenterData.services.length; i += itemsPerRow) {
            const rowItems = birthCenterData.services.slice(i, i + itemsPerRow);
            rows.push(
                <View key={i} style={{ flexDirection: "row", justifyContent: "space-evenly", marginVertical: 10 }}>
                    {rowItems.map((service: Service, index) => (
                        <View
                            key={index}
                            style={{
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => {
                                    setSelectedService(service.id);
                                    setServiceModalVisible(true);
                                }}
                            >
                                <Image style={{ width: 50, height: 50 }} source={SERVICE_ICONS[service.serviceId]} />
                            </TouchableOpacity>
                            <Text
                                style={{
                                    fontSize: 10,
                                    maxWidth: 100,
                                    textAlign: "center",
                                }}
                            >
                                {service.name}
                            </Text>
                        </View>
                    ))}
                </View>
            );
        }

        return rows;
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
                    <Text style={styles.title}>Birthing Centers</Text>
                </View>

                {loading ? (
                    <ActivityIndicator style={{ flex: 1, width: "100%" }} color={COLORS.lightBlue} />
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
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {birthCenterData && <BirthCenterCard data={birthCenterData} disabled />}
                            <Text style={{ paddingHorizontal: 10, paddingVertical: 5 }}>
                                <Text style={{ fontWeight: "bold" }}>Availability: </Text>
                                {getAvailabilityText(birthCenterData?.availableDays.map((s) => s.toLowerCase() as DayKey))}
                            </Text>
                            {birthCenterData?.description && (
                                <View style={{ paddingHorizontal: 10, paddingVertical: 5 }}>
                                    <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Description</Text>
                                    <ScrollView style={{ height: 100, padding: 10, backgroundColor: COLORS.grey, borderRadius: 5 }}>
                                        <Text style={{ marginBottom: 10, paddingBottom: 10 }}>{birthCenterData?.description || "Description"}</Text>
                                    </ScrollView>
                                </View>
                            )}
                            <View style={{ width: "50%", alignSelf: "center", marginBottom: 5, marginTop: 10 }}>
                                <Button mode="contained" buttonColor={COLORS.lightBlue} textColor="black" onPress={handleMessageClick}>
                                    Message Us
                                </Button>
                            </View>
                            <Divider style={{ margin: 10 }}></Divider>

                            <View style={{ alignItems: "center" }}>
                                <Text style={styles.title}>Our Services Include:</Text>
                            </View>
                            {renderServiceRows()}
                        </ScrollView>
                        <ServiceModal id={selectedService} visible={serviceModalVisible} setVisible={setServiceModalVisible} />
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

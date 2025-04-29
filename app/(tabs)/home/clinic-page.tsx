import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../components/constants";
import { ActivityIndicator, IconButton, TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import MaternalDeliveryModal from "./serviceModals/MaternalDeliveryModal";
import { supabase } from "@/utils/supabase";
import BirthCenterCard from "@/components/ui/BirthCenterCard";

type BirthCenter = {
    id: string;
    name: string;
    address: string;
    contactNumber: string;
    description?: string;
    latitude?: string;
    longitude?: string;
    pictureUrl: string;
};

export default function Index() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [birthCenterData, setBirthCenterData] = useState<BirthCenter | null>(null);

    const [maternalDeliveryModalVisible, setMaternalDeliveryModalVisible] = useState<boolean>(false);

    useEffect(() => {
        if (id) {
            fetchBirthCenterData(id as string);
        }
    }, [id]);

    const fetchBirthCenterData = async (id: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("birth_centers")
            .select("id, name, address, contact_number, description, latitude, longitude, picture_url")
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
        });

        setLoading(false);
    };

    const handleMessageClick = () => {
        router.navigate({
            pathname: "/messaging/chat",
            params: { birthCenterId: birthCenterData?.id, name: birthCenterData?.name },
        });
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
                    <ActivityIndicator style={{ flex: 1 }} color={COLORS.lightBlue} />
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
                            <View style={{ alignItems: "center" }}>
                                <TouchableOpacity style={styles.loginButton} onPress={handleMessageClick}>
                                    <Text style={styles.loginButtonText}>Message Us</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{ alignItems: "center" }}>
                                <Text style={styles.title}>Our Services Include:</Text>
                            </View>

                            <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
                                <View
                                    style={{
                                        flexDirection: "column",
                                        gap: 10,
                                        alignItems: "center",
                                    }}
                                >
                                    <TouchableOpacity style={styles.button} onPress={() => {}}>
                                        <Image
                                            style={{
                                                width: 50,
                                                height: 50,
                                            }}
                                            source={require("@/assets/images/service-icons/family.png")}
                                        />
                                    </TouchableOpacity>
                                    <Text style={{ fontSize: 10 }}>Family Planning</Text>
                                </View>

                                <View
                                    style={{
                                        flexDirection: "column",
                                        gap: 10,
                                        alignItems: "center",
                                    }}
                                >
                                    <TouchableOpacity style={styles.button} onPress={() => {}}>
                                        <Image
                                            style={{
                                                width: 50,
                                                height: 50,
                                            }}
                                            source={require("@/assets/images/service-icons/mother.png")}
                                        />
                                    </TouchableOpacity>
                                    <Text style={{ fontSize: 10 }}>Newborn Package</Text>
                                </View>

                                <View
                                    style={{
                                        flexDirection: "column",
                                        gap: 10,
                                        alignItems: "center",
                                    }}
                                >
                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={() => {
                                            setMaternalDeliveryModalVisible(true);
                                        }}
                                    >
                                        <Image
                                            style={{
                                                width: 50,
                                                height: 50,
                                            }}
                                            source={require("@/assets/images/service-icons/pregnant.png")}
                                        />
                                    </TouchableOpacity>
                                    <Text
                                        style={{
                                            fontSize: 10,
                                            maxWidth: 100,
                                            textAlign: "center",
                                        }}
                                    >
                                        Maternal Delivery Package
                                    </Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
                                <View
                                    style={{
                                        flexDirection: "column",
                                        gap: 10,
                                        alignItems: "center",
                                    }}
                                >
                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={() => {
                                            setMaternalDeliveryModalVisible(true);
                                        }}
                                    >
                                        <Image
                                            style={{
                                                width: 50,
                                                height: 50,
                                            }}
                                            source={require("@/assets/images/service-icons/pediatrics.png")}
                                        />
                                    </TouchableOpacity>
                                    <Text
                                        style={{
                                            fontSize: 10,
                                            maxWidth: 100,
                                            textAlign: "center",
                                        }}
                                    >
                                        Prenatal and Postpartum Care
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        flexDirection: "column",
                                        gap: 10,
                                        alignItems: "center",
                                    }}
                                >
                                    <TouchableOpacity style={styles.button} onPress={() => {}}>
                                        <Image
                                            style={{
                                                width: 50,
                                                height: 50,
                                            }}
                                            source={require("@/assets/images/service-icons/baby.png")}
                                        />
                                    </TouchableOpacity>
                                    <Text
                                        style={{
                                            fontSize: 10,
                                            maxWidth: 100,
                                            textAlign: "center",
                                        }}
                                    >
                                        Newborn Screening Test
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>
                        <MaternalDeliveryModal visible={maternalDeliveryModalVisible} setVisible={setMaternalDeliveryModalVisible} />
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
    loginButton: {
        backgroundColor: COLORS.lightBlue,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        marginBottom: 20,
        width: 150,
    },
    loginButtonText: {
        color: "black",
        fontSize: 16,
        fontWeight: "bold",
    },
});

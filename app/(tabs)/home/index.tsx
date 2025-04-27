import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/components/constants";
import { Avatar, TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { getProfilePicture } from "@/utils/common";

export default function Index() {
    const { user } = useAuth();
    const [searchValue, setSearchValue] = useState("");
    const [profilePicture, setProfilePicture] = useState<string | null>(null);

    useEffect(() => {
        if (user?.profile?.profile_picture_url) {
            const url = getProfilePicture(user?.profile?.profile_picture_url);
            setProfilePicture(url);
        } else {
            setProfilePicture(null);
        }
    }, [user?.profile?.profile_picture_url]);

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

    return (
        <View>
            <SafeAreaView style={styles.safeArea}>
                {/* Avatar and header details */}
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        paddingHorizontal: 30,
                        paddingTop: 40,
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Avatar.Image
                            size={60}
                            style={{ backgroundColor: "white" }}
                            source={profilePicture ? { uri: profilePicture } : require("@/assets/images/user-default.png")}
                        />
                        {/* Name */}
                        <View
                            style={{
                                flexDirection: "column",
                                alignItems: "flex-start",
                            }}
                        >
                            <Text style={styles.title}>Hi, {`${user?.profile?.first_name} ${user?.profile?.last_name}`}</Text>
                            <Text style={styles.subtitle}>Welcome back!</Text>
                        </View>
                    </View>
                    <View>
                        <Ionicons
                            size={28}
                            name="notifications"
                            color={"white"}
                            onPress={() => {
                                router.push("/home/notifications");
                            }}
                        />
                    </View>
                </View>

                {/* Search bar */}
                <View
                    style={{
                        width: "100%",
                        paddingHorizontal: 30,
                        paddingVertical: 10,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            router.push("/(tabs)/home/search-page");
                        }}
                    >
                        <TextInput
                            readOnly
                            mode="outlined"
                            theme={{ roundness: 10 }}
                            placeholder="Birthing Centers near you"
                            left={<TextInput.Icon icon="magnify" />}
                            placeholderTextColor={COLORS.gray}
                        />
                    </TouchableOpacity>
                </View>

                {/* Services */}
                <View
                    style={{
                        padding: 20,
                        backgroundColor: "white",
                        height: "40%",
                        width: "100%",
                        borderRadius: 10,
                    }}
                >
                    <Text style={{ fontSize: 17, fontWeight: "bold" }}>Services</Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
                        <View style={{ flexDirection: "column", gap: 10, alignItems: "center" }}>
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

                        <View style={{ flexDirection: "column", gap: 10, alignItems: "center" }}>
                            <TouchableOpacity style={styles.button} onPress={() => {}}>
                                <Image
                                    style={{
                                        width: 50,
                                        height: 50,
                                    }}
                                    source={require("@/assets/images/service-icons/mother.png")}
                                />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 10 }}>Pre Natal Care</Text>
                        </View>

                        <View style={{ flexDirection: "column", gap: 10, alignItems: "center" }}>
                            <TouchableOpacity style={styles.button} onPress={() => {}}>
                                <Image
                                    style={{
                                        width: 50,
                                        height: 50,
                                    }}
                                    source={require("@/assets/images/service-icons/pregnant.png")}
                                />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 10 }}>Delivery</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
                        <View style={{ flexDirection: "column", gap: 10, alignItems: "center" }}>
                            <TouchableOpacity style={styles.button} onPress={() => {}}>
                                <Image
                                    style={{
                                        width: 50,
                                        height: 50,
                                    }}
                                    source={require("@/assets/images/service-icons/pediatrics.png")}
                                />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 10 }}>Child Care</Text>
                        </View>
                        <View style={{ flexDirection: "column", gap: 10, alignItems: "center" }}>
                            <TouchableOpacity style={styles.button} onPress={() => {}}>
                                <Image
                                    style={{
                                        width: 50,
                                        height: 50,
                                    }}
                                    source={require("@/assets/images/service-icons/baby.png")}
                                />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 10 }}>Post Natal Care</Text>
                        </View>
                        <View style={{ flexDirection: "column", gap: 10, alignItems: "center" }}>
                            <TouchableOpacity style={styles.button} onPress={() => {}}>
                                <Image
                                    style={{
                                        width: 50,
                                        height: 50,
                                    }}
                                    source={require("@/assets/images/service-icons/consultation.png")}
                                />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 10 }}>Consultation</Text>
                        </View>
                    </View>
                </View>

                {/* Birthing Center */}
                <View
                    style={{
                        padding: 20,
                        backgroundColor: "#e0e0e0",
                        width: "100%",
                        borderRadius: 10,
                        marginTop: 10,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingBottom: 5,
                        }}
                    >
                        <Text style={{ fontSize: 15, fontWeight: "bold" }}>Birthing Centers near you</Text>
                        <Ionicons
                            size={28}
                            name="arrow-forward-circle"
                            onPress={() => {
                                router.push("/(tabs)/home/search-page");
                            }}
                            color={"black"}
                        />
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {sampleData.map((data, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        width: 150,
                                        height: 170,
                                        backgroundColor: COLORS.white,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: 5,
                                        marginRight: 10,
                                        paddingVertical: 10,
                                    }}
                                    onPress={() => {
                                        router.push("/home/clinic-page");
                                    }}
                                >
                                    <Image
                                        style={{
                                            width: "90%",
                                            height: "80%",
                                            backgroundColor: COLORS.lightBlue,
                                            objectFit: "fill",
                                            margin: 5,
                                        }}
                                        source={require("@/assets/images/service-icons/health-clinic.png")}
                                    />
                                    <View style={{ alignItems: "center", gap: 3 }}>
                                        <Text style={{ fontSize: 12, fontWeight: "bold" }}>Margarita birthing center</Text>
                                        <View style={{ flexDirection: "row", gap: 5 }}>
                                            <Ionicons size={15} name="star-half" color={"black"} />
                                            <Text style={{ fontSize: 12, fontWeight: "bold" }}>4.5</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: COLORS.white,
        alignItems: "center",
    },
    safeArea: {
        width: "100%",
        height: "100%",
        backgroundColor: "#0082a6",
        alignItems: "flex-start",
        padding: 10,
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
        color: "white",
    },
    subtitle: {
        fontSize: 15,
        textAlign: "center",
        color: "white",
    },
});

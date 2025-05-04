import { COLORS, SERVICE_ICONS } from "@/components/constants";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, View, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { ActivityIndicator, Button, Divider, Modal, Text } from "react-native-paper";

interface AppointmentModalProps {
    id: string | null;
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    appointmentDate: string;
}

type Service = {
    id: string;
    birthCenterId: string;
    description: string;
    price?: number;
    duration?: string;
    serviceId: number;
    name: string;
    birthCenter: {
        name: string;
        address: string;
        pictureUrl: string;
    };
};

const AppointmentModal: React.FC<AppointmentModalProps> = ({ id, visible, setVisible, appointmentDate }) => {
    const { user } = useAuth();
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(false);
    const [inserting, setInserting] = useState(false);

    const hideModal = () => setVisible(false);

    useEffect(() => {
        if (id) {
            fetchService();
        }
    }, [id]);

    const fetchService = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("services")
            .select(
                `
                    id,
                    birth_center_id,
                    description,
                    price,
                    duration,
                    service_id,
                    services_list (name),
                    birth_centers (name, address, picture_url)
                    `
            )
            .eq("id", id)
            .single();

        if (error) throw error;

        const serviceData = data as any;

        setService({
            id: serviceData.id,
            birthCenterId: serviceData.birth_center_id,
            description: serviceData.description,
            price: serviceData.price,
            duration: serviceData.duration,
            serviceId: serviceData.service_id,
            name: serviceData.services_list.name,
            birthCenter: {
                name: serviceData.birth_centers.name,
                address: serviceData.birth_centers.address,
                pictureUrl: serviceData.birth_centers.picture_url,
            },
        });

        setLoading(false);
    };

    const handleScheduleClick = async () => {
        setInserting(true);
        const { data, error } = await supabase.from("appointments").insert([
            {
                patient_id: user?.id,
                service_id: service?.id,
                birth_center_id: service?.birthCenterId,
                appointment_date: appointmentDate,
                status: "pending",
            },
        ]);

        if (error) {
            console.error("Insert error:", error.message);
        } else {
            alert("Appointment scheduled successfully!");
            setInserting(false);
            router.replace("/(tabs)/appointment");
        }
    };

    return (
        <Modal style={styles.modal} visible={visible} onDismiss={hideModal} contentContainerStyle={styles.container}>
            {loading ? (
                <ActivityIndicator style={{ flex: 1 }} color={COLORS.darkBlue} />
            ) : (
                <View>
                    <Ionicons size={20} name="close" color={"grey"} onPress={hideModal} style={{ alignSelf: "flex-end", padding: 10 }} />
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-evenly",
                            alignItems: "center",
                        }}
                    >
                        <View style={styles.imageContainer}>
                            <Image
                                style={styles.image}
                                source={service?.birthCenter.pictureUrl || require("@/assets/images/service-icons/health-clinic.png")}
                            />
                        </View>
                        <Text style={{ fontWeight: "bold", maxWidth: 150, textAlign: "center" }}>{service?.birthCenter.name || "Name"}</Text>
                    </View>
                    <Divider style={{ marginVertical: 20 }}></Divider>
                    <View>
                        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                            Service: <Text>{service?.name ? service.name : "Service Name"}</Text>
                        </Text>
                        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                            Price: <Text>{service?.price ? `₱${service.price.toLocaleString()}` : "Free"}</Text>
                        </Text>
                        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                            Appointment Date:{" "}
                            <Text>
                                {appointmentDate
                                    ? new Date(appointmentDate).toLocaleDateString("en-US", {
                                          month: "long",
                                          day: "numeric",
                                          year: "numeric",
                                      })
                                    : ""}
                            </Text>
                        </Text>
                        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                            Appointment Time:{" "}
                            <Text>
                                {appointmentDate
                                    ? new Date(appointmentDate).toLocaleTimeString("en-US", {
                                          hour: "numeric",
                                          minute: "2-digit",
                                          hour12: true,
                                      })
                                    : ""}
                            </Text>
                        </Text>
                    </View>
                    <Divider style={{ marginVertical: 10 }}></Divider>
                    <View>
                        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Description</Text>
                        <ScrollView style={{ height: 150, padding: 10, backgroundColor: COLORS.grey, borderRadius: 5 }}>
                            <Text style={{ marginBottom: 10, paddingBottom: 10 }}>{service?.description}</Text>
                        </ScrollView>
                    </View>
                    <View
                        style={{
                            alignItems: "center",
                            marginTop: 20,
                        }}
                    >
                        <Button
                            mode="contained"
                            buttonColor={COLORS.lightBlue}
                            textColor="black"
                            onPress={() => handleScheduleClick()}
                            loading={inserting}
                            contentStyle={{ borderRadius: 5 }}
                        >
                            Schedule Appointment
                        </Button>
                    </View>
                </View>
            )}
        </Modal>
    );
};

export default AppointmentModal;

const styles = StyleSheet.create({
    modal: {
        padding: 20,
    },
    container: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        minHeight: 500,
    },
    image: {
        width: 50,
        height: 50,
    },
    imageContainer: {
        backgroundColor: COLORS.lightBlue,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        width: 70,
        height: 70,
    },
});

import { COLORS, SERVICE_ICONS } from "@/components/constants";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, View, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { ActivityIndicator, Button, Divider, Modal, Text } from "react-native-paper";

interface ServiceModalProps {
    id: string | null;
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

type Service = {
    id: string;
    birthCenterId: string;
    description: string;
    price?: number;
    duration?: string;
    serviceId: number;
    name: string;
};

const ServiceModal: React.FC<ServiceModalProps> = ({ id, visible, setVisible }) => {
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(false);

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
                services_list (name)
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
        });

        setLoading(false);
    };

    const handleScheduleClick = () => {
        router.navigate({
            pathname: "/home/schedule-appointment",
            params: { serviceId: service?.id },
        });
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
                        <View style={styles.button}>
                            <Image style={styles.image} source={SERVICE_ICONS[service?.serviceId || 1]} />
                        </View>
                        <Text style={{ fontWeight: "bold", maxWidth: 150, textAlign: "center" }}>{service?.name || "Service Name"}</Text>
                    </View>
                    <Divider style={{ marginVertical: 20 }}></Divider>
                    <View>
                        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                            Price: <Text>{service?.price ? `₱${service.price.toLocaleString()}` : "Free"}</Text>
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

export default ServiceModal;

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
    button: {
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

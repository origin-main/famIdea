import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

type SessionExpiredModalProps = {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const SessionExpiredModal = ({ visible, setVisible }: SessionExpiredModalProps) => {
    const { setUser } = useAuth();
    const [secondsLeft, setSecondsLeft] = useState(5);

    useEffect(() => {
        if (!visible) return;

        setSecondsLeft(5);

        const countdownInterval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    handleLogout();
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, [visible]);

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            setUser(null);
            router.replace("/login");
        } catch (err: any) {
            console.error("Unexpected error during logout:", err.message);
        } finally {
            setVisible(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Session Expired</Text>
                    <Text style={styles.modalText}>Logging out in {secondsLeft} seconds...</Text>
                    <ActivityIndicator size="large" style={{ marginTop: 20 }} />

                    <Button mode="contained" style={styles.logoutButton} onPress={handleLogout}>
                        Log out now
                    </Button>
                </View>
            </View>
        </Modal>
    );
};

export default SessionExpiredModal;

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 30,
        borderRadius: 20,
        width: "80%",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
    },
    modalText: {
        fontSize: 16,
        textAlign: "center",
    },
    logoutButton: {
        marginTop: 20,
    },
    logoutButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
});

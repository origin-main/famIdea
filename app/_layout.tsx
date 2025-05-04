import { Stack } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { Provider } from "react-native-paper";
import { AuthProvider } from "@/context/AuthContext";
import { AlertProvider } from "@/context/AlertContext";

export default function RootLayout() {
    useEffect(() => {
        async function prepare() {
            try {
                await SplashScreen.preventAutoHideAsync(); // Prevent auto hiding until the app is ready
            } catch (e) {
                console.warn(e);
            } finally {
                // Simulate loading, then hide splash
                setTimeout(async () => {
                    await SplashScreen.hideAsync();
                }, 5000);
            }
        }

        prepare();
    }, []);

    return (
        <AuthProvider>
            <AlertProvider>
                <Provider>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                        }}
                    />
                </Provider>
            </AlertProvider>
        </AuthProvider>
    );
}

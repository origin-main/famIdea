import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function HomeLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="search-page" options={{ headerShown: false }} />
            <Stack.Screen name="recommended" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
        </Stack>
    );
}

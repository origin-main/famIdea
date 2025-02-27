import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function NotificationsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="search-page" options={{ headerShown: false }} />
      <Stack.Screen name="clinic-page" options={{ headerShown: false }} />
      <Stack.Screen
        name="schedule-appointment"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

import { Stack } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { Provider } from "react-native-paper";

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
    <Provider>
      <Stack
        screenOptions={{
          headerShown: false, // This hides the header for all screens
        }}
      />
    </Provider>
  );
}

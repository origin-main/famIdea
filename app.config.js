export default {
    expo: {
        name: "Famidea",
        slug: "famidea-app",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/logo.png",
        scheme: "myapp",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        ios: {
            supportsTablet: true,
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/logo.png",
                backgroundColor: "#ffffff",
            },
            package: "com.famidea.app",
            googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./assets/images/favicon.png",
        },
        plugins: [
            "expo-router",
            [
                "expo-splash-screen",
                {
                    image: "./assets/images/logo.png",
                    imageWidth: 200,
                    resizeMode: "contain",
                    backgroundColor: "#ffffff",
                },
            ],
            [
                "expo-location",
                {
                    locationAlwaysAndWhenInUsePermission: "Allow Famidea to use your location.",
                },
            ],
        ],
        experiments: {
            typedRoutes: true,
        },
        extra: {
            router: {
                origin: false,
            },
            eas: {
                projectId: "8ab6d125-745e-4922-b7bc-e88d60c2ce97",
            },
        },
    },
};

import React from 'react';
import "./global.css";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/User/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import MechanicProfile from './src/screens/MechanicProfile';
import AdminTabs from './src/navigation/AdminTabs';
import UserTabs from './src/navigation/UserTabs';
import MechanicTabs from './src/navigation/MechanicTabs';
import MechanicDashboard from './src/screens/MechanicDashboard';
import UserProfile from './src/User/UserProfile';
import LoginPage from './src/Auth/LoginScreen';
import SignupPage from './src/Auth/SignupScreen';
import MechanicSignupPage from './src/Auth/MechanicSignupPage';
import AdminDashboard from './src/admin/AdminDashboard'; // Import the AdminDashboard component
import SplashScreen from "./src/screens/SplashScreen"; // Import the new SplashScreen component
import SettingsScreen from './src/User/SettingsScreen';
import MechanicServicesScreen from './src/Mechanic/MechanicServicesScreen';
import MechanicSettings from './src/Mechanic/MechanicSettings';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen';
import ContactSupportScreen from './src/screens/ContactSupportScreen';
import HelpCenterScreen from './src/screens/HelpCenterScreen';
import MechanicHomeScreen from './src/Mechanic/MechanicHomeScreen';
import JobsAdmin from './src/admin/JobsAdmin';
import UserMapScreen from './src/User/UserMapScreen';
import MechanicMapScreen from './src/Mechanic/MechanicMapScreen';
import { UserProvider } from './src/contexts/UserContext';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginPage} />
          <Stack.Screen name="Signup" component={SignupPage} />
          <Stack.Screen name="MechanicSignup" component={MechanicSignupPage} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
          <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
          <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="UserSettings" component={SettingsScreen} />
          <Stack.Screen name="MechanicHome" component={MechanicHomeScreen} options={{ title: "Mechanic Home" }} />
          <Stack.Screen name="Maps" component={MapScreen} options={{ title:  "Booking Map" }} />
          <Stack.Screen name="MechanicProfile" component={MechanicProfile} />
          <Stack.Screen name="AdminTabs" component={AdminTabs} />
          <Stack.Screen name="UserTabs" component={UserTabs} />
          <Stack.Screen name="MechanicMapScreen" component={MechanicMapScreen} options={{ title: "Select Location" }} />
          <Stack.Screen name="UserMapScreen" component={UserMapScreen} options={{ title: "Select Location" }} />
          <Stack.Screen name="MechanicTabs" component={MechanicTabs} />
          <Stack.Screen name="MechanicDashboard" component={MechanicDashboard} />
          <Stack.Screen name="MechanicServices" component={MechanicServicesScreen} />
          <Stack.Screen name="MechanicSettings" component={MechanicSettings} />
          <Stack.Screen name="UserProfile" component={UserProfile} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen name="JobsAdmin" component={JobsAdmin} />

        </Stack.Navigator>
      </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  );
}
// File: src/screens/MechanicSettingsScreen.js
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, ScrollView, Switch } from "react-native";
import { Bell, Shield, CircleHelp as HelpCircle, LogOut, Moon, Globe, CreditCard, Star, MessageSquare, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

export default function MechanicSettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  const navigation = useNavigation();

  const SettingItem = ({ icon: Icon, title, subtitle, onPress, showArrow = true, rightComponent }) => (
    <TouchableOpacity className="flex-row items-center justify-between py-3" onPress={onPress}>
      <View className="flex-row items-center flex-1">
        <Icon size={20} color="#333333" />
        <View className="ml-3 flex-1">
          <Text className="text-base text-black font-medium">{title}</Text>
          {subtitle && <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (showArrow && <ChevronRight size={16} color="#666666" />)}
    </TouchableOpacity>
  );

  const handleSignOut = () => {
    // Clear session / tokens here if you have auth
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-15 pb-5 bg-black">
        <Text className="text-2xl font-bold text-white">Mechanic Settings</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Account Section */}
        <View className="px-5 py-4 border-b border-gray-100">
          <Text className="text-base font-semibold text-black mb-4 uppercase tracking-wide">Account</Text>

          <SettingItem
            icon={Bell}
            title="Notifications"
            subtitle="Push notifications and alerts"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#e0e0e0", true: "#333333" }}
                thumbColor={notificationsEnabled ? "#ffffff" : "#f4f3f4"}
              />
            }
            showArrow={false}
          />

          <SettingItem
            icon={Shield}
            title="Privacy & Security"
            subtitle="Manage your privacy settings"
            onPress={() => navigation.navigate("PrivacyPolicy")}
          />

          <SettingItem
            icon={CreditCard}
            title="Payment Methods"
            subtitle="Manage cards and payment options"
            onPress={() => setShowPaymentMethods(!showPaymentMethods)}
          />

          {showPaymentMethods && (
            <View className="ml-10 mt-2">
              <TouchableOpacity className="py-2">
                <Text className="text-gray-700">M-Pesa</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* App Preferences */}
        <View className="px-5 py-4 border-b border-gray-100">
          <Text className="text-base font-semibold text-black mb-4 uppercase tracking-wide">App Preferences</Text>

          <SettingItem
            icon={Moon}
            title="Dark Mode"
            subtitle="Switch to dark theme"
            rightComponent={
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: "#e0e0e0", true: "#333333" }}
                thumbColor={darkModeEnabled ? "#ffffff" : "#f4f3f4"}
              />
            }
            showArrow={false}
          />

          <SettingItem icon={Globe} title="Language" subtitle="English" />
        </View>

        {/* Support Section */}
        <View className="px-5 py-4 border-b border-gray-100">
          <Text className="text-base font-semibold text-black mb-4 uppercase tracking-wide">Support</Text>

          <SettingItem
            icon={HelpCircle}
            title="Help Center"
            subtitle="FAQs and support articles"
            onPress={() => navigation.navigate("HelpCenter")}
          />

          <SettingItem
            icon={MessageSquare}
            title="Contact Support"
            subtitle="Get help from our team"
            onPress={() => navigation.navigate("ContactSupport")}
          />

          <SettingItem
            icon={Star}
            title="Rate the App"
            subtitle="Share your feedback"
          />
        </View>

        {/* Legal Section */}
        <View className="px-5 py-4 border-b border-gray-100">
          <Text className="text-base font-semibold text-black mb-4 uppercase tracking-wide">Legal</Text>

          <SettingItem
            icon={Shield}
            title="Terms of Service"
            subtitle="Read our terms and conditions"
            onPress={() => navigation.navigate("TermsOfService")}
          />

          <SettingItem
            icon={Shield}
            title="Privacy Policy"
            subtitle="How we handle your data"
            onPress={() => navigation.navigate("PrivacyPolicy")}
          />
        </View>

        {/* Account Actions */}
        <View className="px-5 py-4">
          <TouchableOpacity
            className="flex-row items-center justify-center bg-black p-4 rounded-xl mt-2"
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#ffffff" />
            <Text className="text-white text-base font-semibold ml-2">Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="items-center p-5">
          <Text className="text-sm text-gray-500">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


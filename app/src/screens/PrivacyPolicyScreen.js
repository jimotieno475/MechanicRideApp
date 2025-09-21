// File: src/Mechanic/PrivacyPolicyScreen.js
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView } from "react-native";

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-14 pb-5 bg-black">
        <Text className="text-2xl font-bold text-white">Privacy Policy</Text>
        <Text className="text-gray-300 mt-1">Last updated: September 2025</Text>
      </View>

      <ScrollView className="flex-1 px-5 py-4">
        <Text className="text-base text-gray-700 mb-4">
          This Privacy Policy explains how we collect, use, and protect your
          information when you use our mechanic services app. By using our app,
          you agree to the terms of this Privacy Policy.
        </Text>

        {/* Section 1 */}
        <Text className="text-lg font-semibold text-black mb-2">
          1. Information We Collect
        </Text>
        <Text className="text-base text-gray-600 mb-4">
          We may collect personal information such as your name, phone number,
          email address, and location. We also collect non-personal information
          like device type, app usage data, and technical information to improve
          our services.
        </Text>

        {/* Section 2 */}
        <Text className="text-lg font-semibold text-black mb-2">
          2. How We Use Your Information
        </Text>
        <Text className="text-base text-gray-600 mb-4">
          We use your information to:
          {"\n"}• Provide and improve our services{"\n"}• Match you with
          available mechanics{"\n"}• Process payments securely{"\n"}• Send
          important updates and notifications{"\n"}• Ensure safety and prevent
          fraud
        </Text>

        {/* Section 3 */}
        <Text className="text-lg font-semibold text-black mb-2">
          3. Sharing of Information
        </Text>
        <Text className="text-base text-gray-600 mb-4">
          We do not sell your personal information. We may share limited data
          with trusted third-party partners, such as payment providers and
          mapping services, to deliver the best experience.
        </Text>

        {/* Section 4 */}
        <Text className="text-lg font-semibold text-black mb-2">
          4. Data Security
        </Text>
        <Text className="text-base text-gray-600 mb-4">
          We implement industry-standard security measures to protect your
          information. However, no system is completely secure, and we cannot
          guarantee 100% protection.
        </Text>

        {/* Section 5 */}
        <Text className="text-lg font-semibold text-black mb-2">
          5. Your Choices
        </Text>
        <Text className="text-base text-gray-600 mb-4">
          You may update or delete your personal information at any time from
          your profile settings. You can also choose to disable notifications or
          request account deletion.
        </Text>

        {/* Section 6 */}
        <Text className="text-lg font-semibold text-black mb-2">
          6. Contact Us
        </Text>
        <Text className="text-base text-gray-600 mb-4">
          If you have any questions about this Privacy Policy, please contact
          our support team at:{"\n"}
          <Text className="text-blue-600">
            support@mechanicapp.com
          </Text>
        </Text>

        <Text className="text-sm text-gray-500 mt-6 mb-10">
          By continuing to use our app, you confirm that you have read and
          understood this Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

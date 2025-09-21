// File: src/Mechanic/TermsOfServiceScreen.js
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView } from "react-native";

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-14 pb-5 bg-black">
        <Text className="text-2xl font-bold text-white">Terms of Service</Text>
        <Text className="text-gray-300 mt-1">Effective Date: September 2025</Text>
      </View>

      <ScrollView className="flex-1 px-5 py-4">
        <Text className="text-base text-gray-700 mb-4">
          These Terms of Service (“Terms”) govern your use of our mechanic service
          application (“the App”) in Kenya. By using the App, you agree to these Terms.
          If you do not agree, please discontinue use.
        </Text>

        {/* Section 1 */}
        <Text className="text-lg font-semibold text-black mb-2">
          1. Eligibility
        </Text>
        <Text className="text-base text-gray-600 mb-4">
          You must be at least 18 years old to use this App. By creating an account,
          you confirm that the information you provide is accurate and truthful.
        </Text>

        {/* Section 2 */}
        <Text className="text-lg font-semibold text-black mb-2">
          2. Services Provided
        </Text>
        <Text className="text-base text-gray-600 mb-4">
          The App connects users with qualified mechanics for on-demand repair and
          maintenance services. We act as a platform only and are not directly
          responsible for the quality of services delivered by mechanics.
        </Text>

        {/* Section 3 */}
        <Text className="text-lg font-semibold text-black mb-2">
          3. User Responsibilities
        </Text>
        <Text className="text-base text-gray-600 mb-4">
          • Provide accurate vehicle and location details{"\n"}
          • Treat mechanics with respect and fairness{"\n"}
          • Ensure safe working conditions for mechanics{"\n"}
          • Pay for services in full upon completion
        </Text>

        {/* Section 4 */}
        <Text className="text-lg font-semibold text-black mb-2">
          4. Mechanic Responsibilities
        </Text>
        <Text className="text-base text-gray-600 mb-4">
          Mechanics must provide professional and honest services, comply with
          Kenyan consumer protection laws, and ensure safety while working on
          vehicles. Fraudulent activity will result in account suspension.
        </Text>

        {/* Section 5 */}
        <Text className="text-lg font-semibold text-black mb-2">
          5. Payments
        </Text>
        <Text className="text-base text-gray-600 mb-4">
          Payments may be made via M-Pesa, debit/credit card, or other supported
          methods. All transactions are processed securely. The App may charge a
          small service fee for bookings.
        </Text>

        {/* Section 6 */}
        <Text className="text-lg font-semibold text-black mb-2">
          6. Liability
        </Text>
        <Text className="text-base text-gray-600 mb-4">
          We are not liable for damages, delays, or disputes arising between
          mechanics and users. However, we may step in to mediate conflicts where
          possible.
        </Text>

        {/* Section 7 */}
        <Text className="text-lg font-semibold text-black mb-2">
          7. Termination
        </Text>
        <Text className="text-base text-gray-600 mb-4">
          We may suspend or terminate your account if you violate these Terms,
          misuse the App, or engage in unlawful behavior.
        </Text>

        {/* Section 8 */}
        <Text className="text-lg font-semibold text-black mb-2">
          8. Governing Law
        </Text>
        <Text className="text-base text-gray-600 mb-4">
          These Terms are governed by the laws of Kenya. Any disputes shall be
          resolved in the courts of Kenya.
        </Text>

        {/* Section 9 */}
        <Text className="text-lg font-semibold text-black mb-2">
          9. Contact Us
        </Text>
        <Text className="text-base text-gray-600 mb-10">
          For questions regarding these Terms, contact us at:{"\n"}
          <Text className="text-blue-600">support@mechanicapp.com</Text>
        </Text>

        <Text className="text-sm text-gray-500 mb-10">
          By continuing to use this App, you agree to abide by these Terms of
          Service.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

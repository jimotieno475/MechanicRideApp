// File: src/Mechanic/HelpCenterScreen.js
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";

export default function HelpCenterScreen({ navigation }) {
  const faqs = [
    {
      question: "How do I book a mechanic?",
      answer: "Go to the 'Find Mechanic' section, choose your preferred mechanic, and confirm booking.",
    },
    {
      question: "How do payments work?",
      answer: "Payments can be made securely via M-Pesa or card directly through the app.",
    },
    {
      question: "What if the mechanic doesn’t show up?",
      answer: "You can report the issue in the 'Contact Support' section, and we’ll assist you.",
    },
    {
      question: "Can I cancel a booking?",
      answer: "Yes, bookings can be cancelled before the mechanic has confirmed the job.",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-14 pb-5 bg-black">
        <Text className="text-2xl font-bold text-white">Help Center</Text>
        <Text className="text-gray-300 mt-1">Frequently Asked Questions</Text>
      </View>

      <ScrollView className="flex-1 px-5 py-4">
        {faqs.map((item, index) => (
          <View
            key={index}
            className="mb-4 border-b border-gray-200 pb-4"
          >
            <Text className="text-lg font-semibold text-black mb-1">{item.question}</Text>
            <Text className="text-gray-600">{item.answer}</Text>
          </View>
        ))}

        {/* Link to Contact Support */}
        <TouchableOpacity
          onPress={() => navigation.navigate("ContactSupport")}
          className="flex-row items-center justify-between py-4 px-4 bg-gray-100 rounded-lg mt-6"
        >
          <Text className="text-black font-semibold">Still need help? Contact Support</Text>
          <ChevronRight size={18} color="#333" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

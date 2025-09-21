// File: src/screens/MechanicDashboard.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function MechanicDashboard({ navigation }) {
  const [isAvailable, setIsAvailable] = useState(true);

  // Example booking (this would normally come from backend)
  const currentBooking = {
    id: 1,
    user: "John Doe",
    issue: "Flat Tire",
    latitude: -1.295,
    longitude: 36.822,
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 pt-12 pb-4 border-b border-gray-700">
        <Text className="text-white text-2xl font-bold">
          Mechanic Dashboard
        </Text>
        <Text className="text-gray-400 mt-1">
          {isAvailable ? "You are available for jobs" : "You are offline"}
        </Text>

        <TouchableOpacity
          className={`mt-4 p-3 rounded-xl ${
            isAvailable ? "bg-white" : "bg-gray-800"
          }`}
          onPress={() => setIsAvailable(!isAvailable)}
        >
          <Text
            className={`text-center font-semibold ${
              isAvailable ? "text-black" : "text-white"
            }`}
          >
            {isAvailable ? "Go Offline" : "Go Online"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Current Booking */}
      <ScrollView className="flex-1 px-4">
        {currentBooking ? (
          <View className="mt-6 bg-gray-900 rounded-2xl p-5">
            <Text className="text-white text-xl font-bold mb-2">
              Current Booking
            </Text>
            <Text className="text-gray-300 mb-1">
              <Text className="font-semibold text-white">Customer:</Text>{" "}
              {currentBooking.user}
            </Text>
            <Text className="text-gray-300 mb-4">
              <Text className="font-semibold text-white">Issue:</Text>{" "}
              {currentBooking.issue}
            </Text>

            {/* Map */}
            <View className="h-56 w-full rounded-xl overflow-hidden mb-4">
              <MapView
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: currentBooking.latitude,
                  longitude: currentBooking.longitude,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: currentBooking.latitude,
                    longitude: currentBooking.longitude,
                  }}
                  title="Booking Location"
                  description={currentBooking.issue}
                  pinColor="red"
                />
              </MapView>
            </View>

            {/* Actions */}
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 bg-white p-3 rounded-xl mr-2"
                onPress={() => navigation.navigate("MapScreen")}
              >
                <Text className="text-center text-black font-semibold">
                  Open Map
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-gray-700 p-3 rounded-xl ml-2">
                <Text className="text-center text-white font-semibold">
                  Mark Completed
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text className="text-gray-400 mt-10 text-center">
            No active bookings
          </Text>
        )}
      </ScrollView>
    </View>
  );
}


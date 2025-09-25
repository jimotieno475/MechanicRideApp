// File: src/Mechanic/MechanicMapScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../config";

const GOOGLE_MAPS_APIKEY = "AIzaSyCgwyuVt5ITQ5zNHcPQCPPS_gs9VXNi3CY" // <-- Replace with your API key

export default function MechanicMapScreen({ route }) {
  const navigation = useNavigation();
  const { task } = route.params;

  const [region, setRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    (async () => {
      // Use task coordinates if available
      const initialRegion = {
        latitude: task.latitude || task.customer?.latitude || 0,
        longitude: task.longitude || task.customer?.longitude || 0,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(initialRegion);

      // Get mechanic current location if needed
      if (!task.latitude || !task.longitude) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Allow location access to view map.");
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          ...initialRegion,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }

      // Set user location marker
      if (task.customer?.latitude && task.customer?.longitude) {
        setUserLocation({
          latitude: task.customer.latitude,
          longitude: task.customer.longitude,
        });
      }
    })();
  }, [task]);

  const acceptBooking = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bookings/${task.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "Accepted" }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setBookingMessage("✅ Booking accepted successfully!");
      } else {
        Alert.alert("Error", data.error || "Could not accept booking");
      }
    } catch (err) {
      console.error("Accept booking error:", err);
      setLoading(false);
      Alert.alert("Error", "Could not reach server");
    }
  };

  return (
    <View className="flex-1 bg-black">
      {region && (
        <MapView
          provider={PROVIDER_GOOGLE}
           style={{ flex: 1 }}
          region={region}
          showsUserLocation={true}
        >
          {/* User location marker */}
          {userLocation && (
            <Marker
              coordinate={userLocation}
              title={task.customer?.name || "Customer"}
              description={`Requested service: ${task.type}`}
              pinColor="blue"
            />
          )}

          {/* Mechanic location marker */}
          {task.latitude && task.longitude && (
            <Marker
              coordinate={{ latitude: task.latitude, longitude: task.longitude }}
              title={task.mechanic?.name || "Mechanic"}
              description={task.mechanic?.garage_name || "Garage"}
              pinColor="red"
            />
          )}

          {/* Directions from mechanic to user */}
          {userLocation && region && (
            <MapViewDirections
              origin={region}
              destination={userLocation}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={5}
              strokeColor="blue"
            />
          )}
        </MapView>
      )}

      {/* Footer */}
      <View className="absolute left-4 right-4 bottom-6 bg-gray-900 p-4 rounded-xl shadow-lg">
        <Text className="text-white text-lg font-bold">Service: {task.type}</Text>
        <Text className="text-gray-400">
          Customer: {task.customer?.name || "N/A"}
        </Text>
        <Text className="text-gray-400">
          Phone: {task.customer?.phone || "N/A"}
        </Text>
        <Text className="text-gray-400">Location: {task.location || "N/A"}</Text>

        {task.status === "Pending" && (
          <TouchableOpacity
            className={`mt-3 p-3 rounded-xl ${
              loading ? "bg-gray-600" : "bg-green-600"
            }`}
            onPress={acceptBooking}
            disabled={loading}
          >
            <Text className="text-white font-bold text-center">
              {loading ? "Accepting..." : "Accept Booking"}
            </Text>
          </TouchableOpacity>
        )}

        {bookingMessage ? (
          <Text className="text-yellow-400 mt-2 text-center">{bookingMessage}</Text>
        ) : null}
      </View>
    </View>
  );
}



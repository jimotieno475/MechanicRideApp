// File: src/Maps/UserMapScreen.js
import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { useNavigation, useRoute } from "@react-navigation/native";
import { API_URL } from "../config";
import { useUser } from "../contexts/UserContext";

const GOOGLE_MAPS_APIKEY = "AIzaSyCgwyuVt5ITQ5zNHcPQCPPS_gs9VXNi3CY";

export default function UserMapScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { service } = route.params;
  const { user } = useUser();

  const [region, setRegion] = useState(null);
  const [mechanic, setMechanic] = useState(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(false);
  const bookingTimeoutRef = useRef(null);

  // Get user's current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Allow location access to see map.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const userRegion = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(userRegion);

      // If service has coordinates, use as initial destination
      if (service?.latitude != null && service?.longitude != null) {
        setDestination({ latitude: service.latitude, longitude: service.longitude });
      }
    })();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (bookingTimeoutRef.current) clearTimeout(bookingTimeoutRef.current);
    };
  }, []);

  // Book service
  const handleBookService = async () => {
    if (!region) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: user.id,
          service_id: service.id,
          latitude: region.latitude,
          longitude: region.longitude,
          location: service.location || "User's location",
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.booking?.mechanic) {
        const assignedMechanic = data.booking.mechanic;
        setMechanic(assignedMechanic);

        if (assignedMechanic.latitude != null && assignedMechanic.longitude != null) {
          setDestination({
            latitude: assignedMechanic.latitude,
            longitude: assignedMechanic.longitude,
          });
        }

        setBookingMessage(`✅ Booking sent to ${assignedMechanic.name}. Waiting for response...`);

        // Auto-remove after 10 minutes if not accepted
        if (bookingTimeoutRef.current) clearTimeout(bookingTimeoutRef.current);
        bookingTimeoutRef.current = setTimeout(() => {
          setBookingMessage("");
          setMechanic(null);
          setDestination(null);
        }, 10 * 60 * 1000); // 10 minutes
      } else {
        Alert.alert("Booking Failed", data.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setLoading(false);
      Alert.alert("Error", "Could not reach server");
    }
  };

  // Update message if mechanic accepts (poll backend or via websocket)
  // For simplicity, we assume a prop or external update will change mechanic.status
  useEffect(() => {
    if (mechanic?.status === "Accepted") {
      setBookingMessage(`✅ ${mechanic.name} has accepted your booking!`);
      if (bookingTimeoutRef.current) clearTimeout(bookingTimeoutRef.current);
    }
  }, [mechanic?.status]);

  return (
    <SafeAreaView className="flex-1 bg-black">
      {region && (
        <MapView
          provider={PROVIDER_GOOGLE}
           style={{ flex: 1 }}
          region={region}
          showsUserLocation={true}
        >
          {/* Assigned mechanic marker */}
          {mechanic?.latitude != null && mechanic?.longitude != null && (
            <Marker
              coordinate={{ latitude: mechanic.latitude, longitude: mechanic.longitude }}
              title={mechanic.name}
              description={mechanic.garage_location || "Garage"}
              pinColor="red"
            />
          )}

          {/* Draw directions from user to mechanic */}
          {destination?.latitude != null && destination?.longitude != null && region && (
            <MapViewDirections
              origin={{ latitude: region.latitude, longitude: region.longitude }}
              destination={destination}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={5}
              strokeColor="blue"
            />
          )}
        </MapView>
      )}

      {/* Booking Footer */}
      <View className="absolute left-4 right-4 bottom-6 bg-gray-900 p-4 rounded-xl shadow-lg">
        <Text className="text-white text-lg font-bold">{service.name}</Text>
        {service.description && <Text className="text-gray-400 mb-2">{service.description}</Text>}

        {mechanic ? (
          <View>
            <Text className="text-white mb-1">Assigned Mechanic: {mechanic.name}</Text>
            <Text className="text-white mb-1">Phone: {mechanic.phone || "N/A"}</Text>
            <Text className="text-white mb-1">Garage: {mechanic.garage_name || "N/A"}</Text>
            {mechanic.services_offered?.length > 0 && (
              <Text className="text-white mb-1">
                Services: {mechanic.services_offered.join(", ")}
              </Text>
            )}
            <Text className="text-yellow-400">{bookingMessage}</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleBookService}
            disabled={loading}
            className={`p-3 rounded-xl ${loading ? "bg-gray-600" : "bg-green-600"}`}
          >
            <Text className="text-white text-center text-lg font-bold">
              {loading ? "Booking..." : "Book Service"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

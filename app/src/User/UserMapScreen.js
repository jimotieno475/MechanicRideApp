import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { useNavigation, useRoute } from "@react-navigation/native";
import { API_URL } from "../config";
import { useUser } from "../contexts/UserContext";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for the arrow icon

const GOOGLE_MAPS_APIKEY = "AIzaSyCgwyuVt5ITQ5zNHcPQCPPS_gs9VXNi3CY";

export default function UserMapScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { booking, service } = route.params;
  const { user } = useUser();

  const [region, setRegion] = useState(null);
  const [assignedMechanic, setAssignedMechanic] = useState(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(false);
  const bookingTimeoutRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const mapRef = useRef(null); // Ref to manipulate the map

  // Determine if the screen is for a new booking or viewing an existing one
  const isViewingExistingBooking = !!booking;
  const currentService = isViewingExistingBooking ? booking?.service : service;

  // Get user's current location and initialize map state
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

      if (isViewingExistingBooking) {
        setAssignedMechanic(booking.mechanic);
        if (booking.mechanic?.latitude != null && booking.mechanic?.longitude != null) {
          setDestination({ latitude: booking.mechanic.latitude, longitude: booking.mechanic.longitude });
        }
        setBookingMessage(getBookingMessage(booking.status));
      } else if (currentService?.latitude != null && currentService?.longitude != null) {
        // This case is for when HomeScreen passes a service with coordinates
        setDestination({ latitude: currentService.latitude, longitude: currentService.longitude });
      }
    })();
  }, [isViewingExistingBooking, booking, currentService]);

  // Cleanup timeout and polling on unmount
  useEffect(() => {
    return () => {
      if (bookingTimeoutRef.current) clearTimeout(bookingTimeoutRef.current);
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  // Function to get a user-friendly message based on booking status
  const getBookingMessage = (status) => {
    switch (status) {
      case 'Pending':
        return `✅ Booking sent to ${assignedMechanic?.name || 'the mechanic'}. Waiting for response...`;
      case 'Accepted':
        return `✅ ${assignedMechanic?.name || 'The mechanic'} has accepted your booking!`;
      case 'Rejected':
        return `❌ Your booking was rejected by ${assignedMechanic?.name || 'the mechanic'}.`;
      default:
        return '';
    }
  };

  // Poll for booking status updates if viewing an existing booking
  useEffect(() => {
    if (isViewingExistingBooking && booking.status === 'Pending') {
      const fetchBookingStatus = async () => {
        try {
          // You should ideally have a route for a single booking: /bookings/{id}
          const res = await fetch(`${API_URL}/bookings/${booking.id}`); 
          if (res.ok) {
            const latestBooking = await res.json();

            if (latestBooking && latestBooking.status !== booking.status) {
              setAssignedMechanic(latestBooking.mechanic); // Update mechanic if needed
              setBookingMessage(getBookingMessage(latestBooking.status));
              
              if (latestBooking.status !== 'Pending') {
                clearInterval(pollingIntervalRef.current);
              }
            }
          }
        } catch (error) {
          console.error("Failed to poll for booking status:", error);
        }
      };
      
      pollingIntervalRef.current = setInterval(fetchBookingStatus, 5000); // Poll every 5 seconds
      
      return () => clearInterval(pollingIntervalRef.current);
    }
  }, [isViewingExistingBooking, booking]);

  // Handle new service booking request from the HomeScreen or ServicesScreen
  const handleBookService = async () => {
    if (!region) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: user.id,
          service_id: currentService.id,
          latitude: region.latitude,
          longitude: region.longitude,
          location: currentService.location || "User's location",
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.booking?.mechanic) {
        setAssignedMechanic(data.booking.mechanic);
        if (data.booking.mechanic.latitude != null && data.booking.mechanic.longitude != null) {
          setDestination({
            latitude: data.booking.mechanic.latitude,
            longitude: data.booking.mechanic.longitude,
          });
        }
        setBookingMessage(getBookingMessage(data.booking.status));
        
        // Start polling for status updates on the newly created booking
        // You'll need to pass the *new* booking ID to the polling logic,
        // which typically involves navigating to a dedicated screen or updating the parent state.
        // For simplicity here, we'll rely on the next screen logic or a fresh re-render.

      } else {
        Alert.alert("Booking Failed", data.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setLoading(false);
      Alert.alert("Error", "Could not reach server");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {region && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          region={region}
          showsUserLocation={true}
        >
          {assignedMechanic?.latitude != null && assignedMechanic?.longitude != null && (
            <Marker
              coordinate={{ latitude: assignedMechanic.latitude, longitude: assignedMechanic.longitude }}
              title={assignedMechanic.name}
              description={assignedMechanic.garage_location || "Garage"}
              // Using a custom view for the marker to simulate an arrow pointing towards the mechanic
            >
                <View className="bg-red-600 p-2 rounded-full shadow-lg">
                    <Ionicons name="arrow-up" size={24} color="white" />
                </View>
            </Marker>
          )}

          {destination?.latitude != null && destination?.longitude != null && region && (
            <MapViewDirections
              origin={{ latitude: region.latitude, longitude: region.longitude }}
              destination={destination}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={5}
              strokeColor="blue"
              // You can't directly add arrowheads to the polyline,
              // but the blue line with the custom arrow marker serves the purpose.
            />
          )}
        </MapView>
      )}

      {/* Booking Footer - Moved up using 'bottom-20' instead of 'bottom-6' */}
      <View className="absolute left-4 right-4 bottom-20 bg-gray-900 p-4 rounded-xl shadow-2xl z-10">
        <Text className="text-white text-lg font-bold">{currentService.name}</Text>
        {currentService.description && <Text className="text-gray-400 mb-2">{currentService.description}</Text>}

        {isViewingExistingBooking || assignedMechanic ? (
          <View>
            <Text className="text-white mb-1">Assigned Mechanic: {assignedMechanic?.name || 'N/A'}</Text>
            <Text className="text-white mb-1">Phone: {assignedMechanic?.phone || "N/A"}</Text>
            <Text className="text-white mb-1">Garage: {assignedMechanic?.garage_name || "N/A"}</Text>
            {assignedMechanic?.services_offered?.length > 0 && (
              <Text className="text-white mb-1">
                Services: {assignedMechanic.services_offered.join(", ")}
              </Text>
            )}
            <Text className="text-yellow-400 font-semibold mt-2">{bookingMessage}</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleBookService}
            disabled={loading}
            className={`p-3 rounded-xl ${loading ? "bg-gray-600" : "bg-green-600"}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center text-lg font-bold">
                Book Service
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
// File: src/Mechanic/MechanicMapScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../config";
import { useUser } from "../contexts/UserContext"; // Import useUser

// Replace with your actual API key
const GOOGLE_MAPS_APIKEY = "AIzaSyCgwyuVt5ITQ5zNHcPQCPPS_gs9VXNi3CY" 

export default function MechanicMapScreen({ route }) {
  const navigation = useNavigation();
  const { mechanic } = useUser(); // Get mechanic data for their current location
  const { task } = route.params;

  const [region, setRegion] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [mechanicLocation, setMechanicLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      let isCancelled = false;
      
      // 1. Get Customer Location (from task data)
      const customerLoc = {
        latitude: task.latitude,
        longitude: task.longitude,
      };
      setCustomerLocation(customerLoc);

      // 2. Get Mechanic Location (Current location for directions)
      let currentMechanicLocation = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Allow location access to view map and get directions.");
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        currentMechanicLocation = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
        };
        setMechanicLocation(currentMechanicLocation);

      } catch (error) {
          console.error("Error getting mechanic location:", error);
          // Fallback to saved garage location if current location fails
          if (mechanic?.latitude && mechanic?.longitude) {
              currentMechanicLocation = {
                  latitude: mechanic.latitude,
                  longitude: mechanic.longitude,
              };
              setMechanicLocation(currentMechanicLocation);
          } else {
              Alert.alert("Location Error", "Could not get your current location.");
              return;
          }
      }

      // 3. Set Map Region (Center between mechanic and customer)
      if (currentMechanicLocation && customerLoc) {
          const latAvg = (currentMechanicLocation.latitude + customerLoc.latitude) / 2;
          const lngAvg = (currentMechanicLocation.longitude + customerLoc.longitude) / 2;
          
          setRegion({
              latitude: latAvg,
              longitude: lngAvg,
              latitudeDelta: Math.abs(currentMechanicLocation.latitude - customerLoc.latitude) * 1.5 || 0.05,
              longitudeDelta: Math.abs(currentMechanicLocation.longitude - customerLoc.longitude) * 1.5 || 0.05,
          });
      }
      
      return () => {
          isCancelled = true;
      };
    })();
  }, [task, mechanic]); // Depend on task and mechanic data

  const handleAction = async (action) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bookings/${task.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: action }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        Alert.alert("Success", `Booking ${action} successfully!`);
        // Navigate back. The HomeScreen will update via Socket.IO
        navigation.goBack(); 
      } else {
        Alert.alert("Error", data.error || `Could not ${action} booking`);
      }
    } catch (err) {
      console.error(`${action} booking error:`, err);
      setLoading(false);
      Alert.alert("Error", "Could not reach server");
    }
  };

  const getButtonConfig = () => {
    switch(task.status) {
      case 'Pending':
        return { 
          text: loading ? "Accepting..." : "Accept Booking", 
          action: () => handleAction("Accepted"), 
          color: "bg-green-600" 
        };
      case 'Accepted':
        return { 
          text: loading ? "Completing..." : "Complete Job", 
          action: () => handleAction("Completed"), 
          color: "bg-blue-600" 
        };
      default:
        return { 
          text: task.status, 
          action: () => Alert.alert("Status", `This job is already ${task.status}`), 
          color: "bg-gray-600",
          disabled: true
        };
    }
  };

  const { text, action, color, disabled } = getButtonConfig();

  return (
    <View className="flex-1 bg-black">
      {region && (customerLocation || mechanicLocation) ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={region} // Use initialRegion for MapView
          region={region} // Keep region state updated if you want to control the map position
          onRegionChangeComplete={setRegion}
          showsUserLocation={true}
        >
          {/* Customer location marker */}
          {customerLocation && (
            <Marker
              coordinate={customerLocation}
              title={task.customer?.name || "Customer"}
              description={`Requested service: ${task.type}`}
              pinColor="blue"
            />
          )}

          {/* Mechanic current location marker (Red pin for the destination) */}
          {mechanicLocation && (
            <Marker
              coordinate={mechanicLocation}
              title={mechanic?.garage_name || "Your Location"}
              description="Starting Point"
              pinColor="red"
            />
          )}

          {/* Directions from mechanic to customer */}
          {mechanicLocation && customerLocation && (
            <MapViewDirections
              origin={mechanicLocation}
              destination={customerLocation}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={5}
              strokeColor="blue"
              onError={(e) => console.error("MapViewDirections Error:", e)}
            />
          )}
        </MapView>
      ) : (
        <View className="flex-1 justify-center items-center">
            <Text className="text-white">Loading map data...</Text>
        </View>
      )}

      {/* Footer */}
      <View className="absolute left-4 right-4 bottom-6 bg-gray-900 p-4 rounded-xl shadow-lg">
        <Text className="text-white text-lg font-bold">Service: {task.type}</Text>
        <Text className="text-gray-400">
          Customer: {task.customer?.name || "N/A"} ({task.customer?.phone || "N/A"})
        </Text>
        <Text className="text-gray-400">Location: {task.location || "N/A"}</Text>

        {(task.status === "Pending" || task.status === "Accepted") && (
            <TouchableOpacity
                className={`mt-3 p-3 rounded-xl ${loading || disabled ? "bg-gray-600" : color}`}
                onPress={action}
                disabled={loading || disabled}
            >
                <Text className="text-white font-bold text-center">
                    {text}
                </Text>
            </TouchableOpacity>
        )}
        
        {/* Display current status if no action button is needed */}
        {task.status !== "Pending" && task.status !== "Accepted" && (
             <Text className="text-yellow-400 mt-2 text-center font-bold">Status: {task.status}</Text>
        )}
      </View>
    </View>
  );
}


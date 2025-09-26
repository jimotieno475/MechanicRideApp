// File: src/Mechanic/MechanicMapScreen.js
import React, { useEffect, useState, useRef } from "react";
import { View, Text, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../config";
import { useUser } from "../contexts/UserContext";
import { Ionicons } from "@expo/vector-icons";

// Replace with your actual API key
const GOOGLE_MAPS_APIKEY = "AIzaSyCgwyuVt5ITQ5zNHcPQCPPS_gs9VXNi3CY" 

// Helper function to calculate bearing (direction of travel) between two points
const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const p1 = { latitude: lat1, longitude: lon1 };
    const p2 = { latitude: lat2, longitude: lon2 };

    const y = Math.sin(p2.longitude - p1.longitude) * Math.cos(p2.latitude);
    const x = Math.cos(p1.latitude) * Math.sin(p2.latitude) - 
              Math.sin(p1.latitude) * Math.cos(p2.latitude) * Math.cos(p2.longitude - p1.longitude);
    const brng = Math.atan2(y, x);
    // Convert radians to degrees and normalize to 0-360
    return ((brng * 180 / Math.PI) + 360) % 360;
};


export default function MechanicMapScreen({ route }) {
  const navigation = useNavigation();
  const { mechanic } = useUser();
  const mapRef = useRef(null);
  const locationSubscription = useRef(null);

  const [currentTask, setCurrentTask] = useState(route.params.task);

  const [region, setRegion] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  
  // State for mechanic's current location and heading
  const [mechanicLocation, setMechanicLocation] = useState(null);
  const [mechanicHeading, setMechanicHeading] = useState(0); 

  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(null);

  // Distance calculation function
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  // ------------------------------------------------------------------
  // **CORE EFFECT: LOCATION TRACKING AND INITIAL SETUP**
  // ------------------------------------------------------------------
  useEffect(() => {
    const customerLoc = {
        latitude: currentTask.latitude,
        longitude: currentTask.longitude,
    };
    setCustomerLocation(customerLoc);
    
    // --- Start Location Tracking ---
    const startLocationTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Allow location access to view map and get directions.");
        return;
      }
      
      // Subscribe to location updates
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Update every 1 second
          distanceInterval: 5, // or every 5 meters
        },
        (location) => {
          const newMechanicLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          
          setMechanicLocation(newMechanicLocation);

          // Use the heading provided by the device (if available)
          if (location.coords.heading !== -1 && location.coords.heading !== null) {
            setMechanicHeading(location.coords.heading);
          } else if (mechanicLocation) {
            // Fallback: Calculate bearing between last known location and current location
            const calculatedHeading = calculateBearing(
                mechanicLocation.latitude, 
                mechanicLocation.longitude, 
                newMechanicLocation.latitude, 
                newMechanicLocation.longitude
            );
            setMechanicHeading(calculatedHeading);
          }
          
          // Re-center map and update distance frequently during tracking
          if (mapRef.current) {
            mapRef.current.animateCamera({
                center: newMechanicLocation,
                pitch: 45, // Optional: Add a slight tilt for navigation feel
                heading: location.coords.heading !== -1 && location.coords.heading !== null ? location.coords.heading : undefined,
                zoom: 16
            }, 500);
          }

          // Update distance
          const calculatedDistance = calculateDistance(
              newMechanicLocation.latitude,
              newMechanicLocation.longitude,
              customerLoc.latitude,
              customerLoc.longitude
          );
          setDistance(calculatedDistance);

          // Optional: Logic to auto-complete job if mechanic arrives
          // if (calculatedDistance < 0.05 && currentTask.status === 'Accepted') { // e.g., within 50 meters
          //   Alert.alert("Arrived!", "You are at the customer's location.");
          // }
        }
      );
    };

    startLocationTracking();

    // Cleanup subscription on unmount
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [currentTask]); // Only re-run when the task changes

  // ------------------------------------------------------------------
  // **INITIAL MAP REGION SET**
  // ------------------------------------------------------------------
  useEffect(() => {
    // Only set the initial region once when mechanicLocation is first available
    if (mechanicLocation && customerLocation && !region) {
        const latAvg = (mechanicLocation.latitude + customerLocation.latitude) / 2;
        const lngAvg = (mechanicLocation.longitude + customerLocation.longitude) / 2;
        
        setRegion({
            latitude: latAvg,
            longitude: lngAvg,
            latitudeDelta: Math.abs(mechanicLocation.latitude - customerLocation.latitude) * 1.5 || 0.05,
            longitudeDelta: Math.abs(mechanicLocation.longitude - customerLocation.longitude) * 1.5 || 0.05,
        });
    }
  }, [mechanicLocation, customerLocation, region]);


// ------------------------------------------------------------------
// **handleAction FUNCTION**
// ------------------------------------------------------------------
  const handleAction = async (action) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bookings/${currentTask.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: action }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        Alert.alert("Success", `Order ${action} successfully!`);
        
        setCurrentTask(prevTask => ({
            ...prevTask,
            status: action 
        }));

        if (action === "Completed") {
            // Stop location tracking when job is done
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
            navigation.goBack(); 
        }
      } else {
        Alert.alert("Error", data.error || `Could not ${action} booking`);
      }
    } catch (err) {
      console.error(`${action} booking error:`, err);
      setLoading(false);
      Alert.alert("Error", "Could not reach server");
    }
  };
// ------------------------------------------------------------------

  const getButtonConfig = () => {
    switch(currentTask.status) {
      case 'Pending':
        return { 
          text: loading ? "Accepting..." : "Accept Order", 
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
          text: currentTask.status, 
          action: () => Alert.alert("Status", `This job is already ${currentTask.status}`), 
          color: "bg-gray-600",
          disabled: true
        };
    }
  };

  const { text, action, color, disabled } = getButtonConfig();

  if (!region || !mechanicLocation || !customerLocation) {
      return (
          <View className="flex-1 justify-center items-center bg-black">
              <ActivityIndicator size="large" color="#ffffff" />
              <Text className="text-white mt-4">Getting your location...</Text>
          </View>
      );
  }

  // Use currentTask throughout the render
  return (
    <View className="flex-1 bg-black">
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={region}
          showsUserLocation={false} // We use a custom marker for the mechanic
          followsUserLocation={true} // Map follows the mechanic
          showsCompass={true}
          showsBuildings={true}
        >
          {/* ---------------------------------------------------- */}
          {/* CUSTOM MECHANIC MARKER (The moving arrow) */}
          {/* ---------------------------------------------------- */}
          {mechanicLocation && (
            <Marker
              coordinate={mechanicLocation}
              title={mechanic?.garage_name || "Your Location"}
              description="Current Position"
              anchor={{ x: 0.5, y: 0.5 }} // Center the marker view
            >
              <View 
                style={{ 
                    transform: [{ rotate: `${mechanicHeading}deg` }], // Apply rotation based on heading
                    backgroundColor: 'red',
                    padding: 8,
                    borderRadius: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.8,
                    shadowRadius: 2,
                    elevation: 5,
                }}
              >
                {/* Ionicons to act as the arrow pointing direction of travel */}
                <Ionicons name="location-sharp" size={24} color="white" /> 
              </View>
            </Marker>
          )}
          
          {/* ---------------------------------------------------- */}
          {/* CUSTOMER LOCATION MARKER (The Destination) */}
          {/* ---------------------------------------------------- */}
          {customerLocation && (
            <Marker
              coordinate={customerLocation}
              title={currentTask.customer?.name || "Customer"}
              description={`Booking Location: ${currentTask.type}`}
            >
              <View className="bg-blue-600 p-2 rounded-full shadow-lg border-2 border-white">
                    <Ionicons name="pin" size={24} color="white" />
              </View>
              <Text className="text-white font-bold text-center mt-1">DESTINATION</Text>
            </Marker>
          )}

          {/* ---------------------------------------------------- */}
          {/* DIRECTIONS (Blue Line) - From Mechanic to Customer */}
          {/* ---------------------------------------------------- */}
          {mechanicLocation && customerLocation && (
            <MapViewDirections
              origin={mechanicLocation}
              destination={customerLocation}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={5}
              strokeColor="blue"
              onReady={(result) => {
                // Adjust map bounds to fit the route initially
                if (mapRef.current) {
                    mapRef.current.fitToCoordinates(result.coordinates, {
                        edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
                        animated: true,
                    });
                }
              }}
              onError={(e) => console.error("MapViewDirections Error:", e)}
            />
          )}
        </MapView>

      {/* Footer - Moved up using 'bottom-28' (more than 20) */}
      <View className="absolute left-4 right-4 bottom-28 bg-gray-900 p-4 rounded-xl shadow-2xl z-10">
        <Text className="text-white text-lg font-bold">Service: {currentTask.type}</Text>
        <Text className="text-gray-400">
          Customer: {currentTask.customer?.name || "N/A"} ({currentTask.customer?.phone || "N/A"})
        </Text>
        <Text className="text-gray-400">Location: {currentTask.location || "N/A"}</Text>
        
        {/* Added Distance Display */}
        {distance && (
          <View className="flex-row justify-between mt-1">
            <Text className="text-gray-400">Distance Remaining:</Text>
            <Text className="text-yellow-400 font-bold">{distance} km</Text>
          </View>
        )}

        {/* Action Button Area */}
        {(currentTask.status === "Pending" || currentTask.status === "Accepted") && (
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
        {currentTask.status !== "Pending" && currentTask.status !== "Accepted" && (
             <Text className="text-yellow-400 mt-2 text-center font-bold">Status: {currentTask.status}</Text>
        )}
      </View>
    </View>
  );
}






// // File: src/Mechanic/MechanicMapScreen.js
// import React, { useEffect, useState } from "react";
// import { View, Text, Alert, TouchableOpacity } from "react-native";
// import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
// import MapViewDirections from "react-native-maps-directions";
// import * as Location from "expo-location";
// import { useNavigation } from "@react-navigation/native";
// import { API_URL } from "../config";
// import { useUser } from "../contexts/UserContext"; // Import useUser

// // Replace with your actual API key
// const GOOGLE_MAPS_APIKEY = "AIzaSyCgwyuVt5ITQ5zNHcPQCPPS_gs9VXNi3CY" 

// export default function MechanicMapScreen({ route }) {
//   const navigation = useNavigation();
//   const { mechanic } = useUser(); // Get mechanic data for their current location
//   const { task } = route.params;

//   const [region, setRegion] = useState(null);
//   const [customerLocation, setCustomerLocation] = useState(null);
//   const [mechanicLocation, setMechanicLocation] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [distance, setDistance] = useState(null); // Added distance state

//   // Distance calculation function (same as in MapScreen)
//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371; // Earth's radius in kilometers
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = 
//       Math.sin(dLat/2) * Math.sin(dLat/2) +
//       Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
//       Math.sin(dLon/2) * Math.sin(dLon/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     return (R * c).toFixed(1);
//   };

//   useEffect(() => {
//     (async () => {
//       let isCancelled = false;
      
//       // 1. Get Customer Location (from task data)
//       const customerLoc = {
//         latitude: task.latitude,
//         longitude: task.longitude,
//       };
//       setCustomerLocation(customerLoc);

//       // 2. Get Mechanic Location (Current location for directions)
//       let currentMechanicLocation = null;
//       try {
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== "granted") {
//           Alert.alert("Permission Denied", "Allow location access to view map and get directions.");
//           return;
//         }
//         const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
//         currentMechanicLocation = {
//             latitude: loc.coords.latitude,
//             longitude: loc.coords.longitude,
//         };
//         setMechanicLocation(currentMechanicLocation);

//       } catch (error) {
//           console.error("Error getting mechanic location:", error);
//           // Fallback to saved garage location if current location fails
//           if (mechanic?.latitude && mechanic?.longitude) {
//               currentMechanicLocation = {
//                   latitude: mechanic.latitude,
//                   longitude: mechanic.longitude,
//               };
//               setMechanicLocation(currentMechanicLocation);
//           } else {
//               Alert.alert("Location Error", "Could not get your current location.");
//               return;
//           }
//       }

//       // 3. Set Map Region (Center between mechanic and customer)
//       if (currentMechanicLocation && customerLoc) {
//           const latAvg = (currentMechanicLocation.latitude + customerLoc.latitude) / 2;
//           const lngAvg = (currentMechanicLocation.longitude + customerLoc.longitude) / 2;
          
//           setRegion({
//               latitude: latAvg,
//               longitude: lngAvg,
//               latitudeDelta: Math.abs(currentMechanicLocation.latitude - customerLoc.latitude) * 1.5 || 0.05,
//               longitudeDelta: Math.abs(currentMechanicLocation.longitude - customerLoc.longitude) * 1.5 || 0.05,
//           });

//           // 4. Calculate and set distance
//           const calculatedDistance = calculateDistance(
//             currentMechanicLocation.latitude,
//             currentMechanicLocation.longitude,
//             customerLoc.latitude,
//             customerLoc.longitude
//           );
//           setDistance(calculatedDistance);
//       }
      
//       return () => {
//           isCancelled = true;
//       };
//     })();
//   }, [task, mechanic]); // Depend on task and mechanic data

//   const handleAction = async (action) => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_URL}/bookings/${task.id}/action`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ action: action }),
//       });
//       const data = await res.json();
//       setLoading(false);

//       if (res.ok) {
//         Alert.alert("Success", `Order ${action} successfully!`);
//         // Navigate back. The HomeScreen will update via Socket.IO
//         navigation.goBack(); 
//       } else {
//         Alert.alert("Error", data.error || `Could not ${action} booking`);
//       }
//     } catch (err) {
//       console.error(`${action} booking error:`, err);
//       setLoading(false);
//       Alert.alert("Error", "Could not reach server");
//     }
//   };

//   const getButtonConfig = () => {
//     switch(task.status) {
//       case 'Pending':
//         return { 
//           text: loading ? "Accepting..." : "Accept Order", 
//           action: () => handleAction("Accepted"), 
//           color: "bg-green-600" 
//         };
//       case 'Accepted':
//         return { 
//           text: loading ? "Completing..." : "Complete Job", 
//           action: () => handleAction("Completed"), 
//           color: "bg-blue-600" 
//         };
//       default:
//         return { 
//           text: task.status, 
//           action: () => Alert.alert("Status", `This job is already ${task.status}`), 
//           color: "bg-gray-600",
//           disabled: true
//         };
//     }
//   };

//   const { text, action, color, disabled } = getButtonConfig();

//   return (
//     <View className="flex-1 bg-black">
//       {region && (customerLocation || mechanicLocation) ? (
//         <MapView
//           provider={PROVIDER_GOOGLE}
//           style={{ flex: 1 }}
//           initialRegion={region} // Use initialRegion for MapView
//           region={region} // Keep region state updated if you want to control the map position
//           onRegionChangeComplete={setRegion}
//           showsUserLocation={true}
//         >
//           {/* Customer location marker */}
//           {customerLocation && (
//             <Marker
//               coordinate={customerLocation}
//               title={task.customer?.name || "Customer"}
//               description={`Requested service: ${task.type}`}
//               pinColor="blue"
//             />
//           )}

//           {/* Mechanic current location marker (Red pin for the destination) */}
//           {mechanicLocation && (
//             <Marker
//               coordinate={mechanicLocation}
//               title={mechanic?.garage_name || "Your Location"}
//               description="Starting Point"
//               pinColor="red"
//             />
//           )}

//           {/* Directions from mechanic to customer */}
//           {mechanicLocation && customerLocation && (
//             <MapViewDirections
//               origin={mechanicLocation}
//               destination={customerLocation}
//               apikey={GOOGLE_MAPS_APIKEY}
//               strokeWidth={5}
//               strokeColor="blue"
//               onError={(e) => console.error("MapViewDirections Error:", e)}
//             />
//           )}
//         </MapView>
//       ) : (
//         <View className="flex-1 justify-center items-center">
//             <Text className="text-white">Loading map data...</Text>
//         </View>
//       )}

//       {/* Footer */}
//       <View className="absolute left-4 right-4 bottom-6 bg-gray-900 p-4 rounded-xl shadow-lg">
//         <Text className="text-white text-lg font-bold">Service: {task.type}</Text>
//         <Text className="text-gray-400">
//           Customer: {task.customer?.name || "N/A"} ({task.customer?.phone || "N/A"})
//         </Text>
//         <Text className="text-gray-400">Location: {task.location || "N/A"}</Text>
        
//         {/* Added Distance Display */}
//         {distance && (
//           <View className="flex-row justify-between mt-1">
//             <Text className="text-gray-400">Distance:</Text>
//             <Text className="text-white font-semibold">{distance} km</Text>
//           </View>
//         )}

//         {/* Added Coordinates Display */}
//         <View className="flex-row justify-between mt-1">
//           <Text className="text-gray-400">Customer Coordinates:</Text>
//           <Text className="text-white text-xs">
//             {task.latitude?.toFixed(4)}, {task.longitude?.toFixed(4)}
//           </Text>
//         </View>

//         {(task.status === "Pending" || task.status === "Accepted") && (
//             <TouchableOpacity
//                 className={`mt-3 p-3 rounded-xl ${loading || disabled ? "bg-gray-600" : color}`}
//                 onPress={action}
//                 disabled={loading || disabled}
//             >
//                 <Text className="text-white font-bold text-center">
//                     {text}
//                 </Text>
//             </TouchableOpacity>
//         )}
        
//         {/* Display current status if no action button is needed */}
//         {task.status !== "Pending" && task.status !== "Accepted" && (
//              <Text className="text-yellow-400 mt-2 text-center font-bold">Status: {task.status}</Text>
//         )}
//       </View>
//     </View>
//   );
// }
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, Platform, ActivityIndicator, Linking } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../config";

// Platform-specific imports with error handling
let MapView, Marker, Polyline;

try {
  if (Platform.OS === 'web') {
    MapView = require('react-native-web-maps').default;
    Marker = require('react-native-web-maps').Marker;
    Polyline = require('react-native-web-maps').Polyline;
  } else {
    MapView = require("react-native-maps").default;
    Marker = require("react-native-maps").Marker;
    Polyline = require("react-native-maps").Polyline;
  }
} catch (error) {
  console.warn("Map components not available:", error);
}

export default function MapScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Safe parameter extraction with defaults
  const bookingId = route.params?.bookingId;
  const task = route.params?.task;
  const service = route.params?.service;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(null);
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState(null);

  // Function to make phone calls
  const makePhoneCall = async (phoneNumber, contactName) => {
    if (!phoneNumber) {
      Alert.alert("Error", "Phone number not available");
      return;
    }

    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    if (!cleanNumber.match(/^\+?[\d\s\-\(\)]{10,}$/)) {
      Alert.alert("Invalid Number", "The phone number format is invalid");
      return;
    }

    const phoneUrl = Platform.OS === 'ios' ? `telprompt:${cleanNumber}` : `tel:${cleanNumber}`;
    
    try {
      const supported = await Linking.canOpenURL(phoneUrl);
      
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert(
          "Call Information", 
          `Call ${contactName} at: ${cleanNumber}`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error making phone call:", error);
      Alert.alert("Info", `Phone number: ${cleanNumber}`);
    }
  };

  const handlePhoneCall = (phoneNumber, contactName) => {
    Alert.alert(
      `Call ${contactName}`,
      `Do you want to call ${phoneNumber}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call", onPress: () => makePhoneCall(phoneNumber, contactName) }
      ]
    );
  };

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    } else {
      setError("No booking ID provided");
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const bookingData = await response.json();
      setBooking(bookingData);

      if (bookingData.latitude && bookingData.longitude && bookingData.mechanic) {
        const customerLat = bookingData.latitude;
        const customerLng = bookingData.longitude;
        const mechanicLat = bookingData.mechanic.latitude;
        const mechanicLng = bookingData.mechanic.longitude;

        const minLat = Math.min(customerLat, mechanicLat);
        const maxLat = Math.max(customerLat, mechanicLat);
        const minLng = Math.min(customerLng, mechanicLng);
        const maxLng = Math.max(customerLng, mechanicLng);

        setRegion({
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: (maxLat - minLat) * 1.5 + 0.01,
          longitudeDelta: (maxLng - minLng) * 1.5 + 0.01,
        });

        const calculatedDistance = calculateDistance(
          customerLat,
          customerLng,
          mechanicLat,
          mechanicLng
        );
        setDistance(calculatedDistance);
      }

    } catch (error) {
      console.error("Error fetching booking details:", error);
      setError("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-green-600";
      case "Accepted": return "bg-blue-500";
      case "Pending": return "bg-yellow-500";
      case "Rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Accepted": return "In Progress";
      case "Pending": return "Pending";
      case "Completed": return "Completed";
      case "Rejected": return "Cancelled";
      default: return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4">Loading booking details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !booking) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Ionicons name="alert-circle" size={64} color="red" />
        <Text className="text-white text-lg mt-4">{error || "Booking not found"}</Text>
        <TouchableOpacity 
          className="bg-blue-500 px-4 py-2 rounded-full mt-4"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-90 p-4">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Booking Details</Text>
        </View>
        <Text className="text-gray-400">ID: #{booking.id}</Text>
      </View>

      {/* Map */}
      {region && booking.mechanic && MapView ? (
        <MapView
          style={{ flex: 1 }}
          initialRegion={region}
          showsUserLocation={false}
        >
          {/* Customer Marker */}
          <Marker
            coordinate={{
              latitude: booking.latitude,
              longitude: booking.longitude
            }}
            title="Customer Location"
            description={booking.location}
          >
            <View className="items-center">
              <Ionicons name="person" size={24} color="blue" />
              <Text className="text-blue-500 font-bold">Customer</Text>
            </View>
          </Marker>

          {/* Mechanic Marker */}
          <Marker
            coordinate={{
              latitude: booking.mechanic.latitude,
              longitude: booking.mechanic.longitude
            }}
            title={booking.mechanic.garage_name || booking.mechanic.name}
            description={booking.mechanic.garage_location}
          >
            <View className="items-center">
              <Ionicons name="construct" size={24} color="red" />
              <Text className="text-red-500 font-bold">Mechanic</Text>
            </View>
          </Marker>

          {/* Route Line */}
          {Polyline && (
            <Polyline
              coordinates={[
                {
                  latitude: booking.latitude,
                  longitude: booking.longitude
                },
                {
                  latitude: booking.mechanic.latitude,
                  longitude: booking.mechanic.longitude
                }
              ]}
              strokeColor="#00FF00"
              strokeWidth={3}
              lineDashPattern={[10, 10]}
            />
          )}
        </MapView>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="map-outline" size={64} color="gray" />
          <Text className="text-gray-400 mt-4">Map not available</Text>
        </View>
      )}

      {/* Booking Details Panel */}
      <View className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-95 p-4 rounded-t-2xl max-h-1/2">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white text-lg font-bold">Booking Information</Text>
          <Text className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)} text-white`}>
            {getStatusText(booking.status)}
          </Text>
        </View>

        <View className="space-y-2">
          {/* Service Info */}
          <View className="flex-row justify-between">
            <Text className="text-gray-400">Service:</Text>
            <Text className="text-white">{booking.type}</Text>
          </View>

          {/* Location */}
          <View className="flex-row justify-between">
            <Text className="text-gray-400">Location:</Text>
            <Text className="text-white text-right flex-1 ml-2">{booking.location}</Text>
          </View>

          {/* Coordinates - ADDED BACK */}
          <View className="flex-row justify-between">
            <Text className="text-gray-400">Coordinates:</Text>
            <Text className="text-white">
              {booking.latitude?.toFixed(4)}, {booking.longitude?.toFixed(4)}
            </Text>
          </View>

          {/* Distance - ADDED BACK */}
          {distance && (
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Distance:</Text>
              <Text className="text-white">{distance} km</Text>
            </View>
          )}

          {/* Customer Info */}
          <View className="mt-3 pt-2 border-t border-gray-700">
            <Text className="text-gray-400 font-semibold mb-1">Customer:</Text>
            <Text className="text-white">{booking.customer?.name}</Text>
            <TouchableOpacity 
              onPress={() => handlePhoneCall(booking.customer?.phone, booking.customer?.name)}
            >
              <Text className="text-blue-400 text-sm underline">{booking.customer?.phone}</Text>
            </TouchableOpacity>
            {/* <Text className="text-gray-300 text-sm">{booking.customer?.email}</Text> */}
          </View>

          {/* Mechanic Info - ADDED BACK FULL DETAILS */}
          <View className="mt-2 pt-3 border-t border-gray-700">
            <Text className="text-gray-400 font-semibold mb-1">Mechanic:</Text>
            <Text className="text-white">{booking.mechanic?.name}</Text>
            <Text className="text-gray-300 text-sm">{booking.mechanic?.garage_name}</Text>
            <TouchableOpacity 
              onPress={() => handlePhoneCall(booking.mechanic?.phone, booking.mechanic?.name)}
            >
              <Text className="text-blue-400 text-sm underline">{booking.mechanic?.phone}</Text>
            </TouchableOpacity>
            <Text className="text-gray-300 text-sm">{booking.mechanic?.garage_location}</Text>
          </View>

          {/* Timestamps - ADDED BACK */}
          <View className="mt-2 pt-3 border-t border-gray-700">
            <Text className="text-gray-400 text-xs">
              Created: {new Date(booking.created_at).toLocaleString()}
            </Text>
            {booking.updated_at && (
              <Text className="text-gray-400 text-xs">
                Updated: {new Date(booking.updated_at).toLocaleString()}
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-3 mt-4">
          <TouchableOpacity 
            className="flex-1 bg-blue-600 p-3 rounded-xl flex-row justify-center items-center"
            onPress={() => handlePhoneCall(booking.customer?.phone, booking.customer?.name)}
          >
            <Ionicons name="call" size={18} color="white" />
            <Text className="text-white ml-2">Call Customer</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-1 bg-green-600 p-3 rounded-xl flex-row justify-center items-center"
            onPress={() => handlePhoneCall(booking.mechanic?.phone, booking.mechanic?.name)}
          >
            <Ionicons name="construct" size={18} color="white" />
            <Text className="text-white ml-2">Call Mechanic</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
// // File: src/screens/MapScreen.js
// import React, { useState, useEffect } from "react";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { View, TextInput, TouchableOpacity, Text } from "react-native";
// import MapView, { Marker } from "react-native-maps";
// import MapViewDirections from "react-native-maps-directions";
// import { useRoute } from "@react-navigation/native";

// const GOOGLE_MAPS_APIKEY = "YOUR_GOOGLE_MAPS_API_KEY";

// export default function MapScreen() {
//   const route = useRoute();
//   const { task, role } = route.params || {};
//   const [query, setQuery] = useState("");
//   const [region, setRegion] = useState({
//     latitude: -1.28333,
//     longitude: 36.81667,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   });
//   const [destination, setDestination] = useState(null);
//   const [bookingMessage, setBookingMessage] = useState("");

//   // Example mechanics
//   const mechanics = [
//     { id: 1, name: "Alex Garage", lat: -1.29, lng: 36.82, issues: ["flat tire", "engine"] },
//     { id: 2, name: "Nairobi Mechs", lat: -1.30, lng: 36.81, issues: ["battery", "brakes"] },
//   ];

//   useEffect(() => {
//     if (task) {
//       setRegion({
//         latitude: task.latitude,
//         longitude: task.longitude,
//         latitudeDelta: 0.05,
//         longitudeDelta: 0.05,
//       });
//       setDestination({ latitude: task.latitude, longitude: task.longitude });
//     }
//   }, [task]);

//   const handleSearch = async () => {
//     const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//       query
//     )}&key=${GOOGLE_MAPS_APIKEY}`;

//     try {
//       const response = await fetch(url);
//       const data = await response.json();
//       if (data.results.length > 0) {
//         const { lat, lng } = data.results[0].geometry.location;
//         setRegion({
//           ...region,
//           latitude: lat,
//           longitude: lng,
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching location:", error);
//     }
//   };

//   const handleBookingAction = () => {
//     if (role === "user") {
//       setBookingMessage("✅ The mechanic has received your booking. Please wait for them to accept.");
//     } else if (role === "mechanic") {
//       setBookingMessage("✅ You have accepted the booking. Please contact the customer.");
//     }

//     // Hide after 10 seconds
//     setTimeout(() => setBookingMessage(""), 10000);
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       {/* Search bar only for user */}
//       {role === "user" && !task && (
//         <View className="absolute top-4 left-4 right-4 z-10 bg-white rounded-lg flex-row items-center p-2 shadow-md">
//           <TextInput
//             className="flex-1 px-2"
//             placeholder="Search place..."
//             value={query}
//             onChangeText={setQuery}
//           />
//           <TouchableOpacity
//             className="bg-blue-500 px-3 py-2 rounded-lg"
//             onPress={handleSearch}
//           >
//             <Text className="text-white">Search</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Map */}
//       <MapView style={{ flex: 1 }} region={region}>
//         {/* Marker for selected task */}
//         {task && (
//           <Marker
//             coordinate={{ latitude: task.latitude, longitude: task.longitude }}
//             title={task.type}
//             description={task.location}
//             pinColor="red"
//           />
//         )}

//         {/* Mechanics markers */}
//         {role === "user" && !task &&
//           mechanics.map((m) => (
//             <Marker
//               key={m.id}
//               coordinate={{ latitude: m.lat, longitude: m.lng }}
//               title={m.name}
//             />
//           ))}

//         {/* Draw directions if task exists */}
//         {task && (
//           <MapViewDirections
//             origin={{ latitude: -1.28333, longitude: 36.81667 }} // Example: user's location
//             destination={destination}
//             apikey={GOOGLE_MAPS_APIKEY}
//             strokeWidth={5}
//             strokeColor="blue"
//           />
//         )}
//       </MapView>

//       {/* Task Footer */}
//       {task && (
//         <View className="absolute bottom-24 left-4 right-4 bg-white p-4 rounded-xl shadow-lg">
//           <Text className="text-lg font-bold text-black">{task.type}</Text>
//           <Text className="text-gray-500">{task.location}</Text>
//           {task.customer && <Text className="text-gray-500">Customer: {task.customer}</Text>}
//           {task.phone && <Text className="text-gray-500">Phone: {task.phone}</Text>}

//           <Text className="text-gray-700 mt-2">🚗 Directions drawn on map</Text>

//           {/* Action Button */}
//           <TouchableOpacity
//             onPress={handleBookingAction}
//             className={`mt-3 py-3 rounded-lg ${
//               role === "user" ? "bg-green-600" : "bg-blue-600"
//             }`}
//           >
//             <Text className="text-white text-center font-semibold">
//               {role === "user" ? "Order Mechanic" : "Accept Order"}
//             </Text>
//           </TouchableOpacity>

//           {/* Temporary booking message */}
//           {bookingMessage !== "" && (
//             <View className="mt-2 bg-yellow-100 p-2 rounded-lg">
//               <Text className="text-yellow-900 text-center">{bookingMessage}</Text>
//             </View>
//           )}
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }



// // File: src/screens/MapScreen.js
// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
// import { useNavigation } from '@react-navigation/native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// // Mechanics (still showing them on map)
// const MECHANICS = [
//   { id: 'm1', name: 'Joe', lat: -1.28333, lng: 36.81667, issues: ['battery','tyre'] },
//   { id: 'm2', name: 'AutoFix', lat: -1.285, lng: 36.82, issues: ['engine','electrical'] },
//   { id: 'm3', name: 'QuickTyre', lat: -1.28, lng: 36.81, issues: ['tyre'] },
// ];

// const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY"; // <-- replace with your key

// export default function MapScreen({ route }) {
//   const navigation = useNavigation();
//   const { issueId } = route.params || {};

//   const [region, setRegion] = useState({
//     latitude: -1.28333,
//     longitude: 36.81667,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   });

//   const [searchQuery, setSearchQuery] = useState('');
//   const [places, setPlaces] = useState([]);
//   const [selectedPlace, setSelectedPlace] = useState(null);

//   // Search places via Google Places Autocomplete
//   const searchPlaces = async (query) => {
//     setSearchQuery(query);
//     if (query.length < 3) {
//       setPlaces([]);
//       return;
//     }

//     try {
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&location=${region.latitude},${region.longitude}&radius=50000&key=${GOOGLE_API_KEY}`
//       );
//       const data = await response.json();
//       setPlaces(data.predictions || []);
//     } catch (error) {
//       console.error("Places API error:", error);
//     }
//   };

//   // When a place is selected
//   const selectPlace = async (placeId, description) => {
//     try {
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`
//       );
//       const data = await response.json();
//       const location = data.result.geometry.location;

//       setSelectedPlace({
//         latitude: location.lat,
//         longitude: location.lng,
//         name: description,
//       });

//       setRegion({
//         latitude: location.lat,
//         longitude: location.lng,
//         latitudeDelta: 0.03,
//         longitudeDelta: 0.03,
//       });

//       setPlaces([]);
//       setSearchQuery(description);
//     } catch (error) {
//       console.error("Place details error:", error);
//     }
//   };

//   // Filter mechanics by issue (if provided)
//   const filteredMechanics = MECHANICS.filter(m =>
//     issueId ? m.issues.includes(issueId) : true
//   );

//   return (
//     <SafeAreaView className="flex-1 ">
//       {/* Map */}
//       <MapView style={{ flex: 1 }} region={region} showsUserLocation>
//         {filteredMechanics.map((m) => (
//           <Marker
//             key={m.id}
//             coordinate={{ latitude: m.lat, longitude: m.lng }}
//             title={m.name}
//             description={`Can handle: ${m.issues.join(', ')}`}
//             pinColor="red"
//             onCalloutPress={() =>
//               navigation.navigate('MechanicProfile', { mechanicId: m.id })
//             }
//           />
//         ))}

//         {selectedPlace && (
//           <Marker
//             coordinate={selectedPlace}
//             title={selectedPlace.name}
//             pinColor="blue"
//           />
//         )}
//       </MapView>

//       {/* Back Button */}
//       <TouchableOpacity
//         className="absolute top-12 left-4 bg-white/80 px-3 py-2 rounded-lg"
//         onPress={() => navigation.goBack()}
//       >
//         <Text className="text-black font-semibold">Back</Text>
//       </TouchableOpacity>

//       {/* Search Bar */}
//       <View className="absolute top-12 left-16 right-4 bg-white rounded-lg shadow">
//         <TextInput
//           placeholder="Search places..."
//           value={searchQuery}
//           onChangeText={searchPlaces}
//           className="px-4 py-2 text-black"
//         />
//       </View>

//       {/* Suggestions Dropdown */}
//       {places.length > 0 && (
//         <View className="absolute top-24 left-16 right-4 bg-white rounded-lg shadow">
//           <FlatList
//             data={places}
//             keyExtractor={(item) => item.place_id}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 className="p-3 border-b border-gray-200"
//                 onPress={() => selectPlace(item.place_id, item.description)}
//               >
//                 <Text className="text-black">{item.description}</Text>
//               </TouchableOpacity>
//             )}
//           />
//         </View>
//       )}

//       {/* Info Panel */}
//       <View className="absolute bottom-6 left-4 right-4 bg-white rounded-xl p-3 shadow">
//         <Text className="text-black font-semibold">
//           Showing {filteredMechanics.length} mechanics
//         </Text>
//       </View>
//     </SafeAreaView>
//   );
// }

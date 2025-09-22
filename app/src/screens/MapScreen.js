// File: src/screens/MapScreen.js
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { useRoute } from "@react-navigation/native";

const GOOGLE_MAPS_APIKEY = "YOUR_GOOGLE_MAPS_API_KEY";

export default function MapScreen() {
  const route = useRoute();
  const { task, role } = route.params || {};
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState({
    latitude: -1.28333,
    longitude: 36.81667,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [destination, setDestination] = useState(null);
  const [bookingMessage, setBookingMessage] = useState("");

  // Example mechanics
  const mechanics = [
    { id: 1, name: "Alex Garage", lat: -1.29, lng: 36.82, issues: ["flat tire", "engine"] },
    { id: 2, name: "Nairobi Mechs", lat: -1.30, lng: 36.81, issues: ["battery", "brakes"] },
  ];

  useEffect(() => {
    if (task) {
      setRegion({
        latitude: task.latitude,
        longitude: task.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setDestination({ latitude: task.latitude, longitude: task.longitude });
    }
  }, [task]);

  const handleSearch = async () => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      query
    )}&key=${GOOGLE_MAPS_APIKEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setRegion({
          ...region,
          latitude: lat,
          longitude: lng,
        });
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  const handleBookingAction = () => {
    if (role === "user") {
      setBookingMessage("✅ The mechanic has received your booking. Please wait for them to accept.");
    } else if (role === "mechanic") {
      setBookingMessage("✅ You have accepted the booking. Please contact the customer.");
    }

    // Hide after 10 seconds
    setTimeout(() => setBookingMessage(""), 10000);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Search bar only for user */}
      {role === "user" && !task && (
        <View className="absolute top-4 left-4 right-4 z-10 bg-white rounded-lg flex-row items-center p-2 shadow-md">
          <TextInput
            className="flex-1 px-2"
            placeholder="Search place..."
            value={query}
            onChangeText={setQuery}
          />
          <TouchableOpacity
            className="bg-blue-500 px-3 py-2 rounded-lg"
            onPress={handleSearch}
          >
            <Text className="text-white">Search</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map */}
      <MapView style={{ flex: 1 }} region={region}>
        {/* Marker for selected task */}
        {task && (
          <Marker
            coordinate={{ latitude: task.latitude, longitude: task.longitude }}
            title={task.type}
            description={task.location}
            pinColor="red"
          />
        )}

        {/* Mechanics markers */}
        {role === "user" && !task &&
          mechanics.map((m) => (
            <Marker
              key={m.id}
              coordinate={{ latitude: m.lat, longitude: m.lng }}
              title={m.name}
            />
          ))}

        {/* Draw directions if task exists */}
        {task && (
          <MapViewDirections
            origin={{ latitude: -1.28333, longitude: 36.81667 }} // Example: user's location
            destination={destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={5}
            strokeColor="blue"
          />
        )}
      </MapView>

      {/* Task Footer */}
      {task && (
        <View className="absolute bottom-24 left-4 right-4 bg-white p-4 rounded-xl shadow-lg">
          <Text className="text-lg font-bold text-black">{task.type}</Text>
          <Text className="text-gray-500">{task.location}</Text>
          {task.customer && <Text className="text-gray-500">Customer: {task.customer}</Text>}
          {task.phone && <Text className="text-gray-500">Phone: {task.phone}</Text>}

          <Text className="text-gray-700 mt-2">🚗 Directions drawn on map</Text>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleBookingAction}
            className={`mt-3 py-3 rounded-lg ${
              role === "user" ? "bg-green-600" : "bg-blue-600"
            }`}
          >
            <Text className="text-white text-center font-semibold">
              {role === "user" ? "Book Mechanic" : "Accept Booking"}
            </Text>
          </TouchableOpacity>

          {/* Temporary booking message */}
          {bookingMessage !== "" && (
            <View className="mt-2 bg-yellow-100 p-2 rounded-lg">
              <Text className="text-yellow-900 text-center">{bookingMessage}</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}



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

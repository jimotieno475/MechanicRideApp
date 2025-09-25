// File: src/Mechanic/MechanicHomeScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { API_URL, WS_URL } from '../config'; 
import { useUser } from '../contexts/UserContext';
import io from "socket.io-client";

export default function MechanicHomeScreen() {
  const navigation = useNavigation();
  const { mechanic } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  // Fetch current bookings
  const fetchBookings = async () => {
    if (!mechanic) return;
    try {
      const res = await fetch(`${API_URL}/mechanics/${mechanic.id}/bookings`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setRequests(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch bookings error:", err);
      setLoading(false);
    }
  };

  // Setup Socket.IO for real-time updates
  useEffect(() => {
    fetchBookings(); // initial load

    if (mechanic) {
      const socket = io(WS_URL, {
        transports: ["websocket"],
        query: { mechanic_id: mechanic.id }
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("✅ Socket.IO connected for mechanic:", mechanic.id);
      });

      socket.on("disconnect", () => {
        console.log("⚠️ Socket.IO disconnected");
      });

      // ✅ Listen for NEW_BOOKING (from backend)
      socket.on("NEW_BOOKING", (booking) => {
        console.log("📩 NEW_BOOKING received:", booking);
        setRequests((prev) => [booking, ...prev]); // add to list instantly
        Alert.alert("New Booking", "A customer just booked a service!");
      });

      // ✅ Handle booking updates
      socket.on("BOOKING_UPDATED", (booking) => {
        console.log("🔄 BOOKING_UPDATED:", booking);
        setRequests((prev) =>
          prev.map((req) => (req.id === booking.id ? booking : req))
        );
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [mechanic]);

  const handleReject = (id) => {
    Alert.alert(
      "Reject Request",
      "Do you want to reject this service request?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reject", 
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/bookings/${id}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'Rejected' })
              });
              if (res.ok) fetchBookings();
            } catch (err) {
              console.error("Reject booking error:", err);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-md">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-black">{item.type}</Text>
        <View className={`px-2 py-1 rounded-xl ${
          item.status === 'Pending' ? 'bg-yellow-100' :
          item.status === 'Accepted' ? 'bg-green-100' :
          item.status === 'Rejected' ? 'bg-red-100' :
          item.status === 'Completed' ? 'bg-blue-100' : ''
        }`}>
          <Text className={`text-xs font-semibold ${
            item.status === 'Pending' ? 'text-yellow-500' :
            item.status === 'Accepted' ? 'text-green-500' :
            item.status === 'Rejected' ? 'text-red-500' :
            item.status === 'Completed' ? 'text-blue-500' : ''
          }`}>{item.status}</Text>
        </View>
      </View>

      <View className="flex-row items-center mb-2">
        <Ionicons name="calendar-outline" size={16} color="#6b7280" />
        <Text className="text-gray-500 ml-2">{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <View className="flex-row items-center mb-2">
        <Ionicons name="location-outline" size={16} color="#6b7280" />
        <Text className="text-gray-500 ml-2">{item.location}</Text>
      </View>
      <View className="flex-row items-center mb-2">
        <Ionicons name="person-outline" size={16} color="#6b7280" />
        <Text className="text-gray-500 ml-2">{item.customer?.name}</Text>
      </View>

      <View className="flex-row justify-around mt-4">
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => navigation.navigate("MechanicMapScreen", { task: item })}
        >
          <Text className="text-white font-bold text-center">View on Map</Text>
        </TouchableOpacity>

        {item.status === 'Pending' && (
          <TouchableOpacity
            className="bg-red-500 px-4 py-2 rounded-lg"
            onPress={() => handleReject(item.id)}
          >
            <Text className="text-white font-bold text-center">Reject</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="px-4 pt-4 mb-2">
        <Text className="text-xl font-bold text-black">
          🚗 {mechanic?.garage_name || "Your Garage"}
        </Text>
        <Text className="text-gray-500 mt-1 mb-2">
          Available jobs in your area
        </Text>
      </View>

      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ListEmptyComponent={
          !loading && <Text className="text-center text-gray-500 mt-4">No jobs available</Text>
        }
      />
    </SafeAreaView>
  );
}



// // File: src/Mechanic/MechanicHomeScreen.js
// import React, { useState, useEffect } from 'react';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';

// // Example requests (simulate from backend)
// const serviceRequests = [
//   { 
//     id: 1, 
//     type: "Engine Repair", 
//     date: "Oct 28, 2023", 
//     location: "123 Main St", 
//     status: "Pending",
//     customer: "Alice Johnson",
//     latitude: -1.295,
//     longitude: 36.822,
//   },
//   { 
//     id: 2, 
//     type: "Brake Replacement", 
//     date: "Oct 29, 2023", 
//     location: "456 Elm St", 
//     status: "Pending",
//     customer: "Bob Williams",
//     latitude: -1.292,
//     longitude: 36.821,
//   },
//   { 
//     id: 3, 
//     type: "Tire Change", 
//     date: "Oct 30, 2023", 
//     location: "789 Oak St", 
//     status: "Pending",
//     customer: "Catherine Davis",
//     latitude: -1.298,
//     longitude: 36.823,
//   },
// ];

// export default function MechanicHomeScreen() {
//   const navigation = useNavigation();
//   const [requests, setRequests] = useState(serviceRequests);

//   useEffect(() => {
//     // Simulate fetch from backend
//     setTimeout(() => {
//       setRequests(serviceRequests);
//     }, 500);
//   }, []);

//   const handleAccept = (id) => {
//     Alert.alert(
//       "Accept Request",
//       "Do you want to accept this service request?",
//       [
//         { text: "Cancel", style: "cancel" },
//         { 
//           text: "Accept", 
//           onPress: () => {
//             const updatedRequests = requests.map(req =>
//               req.id === id ? { ...req, status: 'Accepted' } : req
//             );
//             setRequests(updatedRequests);
//             Alert.alert("Request Accepted", "You can now view directions to the job.");
//           }
//         }
//       ]
//     );
//   };

//   const handleReject = (id) => {
//     Alert.alert(
//       "Reject Request",
//       "Do you want to reject this service request?",
//       [
//         { text: "Cancel", style: "cancel" },
//         { 
//           text: "Reject", 
//           onPress: () => {
//             const updatedRequests = requests.map(req =>
//               req.id === id ? { ...req, status: 'Rejected' } : req
//             );
//             setRequests(updatedRequests);
//             Alert.alert("Request Rejected", "The request has been removed from your list.");
//           }
//         }
//       ]
//     );
//   };

//   const handleComplete = (id) => {
//     Alert.alert(
//       "Mark Completed",
//       "Are you sure you want to mark this job as completed?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Yes",
//           onPress: () => {
//             const updatedRequests = requests.map(req =>
//               req.id === id ? { ...req, status: 'Completed' } : req
//             );
//             setRequests(updatedRequests);
//             Alert.alert("Job Completed", "You have successfully completed the job.");
//           }
//         }
//       ]
//     );
//   };

//   const renderItem = ({ item }) => (
//     <View className="bg-white rounded-xl p-4 mb-4 shadow-md">
//       {/* Header with status */}
//       <View className="flex-row justify-between items-center mb-3">
//         <Text className="text-lg font-semibold text-black">{item.type}</Text>
//         <View className={`px-2 py-1 rounded-xl ${
//           item.status === 'Pending' ? 'bg-yellow-100' : 
//           item.status === 'Accepted' ? 'bg-green-100' :
//           item.status === 'Rejected' ? 'bg-red-100' :
//           item.status === 'Completed' ? 'bg-blue-100' : ''
//         }`}>
//           <Text className={`text-xs font-semibold ${
//             item.status === 'Pending' ? 'text-yellow-500' :
//             item.status === 'Accepted' ? 'text-green-500' :
//             item.status === 'Rejected' ? 'text-red-500' :
//             item.status === 'Completed' ? 'text-blue-500' : ''
//           }`}>{item.status}</Text>
//         </View>
//       </View>

//       {/* Job Info */}
//       <View className="flex-row items-center mb-2">
//         <Ionicons name="calendar-outline" size={16} color="#6b7280" />
//         <Text className="text-gray-500 ml-2">{item.date}</Text>
//       </View>
//       <View className="flex-row items-center mb-2">
//         <Ionicons name="location-outline" size={16} color="#6b7280" />
//         <Text className="text-gray-500 ml-2">{item.location}</Text>
//       </View>
//       <View className="flex-row items-center mb-2">
//         <Ionicons name="person-outline" size={16} color="#6b7280" />
//         <Text className="text-gray-500 ml-2">{item.customer}</Text>
//       </View>

//       {/* Actions */}
//       {item.status === 'Pending' && (
//         <View className="flex-row justify-around mt-4">
//           <TouchableOpacity 
//             style={{backgroundColor: '#4CAF50', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8}}
//             onPress={() => handleAccept(item.id)}
//           >
//             <Text className="text-white font-bold">Accept</Text>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={{backgroundColor: '#f44336', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8}}
//             onPress={() => handleReject(item.id)}
//           >
//             <Text className="text-white font-bold">Reject</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {item.status === 'Accepted' && (
//         <View className="flex-row justify-around mt-4">
//           <TouchableOpacity 
//             style={{backgroundColor: '#2196F3', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8}}
//             onPress={() => navigation.navigate("MapScreen", { task: item, role: "mechanic" })}
//           >
//             <Text className="text-white font-bold">View on Map</Text>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={{backgroundColor: '#4CAF50', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8}}
//             onPress={() => handleComplete(item.id)}
//           >
//             <Text className="text-white font-bold">Mark Completed</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );

//   return (
//     <SafeAreaView className="flex-1 bg-gray-100">
//       {/* Garage Header */}
//       <View className="px-4 pt-4 mb-2">
//         <Text className="text-xl font-bold text-black">🚗 SuperMech Garage</Text>
//         <Text className="text-gray-500 mt-1 mb-2">Available jobs in your area</Text>
//       </View>

//       {/* Job List */}
//       <FlatList
//         data={requests}
//         renderItem={renderItem}
//         keyExtractor={item => item.id.toString()}
//         contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 20}}
//       />
//     </SafeAreaView>
//   );
// }


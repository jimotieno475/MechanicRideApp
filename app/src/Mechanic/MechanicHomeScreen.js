import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { API_URL, WS_URL } from '../config'; 
import { useUser } from '../contexts/UserContext';
import io from "socket.io-client";

export default function MechanicHomeScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { mechanic } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const socketRef = useRef(null);

  const fetchBookings = async () => {
    if (!mechanic) return;
    setRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/mechanics/${mechanic.id}/bookings`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Fetch bookings error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Function to make phone call
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

  const handleCallCustomer = (booking) => {
    if (!booking.customer?.phone) {
      Alert.alert("Error", "Customer phone number not available");
      return;
    }

    Alert.alert(
      `Call ${booking.customer.name}`,
      `Do you want to call ${booking.customer.phone}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call", onPress: () => makePhoneCall(booking.customer.phone, booking.customer.name) }
      ]
    );
  };

  // Setup Socket.IO for real-time updates
  useEffect(() => {
    if (isFocused) {
      fetchBookings();
    }

    if (mechanic) {
      if (!socketRef.current) {
         const socket = io(WS_URL, {
            transports: ["websocket"],
            query: { mechanic_id: mechanic.id }
          });
          socketRef.current = socket;

          socket.on("connect", () => {
            console.log("✅ Socket.IO connected for mechanic:", mechanic.id);
            socket.emit("join", { mechanic_id: mechanic.id });
          });

          socket.on("disconnect", () => {
            console.log("⚠️ Socket.IO disconnected");
          });

          socket.on("NEW_BOOKING", (booking) => {
            console.log("📩 NEW_BOOKING received:", booking);
            setRequests((prev) => [booking, ...prev.filter(req => req.id !== booking.id)]); 
            Alert.alert("New Booking", `A customer just booked a service: ${booking.type}`);
          });

          socket.on("BOOKING_UPDATED", (updatedBooking) => {
            console.log("🔄 BOOKING_UPDATED received:", updatedBooking);
            setRequests((prev) =>
              prev.map((req) => 
                req.id === updatedBooking.id ? 
                  { ...req, ...updatedBooking } : 
                  req
              )
            );
          });
      }

      return () => {
        // We will keep the socket alive
      };
    }
  }, [mechanic, isFocused]);

  // Unified function to handle booking actions
  const handleBookingAction = async (id, action) => {
    try {
      const res = await fetch(`${API_URL}/bookings/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.error || `HTTP error ${res.status}`);
      }

      // Update the state to reflect the change immediately
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status: action } : req
      ));

    } catch (err) {
      console.error(`${action} booking error:`, err);
      Alert.alert("Error", `Failed to ${action} booking: ${err.message}`);
    }
  };

  const handleReject = (id) => {
    Alert.alert(
      "Reject Request",
      "Do you want to reject this service request? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reject", onPress: () => handleBookingAction(id, 'Rejected') }
      ]
    );
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const renderItem = ({ item }) => {
    const showCallButton = ['Pending', 'Accepted', 'Completed'].includes(item.status);

    return (
      <View className="bg-white rounded-xl p-4 mb-4 shadow-md">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-black">{item.type || item.service?.name}</Text>
          <View className={`px-2 py-1 rounded-xl ${
            item.status === 'Pending' ? 'bg-yellow-100' :
            item.status === 'Accepted' ? 'bg-green-100' :
            item.status === 'Rejected' ? 'bg-red-100' :
            item.status === 'Completed' ? 'bg-blue-100' : ''
          }`}>
            <Text className={`text-xs font-semibold ${
              item.status === 'Pending' ? 'text-yellow-700' :
              item.status === 'Accepted' ? 'text-green-700' :
              item.status === 'Rejected' ? 'text-red-700' :
              item.status === 'Completed' ? 'text-blue-700' : ''
            }`}>{item.status}</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-2">
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text className="text-gray-500 ml-2">{formatDateTime(item.created_at)}</Text>
        </View>
        
        <View className="flex-row items-center mb-2">
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text className="text-gray-500 ml-2 flex-1">{item.location}</Text>
        </View>
        
        <View className="flex-row items-center mb-2">
          <Ionicons name="person-outline" size={16} color="#6b7280" />
          <Text className="text-gray-500 ml-2">Customer: {item.customer?.name || "N/A"}</Text>
        </View>

        {item.customer?.phone && (
          <View className="flex-row items-center mb-2">
            <Ionicons name="call-outline" size={16} color="#6b7280" />
            <Text className="text-gray-500 ml-2">Phone: {item.customer.phone}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row flex-wrap gap-2 mt-4">
          {/* Map Button */}
          <TouchableOpacity
            className="bg-blue-500 px-4 py-2 rounded-lg flex-1 min-w-[48%]"
            onPress={() => navigation.navigate("MechanicMapScreen", { task: item })} 
          >
            <Text className="text-white font-bold text-center text-xs">
              {item.status === 'Accepted' ? 'View Route' : 'View Map'}
            </Text>
          </TouchableOpacity>

          {/* Call Customer Button */}
          {showCallButton && item.customer?.phone && (
            <TouchableOpacity
              className="bg-green-500 px-4 py-2 rounded-lg flex-1 min-w-[48%]"
              onPress={() => handleCallCustomer(item)}
            >
              <Text className="text-white font-bold text-center text-xs">Call Customer</Text>
            </TouchableOpacity>
          )}

          {/* Status Action Buttons */}
          {item.status === 'Pending' && (
            <>
              <TouchableOpacity
                className="px-4 py-2 rounded-lg bg-red-500 flex-1 min-w-[48%]"
                onPress={() => handleReject(item.id)}
              >
                <Text className="text-white font-bold text-center text-xs">Reject</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity
                className="px-4 py-2 rounded-lg bg-green-500 flex-1 min-w-[48%]"
                onPress={() => handleBookingAction(item.id, 'Accepted')}
              >
                <Text className="text-white font-bold text-center text-xs">Accept</Text>
              </TouchableOpacity> */}
            </>
          )}
          
          {item.status === 'Accepted' && (
            <TouchableOpacity
              className="px-4 py-2 rounded-lg bg-green-700 flex-1 min-w-[48%]"
              onPress={() => handleBookingAction(item.id, 'Completed')}
            >
              <Text className="text-white font-bold text-center text-xs">Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

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
        data={requests.sort((a, b) => {
           const statusOrder = { 'Pending': 1, 'Accepted': 2, 'Completed': 3, 'Rejected': 4 };
           return (statusOrder[a.status] || 9) - (statusOrder[b.status] || 9) || 
                  new Date(b.created_at) - new Date(a.created_at);
        })}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchBookings} />
        }
        ListEmptyComponent={
          !loading && !refreshing && <Text className="text-center text-gray-500 mt-4">No jobs available</Text>
        }
      />
    </SafeAreaView>
  );
}

// import React, { useState, useEffect, useRef } from 'react';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation, useIsFocused } from '@react-navigation/native';
// import { API_URL, WS_URL } from '../config'; 
// import { useUser } from '../contexts/UserContext';
// import io from "socket.io-client";

// export default function MechanicHomeScreen() {
//   const navigation = useNavigation();
//   const isFocused = useIsFocused();
//   const { mechanic } = useUser();
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const socketRef = useRef(null);

//   const fetchBookings = async () => {
//     if (!mechanic) return;
//     setRefreshing(true);
//     try {
//       const res = await fetch(`${API_URL}/mechanics/${mechanic.id}/bookings`);
//       if (!res.ok) throw new Error(`HTTP error ${res.status}`);
//       const data = await res.json();
//       setRequests(data);
//     } catch (err) {
//       console.error("Fetch bookings error:", err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // Setup Socket.IO for real-time updates
//   useEffect(() => {
//     if (isFocused) {
//       fetchBookings();
//     }

//     if (mechanic) {
//       if (!socketRef.current) {
//          const socket = io(WS_URL, {
//             transports: ["websocket"],
//             query: { mechanic_id: mechanic.id }
//           });
//           socketRef.current = socket;

//           socket.on("connect", () => {
//             console.log("✅ Socket.IO connected for mechanic:", mechanic.id);
//             socket.emit("join", { mechanic_id: mechanic.id });
//           });

//           socket.on("disconnect", () => {
//             console.log("⚠️ Socket.IO disconnected");
//           });

//           socket.on("NEW_BOOKING", (booking) => {
//             console.log("📩 NEW_BOOKING received:", booking);
//             setRequests((prev) => [booking, ...prev.filter(req => req.id !== booking.id)]); 
//             Alert.alert("New Booking", `A customer just booked a service: ${booking.type}`);
//           });

//           socket.on("BOOKING_UPDATED", (updatedBooking) => {
//             console.log("🔄 BOOKING_UPDATED received:", updatedBooking);
//             setRequests((prev) =>
//               prev.map((req) => 
//                 req.id === updatedBooking.id ? 
//                   { ...req, ...updatedBooking } : 
//                   req
//               )
//             );
//           });
//       }

//       return () => {
//         // We will keep the socket alive
//       };
//     }
//   }, [mechanic, isFocused]);

//   // Unified function to handle booking actions
//   const handleBookingAction = async (id, action) => {
//     try {
//       const res = await fetch(`${API_URL}/bookings/${id}/action`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ action })
//       });
//       if (!res.ok) {
//          const errorData = await res.json();
//          throw new Error(errorData.error || `HTTP error ${res.status}`);
//       }

//       // === FIX: CLIENT-SIDE UPDATE FOR INSTANT FEEDBACK ===
//       // Manually update the state to reflect the change immediately.
//       // The Socket.IO event will serve as a double-check.
//       setRequests(prev => prev.map(req => 
//         req.id === id ? { ...req, status: action } : req
//       ));
//       // ===================================================

//     } catch (err) {
//       console.error(`${action} booking error:`, err);
//       Alert.alert("Error", `Failed to ${action} booking: ${err.message}`);
//     }
//   };

//   const handleReject = (id) => {
//     Alert.alert(
//       "Reject Request",
//       "Do you want to reject this service request? This action cannot be undone.",
//       [
//         { text: "Cancel", style: "cancel" },
//         { text: "Reject", onPress: () => handleBookingAction(id, 'Rejected') }
//       ]
//     );
//   };

//   const renderItem = ({ item }) => (
//     <View className="bg-white rounded-xl p-4 mb-4 shadow-md">
//       <View className="flex-row justify-between items-center mb-3">
//         <Text className="text-lg font-semibold text-black">{item.type || item.service?.name}</Text>
//         <View className={`px-2 py-1 rounded-xl ${
//           item.status === 'Pending' ? 'bg-yellow-100' :
//           item.status === 'Accepted' ? 'bg-green-100' :
//           item.status === 'Rejected' ? 'bg-red-100' :
//           item.status === 'Completed' ? 'bg-blue-100' : ''
//         }`}>
//           <Text className={`text-xs font-semibold ${
//             item.status === 'Pending' ? 'text-yellow-700' :
//             item.status === 'Accepted' ? 'text-green-700' :
//             item.status === 'Rejected' ? 'text-red-700' :
//             item.status === 'Completed' ? 'text-blue-700' : ''
//           }`}>{item.status}</Text>
//         </View>
//       </View>

//       <View className="flex-row items-center mb-2">
//         <Ionicons name="calendar-outline" size={16} color="#6b7280" />
//         <Text className="text-gray-500 ml-2">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</Text>
//       </View>
//       <View className="flex-row items-center mb-2">
//         <Ionicons name="location-outline" size={16} color="#6b7280" />
//         <Text className="text-gray-500 ml-2">{item.location}</Text>
//       </View>
//       <View className="flex-row items-center mb-2">
//         <Ionicons name="person-outline" size={16} color="#6b7280" />
//         <Text className="text-gray-500 ml-2">Customer: {item.customer?.name || "N/A"}</Text>
//       </View>

//       <View className="flex-row justify-around mt-4">
//         <TouchableOpacity
//           className="bg-blue-500 px-4 py-2 rounded-lg"
//           onPress={() => navigation.navigate("MechanicMapScreen", { task: item })} 
//         >
//           <Text className="text-white font-bold text-center">
//             {item.status === 'Accepted' ? 'View Route' : 'View on Map'}
//           </Text>
//         </TouchableOpacity>

//         {item.status === 'Pending' && (
//           <>
//             <TouchableOpacity
//               className="px-4 py-2 rounded-lg bg-red-500"
//               onPress={() => handleReject(item.id)}
//             >
//               <Text className="text-white font-bold text-center">Reject</Text>
//             </TouchableOpacity>
//             {/* <TouchableOpacity
//               className="px-4 py-2 rounded-lg bg-green-500"
//               onPress={() => handleBookingAction(item.id, 'Accepted')}
//             >
//               <Text className="text-white font-bold text-center">Accept</Text>
//             </TouchableOpacity> */}
//           </>
//         )}
//         {item.status === 'Accepted' && (
//           <TouchableOpacity
//             className="px-4 py-2 rounded-lg bg-green-700"
//             onPress={() => handleBookingAction(item.id, 'Completed')}
//           >
//             <Text className="text-white font-bold text-center">Complete</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView className="flex-1 bg-gray-100">
//       <View className="px-4 pt-4 mb-2">
//         <Text className="text-xl font-bold text-black">
//           🚗 {mechanic?.garage_name || "Your Garage"}
//         </Text>
//         <Text className="text-gray-500 mt-1 mb-2">
//           Available jobs in your area
//         </Text>
//       </View>

//       <FlatList
//         data={requests.sort((a, b) => {
//            const statusOrder = { 'Pending': 1, 'Accepted': 2, 'Completed': 3, 'Rejected': 4 };
//            return (statusOrder[a.status] || 9) - (statusOrder[b.status] || 9) || 
//                   new Date(b.created_at) - new Date(a.created_at);
//         })}
//         renderItem={renderItem}
//         keyExtractor={item => item.id.toString()}
//         contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={fetchBookings} />
//         }
//         ListEmptyComponent={
//           !loading && !refreshing && <Text className="text-center text-gray-500 mt-4">No jobs available</Text>
//         }
//       />
//     </SafeAreaView>
//   );
// }


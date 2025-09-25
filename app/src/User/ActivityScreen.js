// File: src/User/ActivityScreen.js
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, ActivityIndicator, Alert, RefreshControl,TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../contexts/UserContext';
import { API_URL } from '../config';

export default function ActivityScreen() {
  const { user } = useUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user's bookings
  const fetchBookings = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // Since we don't have a specific endpoint for user bookings, we'll fetch all and filter
      const response = await fetch(`${API_URL}/bookings`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const allBookings = await response.json();
      
      // Filter bookings for the current user
      const userBookings = allBookings.filter(booking => 
        booking.customer?.id === user.id
      );
      
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load activities');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, [user?.id]);

  // Refresh function
  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  // Format date from created_at field
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get status color and styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed':
        return {
          backgroundColor: 'rgba(92, 184, 92, 0.15)',
          color: '#5cb85c'
        };
      case 'Canceled':
      case 'Rejected':
        return {
          backgroundColor: 'rgba(217, 83, 79, 0.15)',
          color: '#d9534f'
        };
      case 'Pending':
        return {
          backgroundColor: 'rgba(66, 139, 202, 0.15)',
          color: '#428bca'
        };
      case 'Accepted':
        return {
          backgroundColor: 'rgba(240, 173, 78, 0.15)',
          color: '#f0ad4e'
        };
      case 'In Progress':
        return {
          backgroundColor: 'rgba(91, 192, 222, 0.15)',
          color: '#5bc0de'
        };
      default:
        return {
          backgroundColor: 'rgba(153, 153, 153, 0.15)',
          color: '#999'
        };
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>My Activities</Text>
          <Text style={{ color: '#6B7280', marginTop: 4 }}>Your ongoing and previous services</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading activities...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (bookings.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>My Activities</Text>
          <Text style={{ color: '#6B7280', marginTop: 4 }}>Your ongoing and previous services</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
          <Ionicons name="document-text-outline" size={64} color="#9CA3AF" />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#6B7280', marginTop: 16 }}>
            No activities yet
          </Text>
          <Text style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>
            Your booking history will appear here once you start using our services.
          </Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 16 }}
            onPress={handleRefresh}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>My Activities</Text>
        <Text style={{ color: '#6B7280', marginTop: 4 }}>
          {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found
        </Text>
      </View>
      
      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 16, marginTop: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
          />
        }
      >
        {bookings.map((booking) => {
          const statusStyle = getStatusStyle(booking.status);
          
          return (
            <View 
              key={booking.id} 
              style={{ 
                backgroundColor: 'white', 
                borderRadius: 12, 
                padding: 16, 
                marginBottom: 16, 
                shadowColor: '#000', 
                shadowOffset: { width: 0, height: 2 }, 
                shadowOpacity: 0.1, 
                shadowRadius: 4, 
                elevation: 3 
              }}
            >
              {/* Header row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: 'black' }}>
                  {booking.type || 'Service Booking'}
                </Text>
                <View style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: statusStyle.backgroundColor
                }}>
                  <Text style={{ 
                    fontSize: 12, 
                    fontWeight: '600', 
                    color: statusStyle.color
                  }}>
                    {booking.status}
                  </Text>
                </View>
              </View>
              
              {/* Details */}
              <View style={{ rowGap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="calendar" size={16} color="#6b7280" />
                  <Text style={{ color: '#6B7280', marginLeft: 8 }}>
                    {formatDate(booking.created_at)}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="location" size={16} color="#6b7280" />
                  <Text style={{ color: '#6B7280', marginLeft: 8, flex: 1 }}>
                    {booking.location || 'Location not specified'}
                  </Text>
                </View>
                
                {booking.mechanic && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="person" size={16} color="#6b7280" />
                    <Text style={{ color: '#6B7280', marginLeft: 8 }}>
                      {booking.mechanic.name || 'Mechanic'}
                    </Text>
                  </View>
                )}
                
                {booking.mechanic?.garage_name && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="business" size={16} color="#6b7280" />
                    <Text style={{ color: '#6B7280', marginLeft: 8 }}>
                      {booking.mechanic.garage_name}
                    </Text>
                  </View>
                )}
                
                {booking.service && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="construct" size={16} color="#6b7280" />
                    <Text style={{ color: '#6B7280', marginLeft: 8 }}>
                      {booking.service.name}
                    </Text>
                  </View>
                )}
                
                {/* Additional booking information */}
                <View style={{ 
                  marginTop: 8, 
                  paddingTop: 8, 
                  borderTopWidth: 1, 
                  borderTopColor: '#F3F4F6' 
                }}>
                  <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
                    Booking ID: #{booking.id}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
        
        {/* End of list message */}
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
            {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} total
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}



// // File: src/User/ActivityScreen.js
// import React from 'react';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { View, Text, ScrollView } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';

// const activities = [
//   { 
//     id: 1, 
//     type: "Engine Repair", 
//     date: "Sep 15, 2025", 
//     status: "Completed", 
//     price: "KES 30,000",
//     mechanic: "John's Auto Shop"
//   },
//   { 
//     id: 2, 
//     type: "Oil Change", 
//     date: "Sep 28, 2025", 
//     status: "Canceled", 
//     price: "KES 5,000",
//     mechanic: "Quick Lube Center"
//   },
//   { 
//     id: 3, 
//     type: "Tire Replacement", 
//     date: "Oct 2, 2025", 
//     status: "In Progress", 
//     price: "KES 20,000",
//     mechanic: "Tire Masters"
//   },
//   { 
//     id: 4, 
//     type: "Battery Jumpstart", 
//     date: "Oct 5, 2025", 
//     status: "Completed", 
//     price: "KES 4,500",
//     mechanic: "PowerStart Mechanics"
//   },
//   { 
//     id: 5, 
//     type: "Brake Pads Change", 
//     date: "Oct 10, 2025", 
//     status: "Pending", 
//     price: "KES 12,000",
//     mechanic: "BrakeCare Experts"
//   },
//   { 
//     id: 6, 
//     type: "Car Diagnostics", 
//     date: "Oct 15, 2025", 
//     status: "Completed", 
//     price: "KES 6,500",
//     mechanic: "AutoCheck Garage"
//   },
// ];

// export default function ActivityScreen() {
//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
//       <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
//         <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>My Activities</Text>
//         <Text style={{ color: '#6B7280', marginTop: 4 }}>Your ongoing and previous services</Text>
//       </View>
      
//       <ScrollView style={{ flex: 1, paddingHorizontal: 16, marginTop: 12 }}>
//         {activities.map((activity) => (
//           <View 
//             key={activity.id} 
//             style={{ 
//               backgroundColor: 'white', 
//               borderRadius: 12, 
//               padding: 16, 
//               marginBottom: 16, 
//               shadowColor: '#000', 
//               shadowOffset: { width: 0, height: 2 }, 
//               shadowOpacity: 0.1, 
//               shadowRadius: 4, 
//               elevation: 3 
//             }}
//           >
//             {/* Header row */}
//             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
//               <Text style={{ fontSize: 18, fontWeight: '600', color: 'black' }}>{activity.type}</Text>
//               <View style={{
//                 paddingHorizontal: 8,
//                 paddingVertical: 4,
//                 borderRadius: 12,
//                 backgroundColor: activity.status === "Completed" ? 'rgba(92, 184, 92, 0.15)' : 
//                                  activity.status === "Canceled" ? 'rgba(217, 83, 79, 0.15)' :
//                                  activity.status === "Pending" ? 'rgba(66, 139, 202, 0.15)' :
//                                  'rgba(240, 173, 78, 0.15)'
//               }}>
//                 <Text style={{ 
//                   fontSize: 12, 
//                   fontWeight: '600', 
//                   color: activity.status === "Completed" ? '#5cb85c' : 
//                          activity.status === "Canceled" ? '#d9534f' :
//                          activity.status === "Pending" ? '#428bca' :
//                          '#f0ad4e' 
//                 }}>
//                   {activity.status}
//                 </Text>
//               </View>
//             </View>
            
//             {/* Details */}
//             <View style={{ rowGap: 8 }}>
//               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                 <Ionicons name="calendar" size={16} color="#6b7280" />
//                 <Text style={{ color: '#6B7280', marginLeft: 8 }}>{activity.date}</Text>
//               </View>
//               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                 <Ionicons name="person" size={16} color="#6b7280" />
//                 <Text style={{ color: '#6B7280', marginLeft: 8 }}>{activity.mechanic}</Text>
//               </View>
//               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                 <Ionicons name="pricetag" size={16} color="#6b7280" />
//                 <Text style={{ color: '#6B7280', marginLeft: 8 }}>{activity.price}</Text>
//               </View>
//             </View>
//           </View>
//         ))}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

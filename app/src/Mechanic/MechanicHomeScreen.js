// File: src/Mechanic/MechanicHomeScreen.js
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Example requests (simulate from backend)
const serviceRequests = [
  { 
    id: 1, 
    type: "Engine Repair", 
    date: "Oct 28, 2023", 
    location: "123 Main St", 
    status: "Pending",
    customer: "Alice Johnson",
    latitude: -1.295,
    longitude: 36.822,
  },
  { 
    id: 2, 
    type: "Brake Replacement", 
    date: "Oct 29, 2023", 
    location: "456 Elm St", 
    status: "Pending",
    customer: "Bob Williams",
    latitude: -1.292,
    longitude: 36.821,
  },
  { 
    id: 3, 
    type: "Tire Change", 
    date: "Oct 30, 2023", 
    location: "789 Oak St", 
    status: "Pending",
    customer: "Catherine Davis",
    latitude: -1.298,
    longitude: 36.823,
  },
];

export default function MechanicHomeScreen() {
  const navigation = useNavigation();
  const [requests, setRequests] = useState(serviceRequests);

  useEffect(() => {
    // Simulate fetch from backend
    setTimeout(() => {
      setRequests(serviceRequests);
    }, 500);
  }, []);

  const handleAccept = (id) => {
    Alert.alert(
      "Accept Request",
      "Do you want to accept this service request?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Accept", 
          onPress: () => {
            const updatedRequests = requests.map(req =>
              req.id === id ? { ...req, status: 'Accepted' } : req
            );
            setRequests(updatedRequests);
            Alert.alert("Request Accepted", "You can now view directions to the job.");
          }
        }
      ]
    );
  };

  const handleReject = (id) => {
    Alert.alert(
      "Reject Request",
      "Do you want to reject this service request?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reject", 
          onPress: () => {
            const updatedRequests = requests.map(req =>
              req.id === id ? { ...req, status: 'Rejected' } : req
            );
            setRequests(updatedRequests);
            Alert.alert("Request Rejected", "The request has been removed from your list.");
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-md">
      {/* Header with status */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-black">{item.type}</Text>
        <View className={`px-2 py-1 rounded-xl ${
          item.status === 'Pending' ? 'bg-yellow-100' : 
          item.status === 'Accepted' ? 'bg-green-100' :
          item.status === 'Rejected' ? 'bg-red-100' : ''
        }`}>
          <Text className={`text-xs font-semibold ${
            item.status === 'Pending' ? 'text-yellow-500' :
            item.status === 'Accepted' ? 'text-green-500' :
            item.status === 'Rejected' ? 'text-red-500' : ''
          }`}>{item.status}</Text>
        </View>
      </View>

      {/* Job Info */}
      <View className="flex-row items-center mb-2">
        <Ionicons name="calendar-outline" size={16} color="#6b7280" />
        <Text className="text-gray-500 ml-2">{item.date}</Text>
      </View>
      <View className="flex-row items-center mb-2">
        <Ionicons name="location-outline" size={16} color="#6b7280" />
        <Text className="text-gray-500 ml-2">{item.location}</Text>
      </View>
      <View className="flex-row items-center mb-2">
        <Ionicons name="person-outline" size={16} color="#6b7280" />
        <Text className="text-gray-500 ml-2">{item.customer}</Text>
      </View>

      {/* Actions */}
      {item.status === 'Pending' && (
        <View className="flex-row justify-around mt-4">
          <TouchableOpacity 
            style={{backgroundColor: '#4CAF50', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8}}
            onPress={() => handleAccept(item.id)}
          >
            <Text className="text-white font-bold">Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{backgroundColor: '#f44336', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8}}
            onPress={() => handleReject(item.id)}
          >
            <Text className="text-white font-bold">Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'Accepted' && (
        <View className="flex-row justify-around mt-4">
          <TouchableOpacity 
            style={{backgroundColor: '#2196F3', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8}}
            onPress={() => navigation.navigate("MapScreen", { task: item })}
          >
            <Text className="text-white font-bold">View on Map</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{backgroundColor: '#4CAF50', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8}}
          >
            <Text className="text-white font-bold">Mark Completed</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Garage Header */}
      <View className="px-4 pt-4 mb-2">
        <Text className="text-xl font-bold text-black">🚗 SuperMech Garage</Text>
        <Text className="text-gray-500 mt-1 mb-2">Available jobs in your area</Text>
      </View>

      {/* Job List */}
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 20}}
      />
    </SafeAreaView>
  );
}


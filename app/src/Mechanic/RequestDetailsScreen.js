// File: src/Mechanic/RequestDetailsScreen.js
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

const serviceRequests = [
  { 
    id: 1, 
    type: "Engine Repair", 
    date: "Oct 28, 2023", 
    location: "123 Main St", 
    status: "Pending",
    customer: "Alice Johnson",
    description: "Customer states engine is making knocking noise.",
    vehicle: "2015 Honda Civic",
    price: "$300 - $500"
  },
  { 
    id: 2, 
    type: "Brake Replacement", 
    date: "Oct 29, 2023", 
    location: "456 Elm St", 
    status: "Pending",
    customer: "Bob Williams",
    description: "Customer reports squealing brakes.",
    vehicle: "2018 Toyota Camry",
    price: "$200 - $400"
  },
  { 
    id: 3, 
    type: "Tire Change", 
    date: "Oct 30, 2023", 
    location: "789 Oak St", 
    status: "Pending",
    customer: "Catherine Davis",
    description: "Customer has a flat tire.",
    vehicle: "2020 Ford F-150",
    price: "$50 - $100"
  },
];

export default function RequestDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { requestId } = route.params;
  const request = serviceRequests.find(req => req.id === requestId);
  const [status, setStatus] = useState(request?.status || 'Pending');

  const handleAccept = () => {
    Alert.alert(
      "Accept Request",
      "Are you sure you want to accept this service request?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Accept", 
          onPress: () => {
            setStatus('Accepted');
            Alert.alert("Request Accepted", "You have accepted this service request.");
          }
        }
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      "Reject Request",
      "Are you sure you want to reject this service request?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Reject", 
          onPress: () => {
            setStatus('Rejected');
            Alert.alert("Request Rejected", "You have rejected this service request.");
          }
        }
      ]
    );
  };

  if (!request) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <Text>Request not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView contentContainerStyle={{padding: 16}}>
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 16}}>
            <Ionicons name="arrow-back" size={24} color="#007bff" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black">{request.type}</Text>
        </View>

        <View className="bg-white rounded-xl p-6 mb-6 shadow-md">
          <View className="flex-row items-center mb-4">
            <Ionicons name="person-outline" size={20} color="#6b7280" style={{marginRight: 8}} />
            <Text className="text-gray-700 font-bold">Customer:</Text>
            <Text className="text-gray-600 ml-2">{request.customer}</Text>
          </View>

          <View className="flex-row items-center mb-4">
            <Ionicons name="calendar-outline" size={20} color="#6b7280" style={{marginRight: 8}} />
            <Text className="text-gray-700 font-bold">Date:</Text>
            <Text className="text-gray-600 ml-2">{request.date}</Text>
          </View>

          <View className="flex-row items-center mb-4">
            <Ionicons name="location-outline" size={20} color="#6b7280" style={{marginRight: 8}} />
            <Text className="text-gray-700 font-bold">Location:</Text>
            <Text className="text-gray-600 ml-2">{request.location}</Text>
          </View>

          <View className="flex-row items-center mb-4">
            <Ionicons name="car-outline" size={20} color="#6b7280" style={{marginRight: 8}} />
            <Text className="text-gray-700 font-bold">Vehicle:</Text>
            <Text className="text-gray-600 ml-2">{request.vehicle}</Text>
          </View>

          <View className="flex-row items-center mb-4">
            <Ionicons name="pricetag-outline" size={20} color="#6b7280" style={{marginRight: 8}} />
            <Text className="text-gray-700 font-bold">Estimated Price:</Text>
            <Text className="text-gray-600 ml-2">{request.price}</Text>
          </View>

          <View>
            <Text className="text-gray-700 font-bold mb-2">Description:</Text>
            <Text className="text-gray-600">{request.description}</Text>
          </View>
        </View>

        <View className="flex-row justify-around">
          {status === 'Pending' && (
            <>
              <TouchableOpacity style={{backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8}} onPress={handleAccept}>
                <Text className="text-white font-bold">Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{backgroundColor: '#f44336', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8}} onPress={handleReject}>
                <Text className="text-white font-bold">Reject</Text>
              </TouchableOpacity>
            </>
          )}

          {status !== 'Pending' && (
            <View style={{alignItems: 'center'}}>
              <Text className="text-lg font-bold text-gray-600">Status: {status}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
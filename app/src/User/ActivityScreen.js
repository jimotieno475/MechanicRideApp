// File: src/User/ActivityScreen.js
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const activities = [
  { 
    id: 1, 
    type: "Engine Repair", 
    date: "Oct 15, 2023", 
    status: "Completed", 
    price: "$300",
    mechanic: "John's Auto Shop"
  },
  { 
    id: 2, 
    type: "Oil Change", 
    date: "Sep 28, 2023", 
    status: "Canceled", 
    price: "$50",
    mechanic: "Quick Lube Center"
  },
  { 
    id: 3, 
    type: "Tire Replacement", 
    date: "In Progress", 
    status: "Ongoing", 
    price: "$200",
    mechanic: "Tire Masters"
  },
];

export default function ActivityScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>My Activities</Text>
        <Text style={{ color: '#6B7280', marginTop: 4 }}>Your ongoing and previous services</Text>
      </View>
      
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {activities.map((activity) => (
          <View key={activity.id} style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: 'semibold', color: 'black' }}>{activity.type}</Text>
              <View style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                backgroundColor: activity.status === "Completed" ? 'rgba(92, 184, 92, 0.2)' : 
                                 activity.status === "Canceled" ? 'rgba(217, 83, 79, 0.2)' :
                                 'rgba(240, 173, 78, 0.2)'
              }}>
                <Text style={{ fontSize: 12, fontWeight: 'semibold', 
                               color: activity.status === "Completed" ? '#5cb85c' : 
                                      activity.status === "Canceled" ? '#d9534f' : 
                                      '#f0ad4e' }}>{activity.status}</Text>
              </View>
            </View>
            
            <View style={{ spaceY: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="calendar" size={16} color="#6b7280" />
                <Text style={{ color: '#6B7280', marginLeft: 8 }}>{activity.date}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="person" size={16} color="#6b7280" />
                <Text style={{ color: '#6B7280', marginLeft: 8 }}>{activity.mechanic}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="pricetag" size={16} color="#6b7280" />
                <Text style={{ color: '#6B7280', marginLeft: 8 }}>{activity.price}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
// File: src/User/ActivityScreen.js
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const activities = [
  { 
    id: 1, 
    type: "Engine Repair", 
    date: "Sep 15, 2025", 
    status: "Completed", 
    price: "KES 30,000",
    mechanic: "John's Auto Shop"
  },
  { 
    id: 2, 
    type: "Oil Change", 
    date: "Sep 28, 2025", 
    status: "Canceled", 
    price: "KES 5,000",
    mechanic: "Quick Lube Center"
  },
  { 
    id: 3, 
    type: "Tire Replacement", 
    date: "Oct 2, 2025", 
    status: "In Progress", 
    price: "KES 20,000",
    mechanic: "Tire Masters"
  },
  { 
    id: 4, 
    type: "Battery Jumpstart", 
    date: "Oct 5, 2025", 
    status: "Completed", 
    price: "KES 4,500",
    mechanic: "PowerStart Mechanics"
  },
  { 
    id: 5, 
    type: "Brake Pads Change", 
    date: "Oct 10, 2025", 
    status: "Pending", 
    price: "KES 12,000",
    mechanic: "BrakeCare Experts"
  },
  { 
    id: 6, 
    type: "Car Diagnostics", 
    date: "Oct 15, 2025", 
    status: "Completed", 
    price: "KES 6,500",
    mechanic: "AutoCheck Garage"
  },
];

export default function ActivityScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>My Activities</Text>
        <Text style={{ color: '#6B7280', marginTop: 4 }}>Your ongoing and previous services</Text>
      </View>
      
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, marginTop: 12 }}>
        {activities.map((activity) => (
          <View 
            key={activity.id} 
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
              <Text style={{ fontSize: 18, fontWeight: '600', color: 'black' }}>{activity.type}</Text>
              <View style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                backgroundColor: activity.status === "Completed" ? 'rgba(92, 184, 92, 0.15)' : 
                                 activity.status === "Canceled" ? 'rgba(217, 83, 79, 0.15)' :
                                 activity.status === "Pending" ? 'rgba(66, 139, 202, 0.15)' :
                                 'rgba(240, 173, 78, 0.15)'
              }}>
                <Text style={{ 
                  fontSize: 12, 
                  fontWeight: '600', 
                  color: activity.status === "Completed" ? '#5cb85c' : 
                         activity.status === "Canceled" ? '#d9534f' :
                         activity.status === "Pending" ? '#428bca' :
                         '#f0ad4e' 
                }}>
                  {activity.status}
                </Text>
              </View>
            </View>
            
            {/* Details */}
            <View style={{ rowGap: 8 }}>
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

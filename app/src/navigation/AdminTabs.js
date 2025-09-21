import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AdminDashboard from '../admin/AdminDashboard';
import UsersListScreen from '../admin/UsersListScreen';
import MechanicsListScreen from '../admin/MechanicsListScreen';
import ReportsScreen from '../admin/ReportsScreen';
import JobsAdmin from '../admin/JobsAdmin';
import UsersAdmin from '../admin/UsersAdmin';
import AnalyticsAdmin from '../admin/AnalyticsAdmin';
import MechanicDetailsScreen from '../admin/MechanicDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AdminDashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: 'black' }, headerTintColor: 'white' }}>
      <Stack.Screen name="AdminDashboardScreen" component={AdminDashboard} options={{ title: 'Dashboard' }} />
      {/* These screens are now correctly defined in this stack */}
      <Stack.Screen name="JobDetails" component={JobsAdmin} options={{ title: 'Job Details' }} />
      <Stack.Screen name="UserDetails" component={UsersAdmin} options={{ title: 'User Details' }} />
      <Stack.Screen name="Analytics" component={AnalyticsAdmin} options={{ title: 'Analytics' }} />
      <Stack.Screen name="MechanicDetails" component={MechanicDetailsScreen} options={{ title: 'Mechanic Details' }} />
    </Stack.Navigator>
  );
}

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Users') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Mechanics') iconName = focused ? 'construct' : 'construct-outline';
          else if (route.name === 'Reports') iconName = focused ? 'document' : 'document-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: 'black', borderTopColor: 'gray' },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardStack} />
      <Tab.Screen name="Users" component={UsersListScreen} />
      <Tab.Screen name="Mechanics" component={MechanicsListScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
    </Tab.Navigator>
  );
}





// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
// import UsersAdmin from '../admin/UsersAdmin';
// import JobsAdmin from '../admin/JobsAdmin';
// import AnalyticsAdmin from '../admin/AnalyticsAdmin';

// export default function AdminDashboard() {
//   const [activeTab, setActiveTab] = useState('Users');

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'Users':
//         return <UsersAdmin />;
//       case 'Jobs':
//         return <JobsAdmin />;
//       case 'Analytics':
//         return <AnalyticsAdmin />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-black">
//       {/* Header and Title */}
//       <View className="p-4 border-b border-gray-700">
//         <Text className="text-white text-2xl font-bold text-center">Admin Dashboard</Text>
//       </View>
      
//       {/* Navigation Tabs */}
//       <View className="flex-row justify-around bg-gray-900 p-2">
//         <TouchableOpacity
//           className={`py-2 px-4 rounded-full ${activeTab === 'Users' ? 'bg-white' : ''}`}
//           onPress={() => setActiveTab('Users')}
//         >
//           <Text className={`${activeTab === 'Users' ? 'text-black font-semibold' : 'text-gray-400'}`}>Users</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           className={`py-2 px-4 rounded-full ${activeTab === 'Jobs' ? 'bg-white' : ''}`}
//           onPress={() => setActiveTab('Jobs')}
//         >
//           <Text className={`${activeTab === 'Jobs' ? 'text-black font-semibold' : 'text-gray-400'}`}>Jobs</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           className={`py-2 px-4 rounded-full ${activeTab === 'Analytics' ? 'bg-white' : ''}`}
//           onPress={() => setActiveTab('Analytics')}
//         >
//           <Text className={`${activeTab === 'Analytics' ? 'text-black font-semibold' : 'text-gray-400'}`}>Analytics</Text>
//         </TouchableOpacity>
//       </View>
      
//       {/* Main Content Area */}
//       <ScrollView className="flex-1 p-4">
//         {renderContent()}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

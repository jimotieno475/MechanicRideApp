// File: src/Admin/ReportsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../config";
import { useUser } from "../contexts/UserContext";

export default function ReportsScreen() {
  const navigation = useNavigation();
  const { admin } = useUser();
  
  const [analytics, setAnalytics] = useState({
    total_users: 0,
    total_mechanics: 0,
    total_bookings: 0,
    active_bookings: 0,
    pending_bookings: 0,
    completed_bookings: 0,
    recent_bookings: 0
  });
  const [fraudReports, setFraudReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch reports data from backend
  const fetchReportsData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch(`${API_URL}/admin/reports/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!statsResponse.ok) {
        throw new Error(`HTTP error! status: ${statsResponse.status}`);
      }

      const statsData = await statsResponse.json();
      setAnalytics(statsData.stats);

      // Fetch fraud reports with detailed information
      const fraudResponse = await fetch(`${API_URL}/admin/reports/fraud-reports`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (fraudResponse.ok) {
        const fraudData = await fraudResponse.json();
        console.log('Raw fraud reports data:', fraudData); // Debug log
        
        // Transform the data to ensure consistent structure
        const transformedReports = fraudData.map(report => ({
          id: report.id,
          // User information - handle different possible structures
          user: report.user || { 
            id: report.user_id, 
            name: report.user_name || "Unknown User",
            email: report.user_email || "",
            phone: report.user_phone || ""
          },
          // Mechanic information - handle different possible structures
          mechanic: report.mechanic || {
            id: report.mechanic_id,
            name: report.mechanic_name || "Unknown Mechanic", 
            garage_name: report.mechanic_garage_name || "",
            email: report.mechanic_email || "",
            phone: report.mechanic_phone || ""
          },
          // Booking information
          booking: report.booking,
          reason: report.reason,
          description: report.description,
          status: report.status,
          severity: report.severity,
          created_at: report.created_at,
          updated_at: report.updated_at,
          resolved_at: report.resolved_at,
          resolution_notes: report.resolution_notes,
          resolved_by: report.resolved_by
        }));
        
        console.log('Transformed fraud reports:', transformedReports);
        setFraudReports(transformedReports);
      } else {
        console.error('Failed to fetch fraud reports:', fraudResponse.status);
        Alert.alert("Error", "Failed to load fraud reports");
      }

    } catch (error) {
      console.error("Error fetching reports:", error);
      Alert.alert("Error", "Failed to fetch reports data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Safe function to get mechanic ID from report
  const getMechanicId = (report) => {
    if (report.mechanic && report.mechanic.id) {
      return report.mechanic.id;
    }
    if (report.mechanic_id) {
      return report.mechanic_id;
    }
    console.error('No mechanic ID found in report:', report);
    return null;
  };

  // Block mechanic based on fraud report
  const blockMechanic = async (report) => {
    const mechanicId = getMechanicId(report);
    
    if (!mechanicId) {
      Alert.alert("Error", "Mechanic ID not found in report");
      return;
    }

    const mechanicName = report.mechanic?.name || 'this mechanic';
    
    Alert.alert(
      "Confirm Block",
      `Are you sure you want to block ${mechanicName} due to this fraud report?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            try {
              console.log('Blocking mechanic with ID:', mechanicId);
              
              // Block the mechanic
              const response = await fetch(`${API_URL}/admin/mechanics/${mechanicId}/status`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                  status: "inactive",
                  admin_id: admin?.id 
                }),
              });

              console.log('Block mechanic response status:', response.status);
              
              if (response.ok) {
                // Update fraud report status via backend
                const resolveResponse = await fetch(`${API_URL}/admin/reports/fraud-reports/${report.id}/resolve`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    action: "block_mechanic",
                    resolution_notes: "Mechanic blocked due to fraud report",
                    admin_id: admin?.id
                  }),
                });

                console.log('Resolve report response status:', resolveResponse.status);
                
                if (resolveResponse.ok) {
                  // Refresh data to get updated status
                  fetchReportsData();
                  Alert.alert("Success", `${mechanicName} has been blocked and report resolved`);
                } else {
                  const errorText = await resolveResponse.text();
                  console.error('Resolve report error:', errorText);
                  throw new Error("Failed to update report status");
                }
              } else {
                const errorText = await response.text();
                console.error('Block mechanic error:', errorText);
                throw new Error("Failed to block mechanic");
              }
            } catch (error) {
              console.error("Error blocking mechanic:", error);
              Alert.alert("Error", error.message || "Failed to block mechanic");
            }
          },
        },
      ]
    );
  };

  // Dismiss report
  const dismissReport = async (report) => {
    Alert.alert(
      "Dismiss Report",
      "Are you sure you want to dismiss this fraud report?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Dismiss",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/admin/reports/fraud-reports/${report.id}/resolve`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  action: "dismiss",
                  resolution_notes: "Report dismissed by admin",
                  admin_id: admin?.id
                }),
              });

              if (response.ok) {
                fetchReportsData();
                Alert.alert("Success", "Report has been dismissed");
              } else {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to dismiss report");
              }
            } catch (error) {
              console.error("Error dismissing report:", error);
              Alert.alert("Error", error.message || "Failed to dismiss report");
            }
          },
        },
      ]
    );
  };

  // Resolve report (mark as resolved without blocking)
  const resolveReport = async (report) => {
    Alert.alert(
      "Resolve Report",
      "Mark this report as resolved?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Resolve",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/admin/reports/fraud-reports/${report.id}/resolve`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  action: "warn",
                  resolution_notes: "Report resolved with warning",
                  admin_id: admin?.id
                }),
              });

              if (response.ok) {
                fetchReportsData();
                Alert.alert("Success", "Report has been resolved");
              } else {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to resolve report");
              }
            } catch (error) {
              console.error("Error resolving report:", error);
              Alert.alert("Error", error.message || "Failed to resolve report");
            }
          },
        },
      ]
    );
  };

  // Initial load
  useEffect(() => {
    fetchReportsData();
  }, []);

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchReportsData();
  };

  const renderFraudReport = ({ item }) => {
    const isPending = item.status === "pending";
    const user = item.user || {};
    const mechanic = item.mechanic || {};
    
    return (
      <View className="p-4 border border-gray-700 bg-gray-800 rounded-lg mb-3 shadow-md">
        {/* Report Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">
              Report #{item.id}
            </Text>
            <Text className="text-gray-400 text-sm">
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
            <Text className={`text-xs font-bold ${
              item.severity === 'high' ? 'text-red-400' : 
              item.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'
            }`}>
              Severity: {item.severity || 'medium'}
            </Text>
          </View>
          <Text
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              item.status === "resolved" 
                ? "bg-green-600 text-white"
                : item.status === "dismissed" 
                ? "bg-gray-500 text-white"
                : "bg-yellow-500 text-black"
            }`}
          >
            {item.status || "pending"}
          </Text>
        </View>

        {/* User Information */}
        <View className="mb-3">
          <Text className="text-blue-400 font-semibold">Reported by:</Text>
          <Text className="text-white">
            {user.name || "Unknown User"}
          </Text>
          {user.email && (
            <Text className="text-gray-400 text-sm">{user.email}</Text>
          )}
          {user.phone && (
            <Text className="text-gray-400 text-sm">{user.phone}</Text>
          )}
        </View>

        {/* Mechanic Information */}
        <View className="mb-3">
          <Text className="text-red-400 font-semibold">Reported Mechanic:</Text>
          <Text className="text-white">
            {mechanic.name || "Unknown Mechanic"}
          </Text>
          {mechanic.garage_name && (
            <Text className="text-gray-400 text-sm">Garage: {mechanic.garage_name}</Text>
          )}
          {mechanic.email && (
            <Text className="text-gray-400 text-sm">Email: {mechanic.email}</Text>
          )}
          {mechanic.phone && (
            <Text className="text-gray-400 text-sm">Phone: {mechanic.phone}</Text>
          )}
        </View>

        {/* Booking Information */}
        {item.booking && (
          <View className="mb-3">
            <Text className="text-green-400 font-semibold">Related Booking:</Text>
            <Text className="text-white">#{item.booking.id} - {item.booking.type}</Text>
            <Text className="text-gray-400 text-sm">Status: {item.booking.status}</Text>
          </View>
        )}

        {/* Report Details */}
        <View className="mb-3">
          <Text className="text-yellow-400 font-semibold">Issue Type:</Text>
          <Text className="text-white">{item.reason || "Not specified"}</Text>
        </View>

        <View className="mb-3">
          <Text className="text-yellow-400 font-semibold">Description:</Text>
          <Text className="text-white">{item.description || "No description provided"}</Text>
        </View>

        {/* Resolution Notes */}
        {item.resolution_notes && (
          <View className="mb-3 p-2 bg-gray-700 rounded">
            <Text className="text-green-400 font-semibold">Resolution Notes:</Text>
            <Text className="text-white">{item.resolution_notes}</Text>
            {item.resolved_at && (
              <Text className="text-gray-400 text-xs">
                Resolved on: {new Date(item.resolved_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {/* Actions for Pending Reports */}
        {isPending && (
          <View className="flex-row flex-wrap gap-2 mt-3">
            <TouchableOpacity
              className="flex-row items-center bg-red-600 px-3 py-2 rounded-lg flex-1 min-w-[48%]"
              onPress={() => blockMechanic(item)}
            >
              <Ionicons name="ban" size={16} color="white" />
              <Text className="text-white ml-2 font-semibold text-xs">Block Mechanic</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-row items-center bg-green-600 px-3 py-2 rounded-lg flex-1 min-w-[48%]"
              onPress={() => resolveReport(item)}
            >
              <Ionicons name="checkmark" size={16} color="white" />
              <Text className="text-white ml-2 font-semibold text-xs">Resolve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-row items-center bg-gray-600 px-3 py-2 rounded-lg flex-1 min-w-[48%]"
              onPress={() => dismissReport(item)}
            >
              <Ionicons name="close-circle" size={16} color="white" />
              <Text className="text-white ml-2 font-semibold text-xs">Dismiss</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center bg-blue-600 px-3 py-2 rounded-lg flex-1 min-w-[48%]"
              onPress={() => {
                const mechanicId = getMechanicId(item);
                if (mechanicId) {
                  navigation.navigate('MechanicDetails', { mechanicId });
                } else {
                  Alert.alert("Error", "Cannot view mechanic details - ID not found");
                }
              }}
            >
              <Ionicons name="eye" size={16} color="white" />
              <Text className="text-white ml-2 font-semibold text-xs">View Mechanic</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4">Loading reports...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 p-5 bg-black">
      <Text className="text-white text-2xl font-extrabold mb-5">Reports Dashboard</Text>

      {/* Analytics Overview */}
      <View className="flex-row flex-wrap justify-between mb-6">
        <TouchableOpacity
          onPress={() => navigation.navigate('Users')}
          className="w-[48%] bg-gray-800 p-4 rounded-xl mb-3"
        >
          <View>
            <Ionicons name="people" size={22} color="white" />
            <Text className="text-white font-bold mt-2 text-xl">{analytics.total_users}</Text>
            <Text className="text-gray-400 text-sm">Total Users</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Mechanics')}
          className="w-[48%] bg-gray-800 p-4 rounded-xl mb-3"
        >
          <View>
            <Ionicons name="construct" size={22} color="white" />
            <Text className="text-white font-bold mt-2 text-xl">{analytics.total_mechanics}</Text>
            <Text className="text-gray-400 text-sm">Total Mechanics</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('JobsAdmin')}
          className="w-[48%] bg-gray-800 p-4 rounded-xl mb-3"
        >
          <View>
            <Ionicons name="car" size={22} color="white" />
            <Text className="text-white font-bold mt-2 text-xl">{analytics.total_bookings}</Text>
            <Text className="text-gray-400 text-sm">Total Bookings</Text>
          </View>
        </TouchableOpacity>

        <View className="w-[48%] bg-gray-800 p-4 rounded-xl mb-3">
          <Ionicons name="time" size={22} color="white" />
          <Text className="text-white font-bold mt-2 text-xl">{analytics.active_bookings}</Text>
          <Text className="text-gray-400 text-sm">Active Bookings</Text>
        </View>

        {/* Additional Stats */}
        <View className="w-[48%] bg-gray-800 p-4 rounded-xl mb-3">
          <Ionicons name="hourglass" size={22} color="white" />
          <Text className="text-white font-bold mt-2 text-xl">{analytics.pending_bookings}</Text>
          <Text className="text-gray-400 text-sm">Pending</Text>
        </View>

        <View className="w-[48%] bg-gray-800 p-4 rounded-xl mb-3">
          <Ionicons name="checkmark-circle" size={22} color="white" />
          <Text className="text-white font-bold mt-2 text-xl">{analytics.completed_bookings}</Text>
          <Text className="text-gray-400 text-sm">Completed</Text>
        </View>
      </View>

      {/* Fraud Reports Section */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-white text-lg font-semibold">Fraud Reports</Text>
        <Text className="text-gray-400">{fraudReports.length} reports</Text>
      </View>
      
      {fraudReports.length === 0 ? (
        <View className="flex-1 justify-center items-center py-10">
          <Ionicons name="shield-checkmark" size={64} color="gray" />
          <Text className="text-gray-400 text-center mt-4 text-lg">No fraud reports</Text>
          <Text className="text-gray-500 text-center mt-2">All systems are clean</Text>
        </View>
      ) : (
        <FlatList
          data={fraudReports}
          renderItem={renderFraudReport}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
              colors={["#fff"]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
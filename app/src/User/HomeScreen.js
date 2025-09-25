 // File: src/User/HomeScreen.js
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  ScrollView,
  FlatList,
  Animated,
  ActivityIndicator
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUser } from "../contexts/UserContext";
import { API_URL } from "../config";

const MECHANICS = [
  { id: "m1", name: "Joe", lat: -1.28333, lng: 36.81667, issues: ["battery", "tyre"] },
  { id: "m2", name: "AutoFix", lat: -1.285, lng: 36.82, issues: ["engine", "electrical"] },
  { id: "m3", name: "QuickTyre", lat: -1.28, lng: 36.81, issues: ["tyre"] },
];

const carProblems = [
  { id: 1, title: "Flat Tire", issue: "tyre" },
  { id: 2, title: "Engine Trouble", issue: "engine" },
  { id: 3, title: "Battery Dead", issue: "battery" },
  { id: 4, title: "Other issue", issue: "other" },
];

function HomeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { setUser } = useUser();
  const { user: routeUser } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [nearestMechanic, setNearestMechanic] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    if (routeUser) {
      setUser(routeUser); // stores full user object globally
    }
    
    // Fetch services for the "Other issue" functionality
    fetchServices();
  }, [routeUser]);

  const { user } = useUser();

  // Fetch services from backend
  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const response = await fetch(`${API_URL}/services`);
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoadingServices(false);
    }
  };

  // Logout handlers
  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    setModalVisible(false);
    navigation.replace("Login");
  };
  const cancelLogout = () => setShowLogoutConfirm(false);
  const goToProfile = () => {
    setModalVisible(false);
    navigation.navigate("Profile", { user });
  };

  // Car problem selection
  const handleProblemSelect = (problem) => {
    if (problem.issue === "other") {
      // Navigate to ServicesScreen with animation like in ServicesScreen
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start(() => {
        navigation.navigate("Services");
      });
      return;
    }
    setSelectedProblem(problem);
    const mechanic = MECHANICS.find((m) => m.issues.includes(problem.issue.toLowerCase()));
    setNearestMechanic(mechanic || null);
    setModalVisible(true);
  };

  // Navigate to map with mechanic location
  const handleViewOnMap = () => {
    if (!nearestMechanic) return;
    
    // Use the same navigation pattern as ServicesScreen
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate("UserMapScreen", {
        service: {
          id: nearestMechanic.id,
          type: selectedProblem.title,
          location: nearestMechanic.name,
          customer: user?.name || "You",
          latitude: nearestMechanic.lat,
          longitude: nearestMechanic.lng,
        },
        role: "user",
      });
      setModalVisible(false);
    });
  };

  // Navigate directly to ServicesScreen (for the "Other issue" button)
  const navigateToServices = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate("Services");
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 border-b border-gray-700">
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            source={{ uri: user?.profile_picture || "https://randomuser.me/api/portraits/men/32.jpg" }}
            className="w-10 h-10 rounded-full border border-gray-700"
          />
        </TouchableOpacity>
        <Text className="text-white text-xl font-semibold">Welcome</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-black text-2xl font-bold mb-1">
            Hello, {user?.name || "there"}!
          </Text>
          <Text className="text-gray-700">
            Select your car issue below to get the nearest mechanic quickly.
          </Text>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-black text-lg font-semibold mb-2">Nearby Mechanics</Text>
          <Text className="text-gray-700">
            {MECHANICS.length} mechanics are available near you right now.
          </Text>
        </View>

        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-black text-lg font-semibold mb-2">Car Tip</Text>
          <Text className="text-gray-700">
            Regularly check your tire pressure and battery to avoid emergencies.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-3">Recommended Mechanics</Text>
          <FlatList
            horizontal
            data={MECHANICS}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="bg-white p-4 rounded-xl mr-3 w-40">
                <Text className="text-black font-semibold mb-1">{item.name}</Text>
                <Text className="text-gray-700">
                  Can fix: {item.issues.join(", ")}
                </Text>
              </View>
            )}
          />
        </View>

        {/* Additional Services Section */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-3">Available Services</Text>
          {loadingServices ? (
            <View className="bg-white rounded-xl p-4 items-center justify-center">
              <ActivityIndicator size="small" color="#000" />
              <Text className="text-gray-700 mt-2">Loading services...</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={services.slice(0, 3)} // Show only first 3 services
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  className="bg-white p-4 rounded-xl mr-3 w-40"
                  onPress={() => {
                    Animated.sequence([
                      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
                      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
                    ]).start(() => {
                      navigation.navigate("Services");
                    });
                  }}
                >
                  <Text className="text-black font-semibold mb-1">{item.name}</Text>
                  <Text className="text-gray-700 text-xs">
                    {item.mechanics?.length || 0} mechanics available
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="bg-white rounded-xl p-4 w-40">
                  <Text className="text-gray-700 text-center">No services available</Text>
                </View>
              }
            />
          )}
        </View>
      </ScrollView>

      {/* Profile & Mechanic Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end items-center bg-black/70"
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-gray-900 rounded-t-xl w-full p-6 border-t border-gray-700">
            {selectedProblem ? (
              nearestMechanic ? (
                <>
                  <Text className="text-xl font-bold text-white mb-2 text-center">
                    Nearest Mechanic Found
                  </Text>
                  <Text className="text-gray-400 mb-4 text-center">
                    {nearestMechanic.name} can fix {selectedProblem.title}.
                  </Text>
                  <TouchableOpacity
                    className="bg-white py-3 rounded-lg mb-3"
                    onPress={handleViewOnMap}
                  >
                    <Text className="text-black text-center font-semibold">
                      View on Map
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-gray-700 py-3 rounded-lg"
                    onPress={() => setModalVisible(false)}
                  >
                    <Text className="text-white text-center font-semibold">
                      Close
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text className="text-xl font-bold text-white mb-2 text-center">
                    No Mechanic Available
                  </Text>
                  <Text className="text-gray-400 mb-4 text-center">
                    Sorry, no nearby mechanic can fix {selectedProblem.title}.
                  </Text>
                  <TouchableOpacity
                    className="bg-red-600 py-3 rounded-lg"
                    onPress={() => setModalVisible(false)}
                  >
                    <Text className="text-white text-center font-semibold">
                      Close
                    </Text>
                  </TouchableOpacity>
                </>
              )
            ) : (
              <>
                <TouchableOpacity
                  className="p-4 border-b border-gray-700"
                  onPress={goToProfile}
                >
                  <Text className="text-lg font-medium text-center text-white">
                    View Profile
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="p-4"
                  onPress={handleLogout}
                >
                  <Text className="text-lg font-medium text-center text-red-500">
                    Logout
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        transparent
        visible={showLogoutConfirm}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/80"
          onPress={cancelLogout}
        >
          <View className="bg-gray-900 rounded-lg p-6 mx-8 border border-gray-700 shadow-lg">
            <Text className="text-lg font-semibold text-center text-white mb-5">
              Are you sure you want to logout?
            </Text>
            <View className="flex-row justify-around">
              <TouchableOpacity
                className="bg-gray-700 py-2 px-6 rounded-md"
                onPress={cancelLogout}
              >
                <Text className="text-white font-medium text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-red-600 py-2 px-6 rounded-md"
                onPress={confirmLogout}
              >
                <Text className="text-white font-medium text-center">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Car Problems Panel */}
      <View className="absolute bottom-0 w-full bg-gray-900 rounded-t-3xl p-6 border-t border-gray-700 shadow-lg">
        <Text className="text-xl font-bold text-white mb-5 text-center">
          Select your car issue
        </Text>
        <View className="flex-row flex-wrap justify-center">
          {carProblems.map((problem) => {
            const isSelected = selectedProblem?.id === problem.id;
            return (
              <TouchableOpacity
                key={problem.id}
                onPress={() => handleProblemSelect(problem)}
                className={`w-40 m-2 p-4 rounded-xl border ${
                  isSelected
                    ? "border-white bg-white"
                    : "border-gray-700 bg-transparent"
                }`}
              >
                <Text
                  className={`text-center text-lg font-semibold ${
                    isSelected ? "text-black" : "text-white"
                  }`}
                >
                  {problem.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Additional Services Button */}
        <TouchableOpacity
          onPress={navigateToServices}
          className="mt-4 bg-blue-600 py-3 rounded-xl border border-blue-500"
        >
          <Text className="text-white text-center text-lg font-semibold">
            View All Services
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default HomeScreen;    


// // File: src/User/HomeScreen.js
// import { useState } from "react";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   Modal,
//   Pressable,
//   ScrollView,
//   FlatList,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";

// const MECHANICS = [
//   { id: "m1", name: "Joe", lat: -1.28333, lng: 36.81667, issues: ["battery", "tyre"] },
//   { id: "m2", name: "AutoFix", lat: -1.285, lng: 36.82, issues: ["engine", "electrical"] },
//   { id: "m3", name: "QuickTyre", lat: -1.28, lng: 36.81, issues: ["tyre"] },
// ];

// const carProblems = [
//   { id: 1, title: "Flat Tire", issue: "tyre" },
//   { id: 2, title: "Engine Trouble", issue: "engine" },
//   { id: 3, title: "Battery Dead", issue: "battery" },
//   { id: 4, title: "Other issue", issue: "other" },
// ];

// function HomeScreen() {
//   const navigation = useNavigation();
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedProblem, setSelectedProblem] = useState(null);
//   const [nearestMechanic, setNearestMechanic] = useState(null);
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

//   // logout handlers
//   const handleLogout = () => setShowLogoutConfirm(true);
//   const confirmLogout = () => {
//     setShowLogoutConfirm(false);
//     setModalVisible(false);
//     navigation.replace("Login");
//   };
//   const cancelLogout = () => setShowLogoutConfirm(false);
//   const goToProfile = () => {
//     setModalVisible(false);
//     navigation.navigate("Profile");
//   };

//   // when user selects a car issue
//   const handleProblemSelect = (problem) => {
//         if (problem.issue === "other") {
//       // 👇 Navigate to Services page if "Different Problem" is selected
//       navigation.navigate("Services");
//       return;
//     }

//     setSelectedProblem(problem);

//     const mechanic = MECHANICS.find((m) =>
//       m.issues.includes(problem.issue.toLowerCase())
//     );

//     setNearestMechanic(mechanic || null);
//     setModalVisible(true);
//   };

//   // go to map
//   const handleViewOnMap = () => {
//     if (!nearestMechanic) return;

//     navigation.navigate("MapScreen", {
//       task: {
//         id: nearestMechanic.id,
//         type: selectedProblem.title,
//         location: nearestMechanic.name,
//         customer: "You",
//         latitude: nearestMechanic.lat,
//         longitude: nearestMechanic.lng,
//       },
//       role: "user", // 👈 Ensure role is passed
//     });

//     setModalVisible(false);
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-black">
//       {/* Header */}
//       <View className="flex-row justify-between items-center p-4 border-b border-gray-700">
//         <TouchableOpacity
//           onPress={() => setModalVisible(true)}
//           accessibilityLabel="Open profile menu"
//         >
//           <Image
//             source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
//             className="w-10 h-10 rounded-full border border-gray-700"
//           />
//         </TouchableOpacity>
//         <Text className="text-white text-xl font-semibold">Welcome</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       {/* Main Content */}
//       <ScrollView className="flex-1 p-4">
//         {/* Welcome Card */}
//         <View className="bg-white rounded-xl p-4 mb-4">
//           <Text className="text-black text-2xl font-bold mb-1">Hello, Jim!</Text>
//           <Text className="text-gray-700">
//             Select your car issue below to get the nearest mechanic quickly.
//           </Text>
//         </View>

//         {/* Nearby Mechanics */}
//         <View className="bg-white rounded-xl p-4 mb-4">
//           <Text className="text-black text-lg font-semibold mb-2">Nearby Mechanics</Text>
//           <Text className="text-gray-700">
//             {MECHANICS.length} mechanics are available near you right now.
//           </Text>
//         </View>

//         {/* Car Tip */}
//         <View className="bg-white rounded-xl p-4 mb-4">
//           <Text className="text-black text-lg font-semibold mb-2">Car Tip</Text>
//           <Text className="text-gray-700">
//             Regularly check your tire pressure and battery to avoid emergencies.
//           </Text>
//         </View>

//         {/* Recommended Mechanics */}
//         <View className="mb-6">
//           <Text className="text-white text-lg font-semibold mb-3">Recommended Mechanics</Text>
//           <FlatList
//             horizontal
//             data={MECHANICS}
//             keyExtractor={(item) => item.id}
//             showsHorizontalScrollIndicator={false}
//             renderItem={({ item }) => (
//               <View className="bg-white p-4 rounded-xl mr-3 w-40">
//                 <Text className="text-black font-semibold mb-1">{item.name}</Text>
//                 <Text className="text-gray-700">
//                   Can fix: {item.issues.join(", ")}
//                 </Text>
//               </View>
//             )}
//           />
//         </View>
//       </ScrollView>

//       {/* Profile & Mechanic Modal */}
//       <Modal
//         transparent
//         visible={modalVisible}
//         animationType="fade"
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <Pressable
//           className="flex-1 justify-end items-center bg-black/70"
//           onPress={() => setModalVisible(false)}
//         >
//           <View className="bg-gray-900 rounded-t-xl w-full p-6 border-t border-gray-700">
//             {selectedProblem ? (
//               nearestMechanic ? (
//                 <>
//                   <Text className="text-xl font-bold text-white mb-2 text-center">
//                     Nearest Mechanic Found
//                   </Text>
//                   <Text className="text-gray-400 mb-4 text-center">
//                     {nearestMechanic.name} can fix {selectedProblem.title}.
//                   </Text>
//                   <TouchableOpacity
//                     className="bg-white py-3 rounded-lg mb-3"
//                     onPress={handleViewOnMap}
//                   >
//                     <Text className="text-black text-center font-semibold">
//                       View on Map
//                     </Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     className="bg-gray-700 py-3 rounded-lg"
//                     onPress={() => setModalVisible(false)}
//                   >
//                     <Text className="text-white text-center font-semibold">
//                       Close
//                     </Text>
//                   </TouchableOpacity>
//                 </>
//               ) : (
//                 <>
//                   <Text className="text-xl font-bold text-white mb-2 text-center">
//                     No Mechanic Available
//                   </Text>
//                   <Text className="text-gray-400 mb-4 text-center">
//                     Sorry, no nearby mechanic can fix {selectedProblem.title}.
//                   </Text>
//                   <TouchableOpacity
//                     className="bg-red-600 py-3 rounded-lg"
//                     onPress={() => setModalVisible(false)}
//                   >
//                     <Text className="text-white text-center font-semibold">
//                       Close
//                     </Text>
//                   </TouchableOpacity>
//                 </>
//               )
//             ) : (
//               <>
//                 {/* Profile options */}
//                 <TouchableOpacity
//                   className="p-4 border-b border-gray-700"
//                   onPress={goToProfile}
//                   accessibilityRole="button"
//                   accessibilityLabel="View Profile"
//                 >
//                   <Text className="text-lg font-medium text-center text-white">
//                     View Profile
//                   </Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   className="p-4"
//                   onPress={handleLogout}
//                   accessibilityRole="button"
//                   accessibilityLabel="Logout"
//                 >
//                   <Text className="text-lg font-medium text-center text-red-500">
//                     Logout
//                   </Text>
//                 </TouchableOpacity>
//               </>
//             )}
//           </View>
//         </Pressable>
//       </Modal>

//       {/* Logout Confirmation Modal */}
//       <Modal
//         transparent
//         visible={showLogoutConfirm}
//         animationType="fade"
//         onRequestClose={cancelLogout}
//       >
//         <Pressable
//           className="flex-1 justify-center items-center bg-black/80"
//           onPress={cancelLogout}
//         >
//           <View className="bg-gray-900 rounded-lg p-6 mx-8 border border-gray-700 shadow-lg">
//             <Text className="text-lg font-semibold text-center text-white mb-5">
//               Are you sure you want to logout?
//             </Text>
//             <View className="flex-row justify-around">
//               <TouchableOpacity
//                 className="bg-gray-700 py-2 px-6 rounded-md"
//                 onPress={cancelLogout}
//               >
//                 <Text className="text-white font-medium text-center">Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 className="bg-red-600 py-2 px-6 rounded-md"
//                 onPress={confirmLogout}
//               >
//                 <Text className="text-white font-medium text-center">Logout</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Pressable>
//       </Modal>

//       {/* Car Problems Panel */}
//       <View className="absolute bottom-0 w-full bg-gray-900 rounded-t-3xl p-6 border-t border-gray-700 shadow-lg">
//         <Text className="text-xl font-bold text-white mb-5 text-center">
//           Select your car issue
//         </Text>
//         <View className="flex-row flex-wrap justify-center">
//           {carProblems.map((problem) => {
//             const isSelected = selectedProblem?.id === problem.id;
//             return (
//               <TouchableOpacity
//                 key={problem.id}
//                 onPress={() => handleProblemSelect(problem)}
//                 className={`w-40 m-2 p-4 rounded-xl border ${
//                   isSelected
//                     ? "border-white bg-white"
//                     : "border-gray-700 bg-transparent"
//                 }`}
//               >
//                 <Text
//                   className={`text-center text-lg font-semibold ${
//                     isSelected ? "text-black" : "text-white"
//                   }`}
//                 >
//                   {problem.title}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// export default HomeScreen;

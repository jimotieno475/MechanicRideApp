// File: src/Auth/MechanicSignupPage.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../config"; // Backend URL

export default function MechanicSignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [preciseLocation, setPreciseLocation] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [documentPhoto, setDocumentPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const [services, setServices] = useState([]); // list from backend
  const [selectedServices, setSelectedServices] = useState([]); // mechanic selects

  const navigation = useNavigation();

  // Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_URL}/services`);
        const data = await res.json();
        setServices(data); // data should be an array of service objects {id, name}
      } catch (err) {
        console.error("Failed to fetch services:", err);
        Alert.alert("Error", "Unable to fetch services from server.");
      }
    };
    fetchServices();
  }, []);

  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert('Permissions required', 'Camera and gallery permissions are needed for photo uploads.');
      }
    })();
  }, []);

  // Pick profile photo
  const pickProfilePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) setProfilePhoto(result.assets[0].uri);
    } catch (error) {
      console.error("Error picking photo:", error);
      Alert.alert("Error", "Failed to pick photo from gallery.");
    }
  };

  const takeSelfie = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) setProfilePhoto(result.assets[0].uri);
    } catch (error) {
      console.error("Error taking selfie:", error);
      Alert.alert("Error", "Failed to take photo with camera.");
    }
  };

  // Pick document photo
  const pickDocumentPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled) setDocumentPhoto(result.assets[0].uri);
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick document from gallery.");
    }
  };

  // Pin precise location
  const pinPreciseLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Allow location access to pin shop location.");
      return;
    }
    try {
      let loc = await Location.getCurrentPositionAsync({});
      setPreciseLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      Alert.alert("Success", "📍 Shop location pinned successfully!");
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get current location.");
    }
  };

  // Toggle service selection
  const toggleService = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
  };

  // Signup handler
  const handleSignup = async () => {
    // Basic validation
    if (!username || !email || !phone || !password || !confirmPassword || !shopName || !shopLocation) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert("Error", "Please enter a valid phone number.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    if (!profilePhoto || !documentPhoto) {
      Alert.alert("Error", "Please upload both profile photo and mechanic documents.");
      return;
    }

    if (!preciseLocation) {
      Alert.alert("Error", "Please pin your shop location.");
      return;
    }

    if (selectedServices.length === 0) {
      Alert.alert("Error", "Please select at least one service.");
      return;
    }

    setLoading(true);

    try {
      const body = {
        name: username,
        email,
        phone,
        password,
        garage_name: shopName,
        garage_location: shopLocation,
        latitude: preciseLocation.latitude,
        longitude: preciseLocation.longitude,
        profile_picture: profilePhoto,
        document_path: documentPhoto,
        service_ids: selectedServices, // backend expects array of service IDs
      };

      const res = await fetch(`${API_URL}/mechanics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", "Mechanic account created successfully!");
        navigation.navigate("Login");
      } else {
        Alert.alert("Error", data.error || data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      Alert.alert("Error", "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View className="w-full rounded-3xl p-8 space-y-6 border border-white">
          <Text className="text-3xl font-bold text-white text-center">Mechanic Signup</Text>
          <Text className="text-gray-400 text-center mb-4">
            Register as a mechanic by uploading your details
          </Text>

          {/* Personal Information */}
          <View className="space-y-4">
            <Text className="text-white font-semibold text-lg">Personal Information</Text>
            
            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
              placeholder="Full Name *"
              placeholderTextColor="#A0A0A0"
              value={username}
              onChangeText={setUsername}
            />

            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
              placeholder="Email Address *"
              placeholderTextColor="#A0A0A0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
              placeholder="Phone Number *"
              placeholderTextColor="#A0A0A0"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
              placeholder="Password *"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
              placeholder="Confirm Password *"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {/* Shop Details */}
          <View className="space-y-4">
            <Text className="text-white font-semibold text-lg">Shop Details</Text>
            
            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
              placeholder="Shop Name *"
              placeholderTextColor="#A0A0A0"
              value={shopName}
              onChangeText={setShopName}
            />

            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
              placeholder="Shop Location (Street, Area) *"
              placeholderTextColor="#A0A0A0"
              value={shopLocation}
              onChangeText={setShopLocation}
            />

            <TouchableOpacity
              className="w-full h-12 bg-white rounded-xl justify-center items-center mt-2"
              onPress={pinPreciseLocation}
            >
              <Text className="text-black font-semibold">
                {preciseLocation ? "📍 Location Pinned" : "Pin Precise Location *"}
              </Text>
            </TouchableOpacity>
            
            {preciseLocation && (
              <Text className="text-green-400 text-sm text-center mt-1">
                Lat: {preciseLocation.latitude.toFixed(5)}, Lng: {preciseLocation.longitude.toFixed(5)}
              </Text>
            )}
          </View>

          {/* Services */}
          <View className="space-y-3">
            <Text className="text-white font-semibold text-lg">Services Offered *</Text>
            <ScrollView className="max-h-40" nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  className={`px-4 py-3 rounded-xl mb-2 border ${
                    selectedServices.includes(service.id) 
                      ? "bg-green-500 border-green-500" 
                      : "bg-gray-800 border-gray-600"
                  }`}
                  onPress={() => toggleService(service.id)}
                >
                  <Text className="text-white text-center">{service.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text className="text-gray-400 text-xs">
              Selected: {selectedServices.length} service(s)
            </Text>
          </View>

          {/* Profile Photo */}
          <View className="space-y-3">
            <Text className="text-white font-semibold text-lg">Profile Photo *</Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                className="flex-1 h-12 bg-white rounded-xl justify-center items-center"
                onPress={pickProfilePhoto}
              >
                <Text className="text-black font-semibold">Upload Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 h-12 bg-gray-300 rounded-xl justify-center items-center"
                onPress={takeSelfie}
              >
                <Text className="text-black font-semibold">Take Selfie</Text>
              </TouchableOpacity>
            </View>
            {profilePhoto && (
              <View className="items-center mt-2">
                <Image 
                  source={{ uri: profilePhoto }} 
                  className="w-24 h-24 rounded-full border-2 border-white"
                />
                <Text className="text-green-400 text-sm mt-1">Profile photo selected</Text>
              </View>
            )}
          </View>

          {/* Document Upload */}
          <View className="space-y-3">
            <Text className="text-white font-semibold text-lg">Mechanic Document *</Text>
            <TouchableOpacity 
              className="w-full h-12 bg-white rounded-xl justify-center items-center"
              onPress={pickDocumentPhoto}
            >
              <Text className="text-black font-semibold">Upload Document</Text>
            </TouchableOpacity>
            {documentPhoto && (
              <View className="items-center mt-2">
                <Image 
                  source={{ uri: documentPhoto }} 
                  className="w-40 h-28 rounded-xl border-2 border-white"
                />
                <Text className="text-green-400 text-sm mt-1">Document uploaded</Text>
              </View>
            )}
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            className="w-full h-14 bg-white rounded-xl justify-center items-center shadow-lg mt-6"
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text className="text-black font-bold text-lg">Create Mechanic Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full mt-4"
            onPress={() => navigation.navigate("Login")}
          >
            <Text className="text-white text-center text-sm">
              Already have an account? <Text className="font-semibold underline">Login here</Text>
            </Text>
          </TouchableOpacity>

          <Text className="text-gray-400 text-xs text-center mt-2">
            * Required fields
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


// // File: src/Auth/MechanicSignupPage.js
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   Image,
//   ScrollView,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import * as ImagePicker from "expo-image-picker";
// import * as Location from "expo-location";
// import { useNavigation } from "@react-navigation/native";

// export default function MechanicSignupPage() {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const [shopName, setShopName] = useState("");
//   const [shopLocation, setShopLocation] = useState("");
//   const [preciseLocation, setPreciseLocation] = useState(null);

//   const [profilePhoto, setProfilePhoto] = useState(null);
//   const [documentPhoto, setDocumentPhoto] = useState(null);

//   const [services, setServices] = useState([]);
//   const [currentService, setCurrentService] = useState("");

//   const navigation = useNavigation();

//   // Pick Profile Photo from gallery
//   const pickProfilePhoto = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.8,
//     });
//     if (!result.canceled) {
//       setProfilePhoto(result.assets[0].uri);
//     }
//   };

//   // Take Profile Photo
//   const takeSelfie = async () => {
//     const result = await ImagePicker.launchCameraAsync({
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.8,
//     });
//     if (!result.canceled) {
//       setProfilePhoto(result.assets[0].uri);
//     }
//   };

//   // Pick Document Photo
//   const pickDocumentPhoto = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 0.8,
//     });
//     if (!result.canceled) {
//       setDocumentPhoto(result.assets[0].uri);
//     }
//   };

//   // Get precise shop location
//   const pinPreciseLocation = async () => {
//     let { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== "granted") {
//       alert("Permission to access location was denied");
//       return;
//     }
//     let location = await Location.getCurrentPositionAsync({});
//     setPreciseLocation({
//       latitude: location.coords.latitude,
//       longitude: location.coords.longitude,
//     });
//     alert("📍 Shop location pinned successfully!");
//   };

//   // Add Service
//   const addService = () => {
//     if (currentService.trim() === "") return;
//     setServices([...services, currentService.trim()]);
//     setCurrentService("");
//   };

//   // Remove Service
//   const removeService = (index) => {
//     const updated = [...services];
//     updated.splice(index, 1);
//     setServices(updated);
//   };

//   const handleSignup = () => {
//     if (!profilePhoto || !documentPhoto) {
//       alert("Please upload both profile photo and mechanic documents.");
//       return;
//     }
//     if (!shopName || !shopLocation) {
//       alert("Please fill in your shop details.");
//       return;
//     }
//     if (!preciseLocation) {
//       alert("Please pin your shop location.");
//       return;
//     }
//     if (services.length === 0) {
//       alert("Please add at least one service.");
//       return;
//     }

//     console.log("Mechanic Signup:", {
//       username,
//       email,
//       shopName,
//       shopLocation,
//       preciseLocation,
//       profilePhoto,
//       documentPhoto,
//       services,
//     });

//     navigation.navigate("MechanicHomeScreen");
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-black">
//       <ScrollView
//         contentContainerStyle={{ padding: 20 }}
//         showsVerticalScrollIndicator={false}
//       >
//         <View className="w-full rounded-3xl p-8 space-y-6 border border-white">
//           {/* Title */}
//           <Text className="text-3xl font-bold text-white text-center">
//             Mechanic Signup
//           </Text>
//           <Text className="text-gray-400 text-center mb-4">
//             Register as a mechanic by uploading your details
//           </Text>

//           {/* Username */}
//           <TextInput
//             className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
//             placeholder="Username"
//             placeholderTextColor="#A0A0A0"
//             value={username}
//             onChangeText={setUsername}
//           />

//           {/* Email */}
//           <TextInput
//             className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
//             placeholder="Email"
//             placeholderTextColor="#A0A0A0"
//             keyboardType="email-address"
//             value={email}
//             onChangeText={setEmail}
//           />

//           {/* Password */}
//           <TextInput
//             className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
//             placeholder="Password"
//             placeholderTextColor="#A0A0A0"
//             secureTextEntry
//             value={password}
//             onChangeText={setPassword}
//           />

//           {/* Confirm Password */}
//           <TextInput
//             className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
//             placeholder="Confirm Password"
//             placeholderTextColor="#A0A0A0"
//             secureTextEntry
//             value={confirmPassword}
//             onChangeText={setConfirmPassword}
//           />

//           {/* Shop Name */}
//           <TextInput
//             className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500 mt-2"
//             placeholder="Shop Name"
//             placeholderTextColor="#A0A0A0"
//             value={shopName}
//             onChangeText={setShopName}
//           />

//           {/* Shop Location */}
//           <TextInput
//             className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500 mt-2"
//             placeholder="Shop Location (Street, Area)"
//             placeholderTextColor="#A0A0A0"
//             value={shopLocation}
//             onChangeText={setShopLocation}
//           />

//           {/* Pin precise location */}
//           <TouchableOpacity
//             className="w-full h-12 bg-white rounded-xl justify-center items-center mt-3"
//             onPress={pinPreciseLocation}
//           >
//             <Text className="text-black font-semibold">
//               {preciseLocation ? "📍 Location Pinned" : "Pin Precise Location"}
//             </Text>
//           </TouchableOpacity>
//           {preciseLocation && (
//             <Text className="text-green-400 text-sm text-center mt-1">
//               Lat: {preciseLocation.latitude.toFixed(5)}, Lng:{" "}
//               {preciseLocation.longitude.toFixed(5)}
//             </Text>
//           )}

//           {/* Services */}
//           <View className="mt-4">
//             <Text className="text-white font-semibold mb-2">
//               Services Offered
//             </Text>
//             <View className="flex-row">
//               <TextInput
//                 className="flex-1 h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
//                 placeholder="e.g. Engine Repair"
//                 placeholderTextColor="#A0A0A0"
//                 value={currentService}
//                 onChangeText={setCurrentService}
//               />
//               <TouchableOpacity
//                 className="ml-2 px-4 bg-white rounded-xl justify-center items-center"
//                 onPress={addService}
//               >
//                 <Text className="text-black font-bold">Add</Text>
//               </TouchableOpacity>
//             </View>

//             <View className="flex-row flex-wrap mt-3">
//               {services.map((service, index) => (
//                 <View
//                   key={index}
//                   className="flex-row items-center bg-gray-800 rounded-full px-3 py-1 m-1"
//                 >
//                   <Text className="text-white mr-2">{service}</Text>
//                   <TouchableOpacity onPress={() => removeService(index)}>
//                     <Text className="text-red-400 font-bold">✕</Text>
//                   </TouchableOpacity>
//                 </View>
//               ))}
//             </View>
//           </View>

//           {/* Profile Photo Options */}
//           <View className="items-center mt-4">
//             <Text className="text-white font-semibold mb-2">Profile Photo</Text>
//             <View className="flex-row w-full space-x-2">
//               <TouchableOpacity
//                 className="flex-1 h-12 bg-white rounded-xl justify-center items-center"
//                 onPress={pickProfilePhoto}
//               >
//                 <Text className="text-black font-semibold">Upload</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 className="flex-1 h-12 bg-gray-300 rounded-xl justify-center items-center"
//                 onPress={takeSelfie}
//               >
//                 <Text className="text-black font-semibold">Take Selfie</Text>
//               </TouchableOpacity>
//             </View>
//             {profilePhoto && (
//               <Image
//                 source={{ uri: profilePhoto }}
//                 className="w-24 h-24 rounded-full mt-2"
//               />
//             )}
//           </View>

//           {/* Document Upload */}
//           <View className="items-center mt-4">
//             <TouchableOpacity
//               className="w-full h-12 bg-white rounded-xl justify-center items-center mb-2"
//               onPress={pickDocumentPhoto}
//             >
//               <Text className="text-black font-semibold">
//                 Upload Mechanic Document
//               </Text>
//             </TouchableOpacity>
//             {documentPhoto && (
//               <Image
//                 source={{ uri: documentPhoto }}
//                 className="w-40 h-28 rounded-xl mt-2"
//               />
//             )}
//           </View>

//           {/* Signup Button */}
//           <TouchableOpacity
//             className="w-full h-12 bg-white rounded-xl justify-center items-center shadow-lg mt-4"
//             onPress={handleSignup}
//           >
//             <Text className="text-black font-semibold text-lg">
//               Create Mechanic Account
//             </Text>
//           </TouchableOpacity>

//           {/* Back to Login */}
//           <TouchableOpacity
//             className="w-full mt-4"
//             onPress={() => navigation.navigate("Login")}
//           >
//             <Text className="text-white text-center text-sm">
//               Already have an account?{" "}
//               <Text className="font-semibold underline">Login here</Text>
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

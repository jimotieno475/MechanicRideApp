// File: src/Auth/MechanicSignupPage.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";

export default function MechanicSignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [shopName, setShopName] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [preciseLocation, setPreciseLocation] = useState(null);

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [documentPhoto, setDocumentPhoto] = useState(null);

  const [services, setServices] = useState([]);
  const [currentService, setCurrentService] = useState("");

  const navigation = useNavigation();

  // Pick Profile Photo from gallery
  const pickProfilePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  // Take Profile Photo
  const takeSelfie = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  // Pick Document Photo
  const pickDocumentPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setDocumentPhoto(result.assets[0].uri);
    }
  };

  // Get precise shop location
  const pinPreciseLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setPreciseLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    alert("📍 Shop location pinned successfully!");
  };

  // Add Service
  const addService = () => {
    if (currentService.trim() === "") return;
    setServices([...services, currentService.trim()]);
    setCurrentService("");
  };

  // Remove Service
  const removeService = (index) => {
    const updated = [...services];
    updated.splice(index, 1);
    setServices(updated);
  };

  const handleSignup = () => {
    if (!profilePhoto || !documentPhoto) {
      alert("Please upload both profile photo and mechanic documents.");
      return;
    }
    if (!shopName || !shopLocation) {
      alert("Please fill in your shop details.");
      return;
    }
    if (!preciseLocation) {
      alert("Please pin your shop location.");
      return;
    }
    if (services.length === 0) {
      alert("Please add at least one service.");
      return;
    }

    console.log("Mechanic Signup:", {
      username,
      email,
      shopName,
      shopLocation,
      preciseLocation,
      profilePhoto,
      documentPhoto,
      services,
    });

    navigation.navigate("MechanicHomeScreen");
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full rounded-3xl p-8 space-y-6 border border-white">
          {/* Title */}
          <Text className="text-3xl font-bold text-white text-center">
            Mechanic Signup
          </Text>
          <Text className="text-gray-400 text-center mb-4">
            Register as a mechanic by uploading your details
          </Text>

          {/* Username */}
          <TextInput
            className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
            placeholder="Username"
            placeholderTextColor="#A0A0A0"
            value={username}
            onChangeText={setUsername}
          />

          {/* Email */}
          <TextInput
            className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
            placeholder="Email"
            placeholderTextColor="#A0A0A0"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password */}
          <TextInput
            className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
            placeholder="Password"
            placeholderTextColor="#A0A0A0"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Confirm Password */}
          <TextInput
            className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
            placeholder="Confirm Password"
            placeholderTextColor="#A0A0A0"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {/* Shop Name */}
          <TextInput
            className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500 mt-2"
            placeholder="Shop Name"
            placeholderTextColor="#A0A0A0"
            value={shopName}
            onChangeText={setShopName}
          />

          {/* Shop Location */}
          <TextInput
            className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500 mt-2"
            placeholder="Shop Location (Street, Area)"
            placeholderTextColor="#A0A0A0"
            value={shopLocation}
            onChangeText={setShopLocation}
          />

          {/* Pin precise location */}
          <TouchableOpacity
            className="w-full h-12 bg-white rounded-xl justify-center items-center mt-3"
            onPress={pinPreciseLocation}
          >
            <Text className="text-black font-semibold">
              {preciseLocation ? "📍 Location Pinned" : "Pin Precise Location"}
            </Text>
          </TouchableOpacity>
          {preciseLocation && (
            <Text className="text-green-400 text-sm text-center mt-1">
              Lat: {preciseLocation.latitude.toFixed(5)}, Lng:{" "}
              {preciseLocation.longitude.toFixed(5)}
            </Text>
          )}

          {/* Services */}
          <View className="mt-4">
            <Text className="text-white font-semibold mb-2">
              Services Offered
            </Text>
            <View className="flex-row">
              <TextInput
                className="flex-1 h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
                placeholder="e.g. Engine Repair"
                placeholderTextColor="#A0A0A0"
                value={currentService}
                onChangeText={setCurrentService}
              />
              <TouchableOpacity
                className="ml-2 px-4 bg-white rounded-xl justify-center items-center"
                onPress={addService}
              >
                <Text className="text-black font-bold">Add</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap mt-3">
              {services.map((service, index) => (
                <View
                  key={index}
                  className="flex-row items-center bg-gray-800 rounded-full px-3 py-1 m-1"
                >
                  <Text className="text-white mr-2">{service}</Text>
                  <TouchableOpacity onPress={() => removeService(index)}>
                    <Text className="text-red-400 font-bold">✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Profile Photo Options */}
          <View className="items-center mt-4">
            <Text className="text-white font-semibold mb-2">Profile Photo</Text>
            <View className="flex-row w-full space-x-2">
              <TouchableOpacity
                className="flex-1 h-12 bg-white rounded-xl justify-center items-center"
                onPress={pickProfilePhoto}
              >
                <Text className="text-black font-semibold">Upload</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-12 bg-gray-300 rounded-xl justify-center items-center"
                onPress={takeSelfie}
              >
                <Text className="text-black font-semibold">Take Selfie</Text>
              </TouchableOpacity>
            </View>
            {profilePhoto && (
              <Image
                source={{ uri: profilePhoto }}
                className="w-24 h-24 rounded-full mt-2"
              />
            )}
          </View>

          {/* Document Upload */}
          <View className="items-center mt-4">
            <TouchableOpacity
              className="w-full h-12 bg-white rounded-xl justify-center items-center mb-2"
              onPress={pickDocumentPhoto}
            >
              <Text className="text-black font-semibold">
                Upload Mechanic Document
              </Text>
            </TouchableOpacity>
            {documentPhoto && (
              <Image
                source={{ uri: documentPhoto }}
                className="w-40 h-28 rounded-xl mt-2"
              />
            )}
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            className="w-full h-12 bg-white rounded-xl justify-center items-center shadow-lg mt-4"
            onPress={handleSignup}
          >
            <Text className="text-black font-semibold text-lg">
              Create Mechanic Account
            </Text>
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            className="w-full mt-4"
            onPress={() => navigation.navigate("Login")}
          >
            <Text className="text-white text-center text-sm">
              Already have an account?{" "}
              <Text className="font-semibold underline">Login here</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

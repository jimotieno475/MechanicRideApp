import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, ActivityIndicator, Alert, RefreshControl, TouchableOpacity, Modal, TextInput, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../contexts/UserContext';
import { API_URL } from '../config';
import { useNavigation } from '@react-navigation/native';

export default function ActivityScreen() {
  const { user } = useUser();
  const navigation = useNavigation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastKnownStatus, setLastKnownStatus] = useState({});
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [complaintType, setComplaintType] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [bookingRatings, setBookingRatings] = useState({});

  // Function to fetch and update user's bookings
  const fetchBookings = async () => {
    if (!user?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/bookings`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const allBookings = await response.json();
      const userBookings = allBookings.filter(booking => booking.customer?.id === user.id);

      // Debug: Check what date fields are available
      if (userBookings.length > 0) {
        console.log('First booking date fields:', {
          created_at: userBookings[0].created_at,
          id: userBookings[0].id
        });
      }

      // Fetch ratings for each booking
      const ratingsMap = {};
      for (const booking of userBookings) {
        if (booking.status === 'Completed') {
          const ratingResponse = await fetch(`${API_URL}/bookings/${booking.id}/rating`);
          if (ratingResponse.ok) {
            const ratingData = await ratingResponse.json();
            ratingsMap[booking.id] = ratingData.rating;
          }
        }
      }
      setBookingRatings(ratingsMap);

      // Check for status changes and alert user
      userBookings.forEach(booking => {
        if (lastKnownStatus[booking.id] === 'Pending' && booking.status === 'Accepted') {
          Alert.alert(
            'Booking Accepted!',
            `The booking for ${booking.type} has been accepted by ${booking.mechanic?.name}.`
          );
        }
      });
      
      // Update the last known status for the next check
      const newStatusMap = {};
      userBookings.forEach(booking => {
        newStatusMap[booking.id] = booking.status;
      });
      setLastKnownStatus(newStatusMap);

      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load activities');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Function to make phone call
  const makePhoneCall = async (phoneNumber, contactName) => {
    if (!phoneNumber) {
      Alert.alert("Error", "Phone number not available");
      return;
    }

    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    if (!cleanNumber.match(/^\+?[\d\s\-\(\)]{10,}$/)) {
      Alert.alert("Invalid Number", "The phone number format is invalid");
      return;
    }

    const phoneUrl = Platform.OS === 'ios' ? `telprompt:${cleanNumber}` : `tel:${cleanNumber}`;
    
    try {
      const supported = await Linking.canOpenURL(phoneUrl);
      
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert(
          "Call Information", 
          `Call ${contactName} at: ${cleanNumber}`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error making phone call:", error);
      Alert.alert("Info", `Phone number: ${cleanNumber}`);
    }
  };

  const handleCallMechanic = (booking) => {
    if (!booking.mechanic?.phone) {
      Alert.alert("Error", "Mechanic phone number not available");
      return;
    }

    Alert.alert(
      `Call ${booking.mechanic.name}`,
      `Do you want to call ${booking.mechanic.phone}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call", onPress: () => makePhoneCall(booking.mechanic.phone, booking.mechanic.name) }
      ]
    );
  };

  // Function to submit fraud complaint
  const submitFraudComplaint = async () => {
    if (!complaintType || !complaintDescription) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/complaints/fraud`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          mechanic_id: selectedBooking.mechanic.id,
          booking_id: selectedBooking.id,
          complaint_type: complaintType,
          description: complaintDescription
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit complaint');
      }

      Alert.alert("Success", "Complaint submitted successfully. Admin will review it shortly.");
      setShowComplaintModal(false);
      setComplaintType('');
      setComplaintDescription('');
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      Alert.alert("Error", "Failed to submit complaint");
    }
  };

  // Function to submit rating
  const submitRating = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          user_id: user.id,
          rating: rating,
          comment: ratingComment
        }),
      });

      // Check if response is HTML (error page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const textResponse = await response.text();
        console.error('Server returned HTML instead of JSON:', textResponse.substring(0, 200));
        throw new Error('Server error - please try again later');
      }

      if (!response.ok) {
        // Try to parse as JSON for error message
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } catch (jsonError) {
          // If JSON parsing fails, use status text
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();

      Alert.alert("Success", "Thank you for your rating!");
      setShowRatingModal(false);
      setRating(0);
      setRatingComment('');
      setSelectedBooking(null);
      fetchBookings(); // Refresh to show the rating
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert("Error", error.message || "Failed to submit rating");
    }
  };

  // Open complaint modal
  const openComplaintModal = (booking) => {
    setSelectedBooking(booking);
    setShowComplaintModal(true);
  };

  // Open rating modal
  const openRatingModal = (booking) => {
    setSelectedBooking(booking);
    setShowRatingModal(true);
  };

  // Poll for booking updates every 10 seconds
  useEffect(() => {
    fetchBookings(); // Initial fetch
    const intervalId = setInterval(fetchBookings, 10000);
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [user?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  // Fixed formatDate function for ISO format
  const formatDate = (dateString) => {
    console.log('Date string received:', dateString); // Debug log
    
    if (!dateString || dateString === 'None' || dateString === 'null') {
      console.log('No date string provided or value is None/null');
      return 'Date not available';
    }
    
    try {
      // Handle Python None serialization
      if (dateString === 'None') return 'Date not available';
      
      // Parse ISO format directly - JavaScript handles ISO format well
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.log('Invalid date object created from:', dateString);
        
        // Try alternative parsing for ISO format with timezone
        const altDate = new Date(dateString.replace(' ', 'T') + 'Z');
        if (!isNaN(altDate.getTime())) {
          return altDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
        
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateString);
      return 'Date format error';
    }
  };

  // Get status color and styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed':
        return {
          backgroundColor: 'rgba(92, 184, 92, 0.15)',
          color: '#5cb85c',
          text: 'Completed'
        };
      case 'Rejected':
        return {
          backgroundColor: 'rgba(217, 83, 79, 0.15)',
          color: '#d9534f',
          text: 'Cancelled'
        };
      case 'Pending':
        return {
          backgroundColor: 'rgba(66, 139, 202, 0.15)',
          color: '#428bca',
          text: 'Pending'
        };
      case 'Accepted':
        return {
          backgroundColor: 'rgba(240, 173, 78, 0.15)',
          color: '#f0ad4e',
          text: 'Accepted'
        };
      default:
        return {
          backgroundColor: 'rgba(153, 153, 153, 0.15)',
          color: '#999',
          text: status
        };
    }
  };

  // Navigate to map with booking details
  const handleViewOnMap = (booking) => {
    navigation.navigate('UserMapScreen', { booking });
  };

  // Render star rating
  const renderStars = (currentRating, size = 32, interactive = false) => {
    return (
      <View style={{ flexDirection: 'row', marginVertical: 5 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            onPress={interactive ? () => setRating(star) : null}
            disabled={!interactive}
          >
            <Ionicons 
              name={star <= currentRating ? "star" : "star-outline"} 
              size={size} 
              color="#FFD700" 
              style={{ marginHorizontal: 2 }}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

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
          const showMapViewButton = ['Pending', 'Accepted'].includes(booking.status);
          const showCallButton = ['Accepted', 'In Progress'].includes(booking.status);
          const showComplaintButton = ['Completed', 'Accepted', 'In Progress'].includes(booking.status);
          const showRatingButton = booking.status === 'Completed' && !bookingRatings[booking.id];
          const hasRating = bookingRatings[booking.id];

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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: 'black' }}>
                    {booking.type || 'Service Booking'}
                  </Text>
                  {/* DATE AND TIME DISPLAY - FIXED */}
                  <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 2, fontStyle: 'italic'}}>
                    {formatDate(booking.created_at)}
                  </Text>
                  {/* Show updated date if different from created */}
                  {booking.updated_at && booking.updated_at !== booking.created_at && (
                    <Text style={{ color: '#9CA3AF', fontSize: 10, marginTop: 2 }}>
                      Updated: {formatDate(booking.updated_at)}
                    </Text>
                  )}
                </View>
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
                    {statusStyle.text}
                  </Text>
                </View>
              </View>

              {/* Display rating if exists */}
              {hasRating && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ color: '#6B7280', fontSize: 14, marginBottom: 4 }}>Your Rating:</Text>
                  {renderStars(hasRating.rating, 20, false)}
                  {hasRating.comment && (
                    <Text style={{ color: '#6B7280', fontSize: 12, fontStyle: 'italic', marginTop: 4 }}>
                      "{hasRating.comment}"
                    </Text>
                  )}
                </View>
              )}

              {/* Details */}
              <View style={{ rowGap: 8 }}>
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
                      Mechanic: {booking.mechanic.name}
                    </Text>
                  </View>
                )}

                {booking.mechanic?.phone && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="call" size={16} color="#6b7280" />
                    <Text style={{ color: '#6B7280', marginLeft: 8 }}>
                      {booking.mechanic.phone}
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

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 }}>
                  {/* View on Map button */}
                  {showMapViewButton && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#3b82f6',
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                      onPress={() => handleViewOnMap(booking)}
                    >
                      <Ionicons name="map" size={16} color="white" />
                      <Text style={{ color: 'white', fontWeight: '600', marginLeft: 4, fontSize: 12 }}>View Map</Text>
                    </TouchableOpacity>
                  )}

                  {/* Call Mechanic button */}
                  {showCallButton && booking.mechanic?.phone && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#10B981',
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                      onPress={() => handleCallMechanic(booking)}
                    >
                      <Ionicons name="call" size={16} color="white" />
                      <Text style={{ color: 'white', fontWeight: '600', marginLeft: 4, fontSize: 12 }}>Call Mechanic</Text>
                    </TouchableOpacity>
                  )}

                  {/* Rate Service button */}
                  {showRatingButton && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#F59E0B',
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                      onPress={() => openRatingModal(booking)}
                    >
                      <Ionicons name="star" size={16} color="white" />
                      <Text style={{ color: 'white', fontWeight: '600', marginLeft: 4, fontSize: 12 }}>Rate Service</Text>
                    </TouchableOpacity>
                  )}

                  {/* Report Issue button */}
                  {showComplaintButton && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#EF4444',
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                      onPress={() => openComplaintModal(booking)}
                    >
                      <Ionicons name="warning" size={16} color="white" />
                      <Text style={{ color: 'white', fontWeight: '600', marginLeft: 4, fontSize: 12 }}>Report Issue</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Additional booking information */}
                <View style={{
                  marginTop: 8,
                  paddingTop: 8,
                  borderTopWidth: 1,
                  borderTopColor: '#F3F4F6'
                }}>
                  <Text style={{ fontSize: 10, color: '#9CA3AF' }}>
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

      {/* Fraud Complaint Modal */}
      <Modal
        visible={showComplaintModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowComplaintModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, width: '90%', maxWidth: 400 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Report an Issue</Text>
            
            <Text style={{ marginBottom: 8, fontWeight: '600' }}>Issue Type:</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 }}
              placeholder="e.g., Overcharging, Fake Service, No Show"
              value={complaintType}
              onChangeText={setComplaintType}
            />
            
            <Text style={{ marginBottom: 8, fontWeight: '600' }}>Description:</Text>
            <TextInput
              style={{ 
                borderWidth: 1, 
                borderColor: '#ccc', 
                borderRadius: 8, 
                padding: 12, 
                marginBottom: 16, 
                minHeight: 100,
                fontSize: 16,
                textAlignVertical: 'top'
              }}
              placeholder="Please describe the issue in detail..."
              multiline
              numberOfLines={4}
              value={complaintDescription}
              onChangeText={setComplaintDescription}
            />
            
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity 
                style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#6B7280' }}
                onPress={() => setShowComplaintModal(false)}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#EF4444' }}
                onPress={submitFraudComplaint}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, width: '90%', maxWidth: 400 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Rate Your Service</Text>
            <Text style={{ color: '#6B7280', marginBottom: 16 }}>How was your experience with {selectedBooking?.mechanic?.name}?</Text>
            
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              {renderStars(rating, 36, true)}
              <Text style={{ color: '#6B7280', marginTop: 8 }}>
                {rating === 0 ? 'Select rating' : `${rating} star${rating > 1 ? 's' : ''}`}
              </Text>
            </View>
            
            <Text style={{ marginBottom: 8, fontWeight: '600' }}>Comment (optional):</Text>
            <TextInput
              style={{ 
                borderWidth: 1, 
                borderColor: '#ccc', 
                borderRadius: 8, 
                padding: 12, 
                marginBottom: 16, 
                minHeight: 80,
                fontSize: 16,
                textAlignVertical: 'top'
              }}
              placeholder="Share your experience..."
              multiline
              numberOfLines={3}
              value={ratingComment}
              onChangeText={setRatingComment}
            />
            
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity 
                style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#6B7280' }}
                onPress={() => setShowRatingModal(false)}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ 
                  paddingHorizontal: 20, 
                  paddingVertical: 10, 
                  borderRadius: 8, 
                  backgroundColor: rating === 0 ? '#ccc' : '#F59E0B' 
                }}
                onPress={submitRating}
                disabled={rating === 0}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Submit Rating</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

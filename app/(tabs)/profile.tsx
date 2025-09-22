import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Switch, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  MapPin, 
  ShoppingCart, 
  Bell, 
  Heart, 
  CreditCard, 
  Settings, 
  ChevronRight, 
  Edit3,
  Plus,
  Trash2,
  Lock,
  HelpCircle,
  Info,
  Moon,
  Shield,
  X,
  Save
} from 'lucide-react-native';
import { useUser, UserAddress } from '../../lib/context/UserContext';

export default function ProfileScreen() {
  const { state, updateProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [promotionalEnabled, setPromotionalEnabled] = useState(true);
  const [orderUpdatesEnabled, setOrderUpdatesEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  
  // Edit modal states
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [editAddressModalVisible, setEditAddressModalVisible] = useState(false);
  const [addAddressModalVisible, setAddAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  
  // Form states
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddressTitle, setEditAddressTitle] = useState('');
  const [editAddressStreet, setEditAddressStreet] = useState('');
  const [editAddressCity, setEditAddressCity] = useState('');
  const [editAddressZip, setEditAddressZip] = useState('');

  const userProfile = state.profile;
  const addresses = state.profile?.addresses || [];

  // Profile editing functions
  const openEditProfile = () => {
    if (userProfile) {
      setEditName(userProfile.name);
      setEditEmail(userProfile.email);
      setEditPhone(userProfile.phone);
      setEditProfileModalVisible(true);
    }
  };

  const saveProfile = () => {
    if (editName.trim() && editEmail.trim() && editPhone.trim()) {
      updateProfile({
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
      });
      setEditProfileModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  // Address editing functions
  const openEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setEditAddressTitle(address.title);
    setEditAddressStreet(address.street);
    setEditAddressCity(address.city);
    setEditAddressZip(address.zip);
    setEditAddressModalVisible(true);
  };

  const openAddAddress = () => {
    setEditAddressTitle('');
    setEditAddressStreet('');
    setEditAddressCity('');
    setEditAddressZip('');
    setEditingAddress(null);
    setAddAddressModalVisible(true);
  };

  const saveAddress = () => {
    if (editAddressTitle.trim() && editAddressStreet.trim() && editAddressCity.trim() && editAddressZip.trim()) {
      if (editingAddress) {
        // Update existing address
        updateAddress(editingAddress.id, {
          title: editAddressTitle.trim(),
          street: editAddressStreet.trim(),
          city: editAddressCity.trim(),
          zip: editAddressZip.trim(),
        });
        setEditAddressModalVisible(false);
        Alert.alert('Success', 'Address updated successfully!');
      } else {
        // Add new address
        addAddress({
          title: editAddressTitle.trim(),
          street: editAddressStreet.trim(),
          city: editAddressCity.trim(),
          zip: editAddressZip.trim(),
          isDefault: addresses.length === 0, // First address is default
        });
        setAddAddressModalVisible(false);
        Alert.alert('Success', 'Address added successfully!');
      }
    } else {
      Alert.alert('Error', 'Please fill in all address fields');
    }
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteAddress(id)
        }
      ]
    );
  };

  const orderHistory = [
    {
      id: "BBP-001",
      date: "2023-05-15",
      items: 3,
      total: "$24.99",
      status: "Delivered"
    },
    {
      id: "BBP-002",
      date: "2023-05-10",
      items: 2,
      total: "$18.50",
      status: "Delivered"
    },
    {
      id: "BBP-003",
      date: "2023-05-05",
      items: 5,
      total: "$36.75",
      status: "Cancelled"
    }
  ];

  const settingsOptions = [
    {
      icon: <Lock color="#212121" size={20} />,
      title: "Account Security",
      subtitle: "Password, 2FA, login activity"
    },
    {
      icon: <HelpCircle color="#212121" size={20} />,
      title: "Help Center",
      subtitle: "FAQs, contact support"
    },
    {
      icon: <Info color="#212121" size={20} />,
      title: "About Big Boss Pizza",
      subtitle: "Terms, privacy, version info"
    }
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Profile Header */}
        <View className="items-center mb-8">
          <View className="relative">
            <Image 
              source={{ uri: userProfile?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXNlcnxlbnwwfHwwfHx8MA%3D%3D" }} 
              className="w-24 h-24 rounded-full"
            />
            <TouchableOpacity className="absolute bottom-0 right-0 bg-red-500 rounded-full p-1.5">
              <Edit3 size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-2xl font-bold mt-4 text-gray-800">{userProfile?.name || 'Your Name'}</Text>
          <Text className="text-gray-600 mt-1">{userProfile?.email || 'your.email@example.com'}</Text>
          <Text className="text-gray-600">{userProfile?.phone || '+1 (555) 123-4567'}</Text>
          <TouchableOpacity 
            className="bg-red-500 rounded-full px-4 py-2 mt-3 flex-row items-center"
            onPress={openEditProfile}
          >
            <Edit3 size={16} color="white" />
            <Text className="text-white font-medium ml-2">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Address Book Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">Address Book</Text>
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={openAddAddress}
            >
              <Plus size={20} color="#D32F2F" />
              <Text className="text-red-500 ml-1 font-medium">Add New</Text>
            </TouchableOpacity>
          </View>
          
          <View className="bg-white rounded-xl shadow-sm p-4">
            {addresses.length > 0 ? (
              addresses.map((address) => (
                <View 
                  key={address.id} 
                  className={`flex-row items-start p-3 ${address.id !== addresses[addresses.length - 1] ? 'border-b border-gray-100' : ''}`}
                >
                  <MapPin size={20} color="#D32F2F" className="mt-1" />
                  <View className="ml-3 flex-1">
                    <View className="flex-row justify-between">
                      <Text className="font-semibold text-gray-800">{address.title}</Text>
                      {address.isDefault && (
                        <View className="bg-red-100 px-2 py-1 rounded-full">
                          <Text className="text-red-500 text-xs">Default</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-gray-600 mt-1">{address.street}, {address.city}, {address.zip}</Text>
                  </View>
                  <View className="flex-row">
                    <TouchableOpacity 
                      className="mr-2"
                      onPress={() => openEditAddress(address)}
                    >
                      <Edit3 size={18} color="#757575" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDeleteAddress(address.id)}
                    >
                      <Trash2 size={18} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View className="py-8 items-center">
                <MapPin size={48} color="#E0E0E0" />
                <Text className="text-gray-500 text-lg mt-2">No addresses saved</Text>
                <Text className="text-gray-400 text-center mt-1">
                  Add your first address to make ordering easier
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Order History Section */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-800 mb-4">Order History</Text>
          
          <View className="bg-white rounded-xl shadow-sm">
            {orderHistory.map((order, index) => (
              <TouchableOpacity 
                key={order.id} 
                className={`flex-row items-center p-4 ${index !== orderHistory.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <View className="bg-red-100 p-2 rounded-lg">
                  <ShoppingCart size={20} color="#D32F2F" />
                </View>
                <View className="ml-4 flex-1">
                  <View className="flex-row justify-between">
                    <Text className="font-semibold text-gray-800">Order #{order.id}</Text>
                    <Text className={`text-sm font-medium ${order.status === 'Delivered' ? 'text-green-500' : 'text-red-500'}`}>
                      {order.status}
                    </Text>
                  </View>
                  <Text className="text-gray-600 text-sm mt-1">{order.date} • {order.items} items • {order.total}</Text>
                </View>
                <ChevronRight size={20} color="#757575" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notification Preferences */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-800 mb-4">Notification Preferences</Text>
          
          <View className="bg-white rounded-xl shadow-sm p-4">
            <View className="flex-row justify-between items-center py-3">
              <View className="flex-row items-center">
                <Bell size={20} color="#D32F2F" />
                <View className="ml-3">
                  <Text className="font-medium text-gray-800">Push Notifications</Text>
                  <Text className="text-gray-600 text-sm">Receive app notifications</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#E0E0E0", true: "#D32F2F" }}
                thumbColor={notificationsEnabled ? "#FFFFFF" : "#F5F5F5"}
                ios_backgroundColor="#E0E0E0"
                onValueChange={setNotificationsEnabled}
                value={notificationsEnabled}
              />
            </View>
            
            <View className="flex-row justify-between items-center py-3 border-t border-gray-100">
              <View className="ml-8">
                <Text className="font-medium text-gray-800">Order Updates</Text>
                <Text className="text-gray-600 text-sm">Delivery status and updates</Text>
              </View>
              <Switch
                trackColor={{ false: "#E0E0E0", true: "#D32F2F" }}
                thumbColor={orderUpdatesEnabled ? "#FFFFFF" : "#F5F5F5"}
                ios_backgroundColor="#E0E0E0"
                onValueChange={setOrderUpdatesEnabled}
                value={orderUpdatesEnabled}
                disabled={!notificationsEnabled}
              />
            </View>
            
            <View className="flex-row justify-between items-center py-3 border-t border-gray-100">
              <View className="ml-8">
                <Text className="font-medium text-gray-800">Promotional Offers</Text>
                <Text className="text-gray-600 text-sm">Special deals and discounts</Text>
              </View>
              <Switch
                trackColor={{ false: "#E0E0E0", true: "#D32F2F" }}
                thumbColor={promotionalEnabled ? "#FFFFFF" : "#F5F5F5"}
                ios_backgroundColor="#E0E0E0"
                onValueChange={setPromotionalEnabled}
                value={promotionalEnabled}
                disabled={!notificationsEnabled}
              />
            </View>
          </View>
        </View>

        {/* App Settings */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-800 mb-4">App Settings</Text>
          
          <View className="bg-white rounded-xl shadow-sm">
            <TouchableOpacity className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <Moon size={20} color="#D32F2F" />
                <View className="ml-3">
                  <Text className="font-medium text-gray-800">Dark Mode</Text>
                  <Text className="text-gray-600 text-sm">Enable dark theme</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#E0E0E0", true: "#D32F2F" }}
                thumbColor={darkModeEnabled ? "#FFFFFF" : "#F5F5F5"}
                ios_backgroundColor="#E0E0E0"
                onValueChange={setDarkModeEnabled}
                value={darkModeEnabled}
              />
            </TouchableOpacity>
            
            {settingsOptions.map((option, index) => (
              <TouchableOpacity 
                key={index} 
                className={`flex-row items-center justify-between p-4 ${index !== settingsOptions.length - 1 ? 'border-t border-gray-100' : ''}`}
              >
                <View className="flex-row items-center">
                  {option.icon}
                  <View className="ml-3">
                    <Text className="font-medium text-gray-800">{option.title}</Text>
                    <Text className="text-gray-600 text-sm">{option.subtitle}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#757575" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity className="bg-white rounded-xl shadow-sm p-4 flex-row items-center justify-center mb-6">
          <Text className="text-red-500 font-bold text-lg">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editProfileModalVisible}
        animationType="slide"
        onRequestClose={() => setEditProfileModalVisible(false)}
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => setEditProfileModalVisible(false)}>
              <X size={24} color="#666" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Edit Profile</Text>
            <TouchableOpacity onPress={saveProfile}>
              <Save size={24} color="#D32F2F" />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="px-4 py-6">
            <View className="mb-4">
              <Text className="text-lg font-medium text-gray-800 mb-2">Full Name</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                placeholder="Enter your full name"
                value={editName}
                onChangeText={setEditName}
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-lg font-medium text-gray-800 mb-2">Email</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                placeholder="Enter your email"
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View className="mb-6">
              <Text className="text-lg font-medium text-gray-800 mb-2">Phone Number</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                placeholder="Enter your phone number"
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Add/Edit Address Modal */}
      <Modal
        visible={addAddressModalVisible || editAddressModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setAddAddressModalVisible(false);
          setEditAddressModalVisible(false);
        }}
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => {
              setAddAddressModalVisible(false);
              setEditAddressModalVisible(false);
            }}>
              <X size={24} color="#666" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">
              {editingAddress ? 'Edit Address' : 'Add Address'}
            </Text>
            <TouchableOpacity onPress={saveAddress}>
              <Save size={24} color="#D32F2F" />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="px-4 py-6">
            <View className="mb-4">
              <Text className="text-lg font-medium text-gray-800 mb-2">Address Title</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                placeholder="e.g., Home, Work, Office"
                value={editAddressTitle}
                onChangeText={setEditAddressTitle}
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-lg font-medium text-gray-800 mb-2">Street Address</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                placeholder="Enter street address"
                value={editAddressStreet}
                onChangeText={setEditAddressStreet}
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-lg font-medium text-gray-800 mb-2">City</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                placeholder="Enter city"
                value={editAddressCity}
                onChangeText={setEditAddressCity}
              />
            </View>
            
            <View className="mb-6">
              <Text className="text-lg font-medium text-gray-800 mb-2">ZIP Code</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-gray-900"
                placeholder="Enter ZIP code"
                value={editAddressZip}
                onChangeText={setEditAddressZip}
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
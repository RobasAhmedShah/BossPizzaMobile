import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, ShoppingBag, Pizza, Star, Clock, Search, Plus, Minus, X, Edit3, Save } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { MenuService } from '../../lib/services/menuService';
import { Category, MenuItem } from '../../lib/supabase';
import { useCart, CartItem } from '../../lib/context/CartContext';
import { useUser, UserAddress } from '../../lib/context/UserContext';

export default function HomeScreen() {
  const router = useRouter();
  const { addItem } = useCart();
  const { state: userState, setDefaultAddress } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredPizzas, setFeaturedPizzas] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [customizationModalVisible, setCustomizationModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MenuItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Address change modal state
  const [addressChangeModalVisible, setAddressChangeModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesData, popularItems] = await Promise.all([
          MenuService.getCategories(),
          MenuService.getPopularItems(),
        ]);
        
        setCategories(categoriesData);
        setFeaturedPizzas(popularItems);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search functionality
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      setIsSearching(true);
      try {
        const results = await MenuService.searchMenuItems(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching menu items:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Address change functions
  const openAddressChange = () => {
    setAddressChangeModalVisible(true);
  };

  const handleAddressSelect = (address: UserAddress) => {
    setSelectedAddress(address);
    setDefaultAddress(address.id);
    setAddressChangeModalVisible(false);
    Alert.alert('Success', `Delivery address changed to ${address.title}`);
  };

  const getCurrentAddress = () => {
    const defaultAddress = userState.profile?.addresses.find(addr => addr.isDefault);
    if (defaultAddress) {
      return `${defaultAddress.street}, ${defaultAddress.city}`;
    }
    return '123 Pizza Street, Foodville'; // Fallback
  };

  const openCustomization = (item: MenuItem) => {
    setSelectedItem(item);
    setCustomizationModalVisible(true);
    setQuantity(1);
    setSelectedSize(item.sizes?.[0]?.id || '');
  };

  const calculateTotalPrice = () => {
    if (!selectedItem) return 0;
    const size = selectedItem.sizes?.find(s => s.id === selectedSize);
    return size ? size.price * quantity : 0;
  };

  const addToCart = () => {
    if (!selectedItem) return;
    
    const size = selectedItem.sizes?.find(s => s.id === selectedSize);
    if (!size) return;

    const cartItem: CartItem = {
      id: `${selectedItem.id}-${selectedSize}`,
      type: 'menu_item',
      menuItem: selectedItem,
      size: size,
      quantity: quantity,
      customizations: {},
      totalPrice: calculateTotalPrice(),
      name: selectedItem.name,
      description: selectedItem.description,
      image: selectedItem.image_url,
    };

    addItem(cartItem);
    Alert.alert('Success', `${selectedItem.name} added to cart!`);
    setCustomizationModalVisible(false);
  };


  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-[#D32F2F] pt-12 pb-4 px-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-bold">Big Boss Pizza</Text>
            <Text className="text-white text-opacity-90">Delivered to your door</Text>
          </View>
          <TouchableOpacity 
            className="bg-white bg-opacity-20 p-3 rounded-full"
            onPress={() => router.push('/(tabs)/cart')}
          >
            <ShoppingBag color="white" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-4 py-6">
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-lg">Loading...</Text>
          </View>
        ) : (
          <>
            {/* Location Section */}
            <View className="flex-row items-center bg-[#F5F5F5] rounded-xl p-4 mb-6">
              <MapPin color="#D32F2F" size={20} />
              <Text className="flex-1 ml-3 text-[#212121] font-medium">{getCurrentAddress()}</Text>
              <TouchableOpacity onPress={openAddressChange}>
                <Text className="text-[#D32F2F] font-bold">Change</Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center bg-[#F5F5F5] rounded-xl px-4 py-3 mb-6">
              <Search color="#757575" size={20} />
              <TextInput
                className="ml-3 text-[#212121] flex-1"
                placeholder="Search menu..."
                value={searchQuery}
                onChangeText={handleSearch}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <X size={20} color="#757575" />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Results */}
            {searchQuery.trim().length > 0 && (
              <View className="mb-8">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-xl font-bold text-[#212121]">
                    {isSearching ? 'Searching...' : `Search Results (${searchResults.length})`}
                  </Text>
                </View>
                {isSearching ? (
                  <Text className="text-[#757575]">Searching for "{searchQuery}"...</Text>
                ) : searchResults.length > 0 ? (
                  <View className="flex-row flex-wrap gap-4">
                    {searchResults.map((item) => (
                      <TouchableOpacity 
                        key={item.id}
                        className="bg-[#F5F5F5] rounded-xl p-4 flex-1 min-w-[45%]"
                        onPress={() => openCustomization(item)}
                      >
                        <View className="items-center mb-3">
        <Image
                            source={{ uri: item.image_url }}
                            className="w-16 h-16 rounded-xl mb-2"
                          />
                          <Text className="text-lg font-bold text-[#212121]">{item.name}</Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-[#D32F2F] font-bold">
                            PKR {item.sizes?.[0]?.price || 0}
                          </Text>
                          <View className="flex-row items-center">
                            <Star color="#FFC107" size={16} fill="#FFC107" />
                            <Text className="ml-1 text-[#212121]">{item.rating}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View className="py-8 items-center">
                    <Text className="text-gray-500 text-lg">No items found</Text>
                    <Text className="text-gray-400 text-center mt-2">
                      Try searching with different keywords
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Categories - Hide when searching */}
            {searchQuery.trim().length === 0 && (
              <View className="mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-[#212121]">Categories</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                  <Text className="text-[#D32F2F] font-medium">View All</Text>
                </TouchableOpacity>
              </View>
              {loading ? (
                <Text className="text-[#757575]">Loading categories...</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-24">
                  <View className="flex-row gap-3">
                    {categories.map((category) => (
                      <TouchableOpacity 
                        key={category.id}
                        className="bg-[#F5F5F5] rounded-xl px-4 py-3 items-center min-w-[100px]"
                        onPress={() => router.push('/(tabs)/explore')}
                      >
                        <Text className="text-2xl mb-1">{category.icon}</Text>
                        <Text className="text-[#212121] font-medium">{category.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>
            )}

            {/* Featured Pizzas - Hide when searching */}
            {searchQuery.trim().length === 0 && (
              <View className="mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-[#212121]">Popular Pizzas</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                  <Text className="text-[#D32F2F] font-medium">View All</Text>
                </TouchableOpacity>
              </View>
              {loading ? (
                <Text className="text-[#757575]">Loading popular items...</Text>
              ) : (
                <View className="flex-row flex-wrap gap-4">
                  {featuredPizzas.map((pizza) => (
                    <TouchableOpacity 
                      key={pizza.id}
                      className="bg-[#F5F5F5] rounded-xl p-4 flex-1 min-w-[45%]"
                      onPress={() => openCustomization(pizza)}
                    >
                      <View className="items-center mb-3">
        <Image
                          source={{ uri: pizza.image_url }}
                          className="w-16 h-16 rounded-xl mb-2"
                        />
                        <Text className="text-lg font-bold text-[#212121]">{pizza.name}</Text>
                      </View>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-[#D32F2F] font-bold">
                          PKR {pizza.sizes?.[0]?.price || 0}
                        </Text>
                        <View className="flex-row items-center">
                          <Star color="#FFC107" size={16} fill="#FFC107" />
                          <Text className="ml-1 text-[#212121]">{pizza.rating}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            )}

            {/* Special Offers - Hide when searching */}
            {searchQuery.trim().length === 0 && (
              <View className="mb-8">
                <Text className="text-xl font-bold text-[#212121] mb-4">Special Offers</Text>
              <View className="bg-[#FF5722] rounded-xl p-4">
                <Text className="text-white text-lg font-bold">20% Off on Family Combos</Text>
                <Text className="text-white text-opacity-90 mt-1">Limited time offer - Order now!</Text>
                <TouchableOpacity className="bg-white mt-3 py-2 rounded-lg items-center">
                  <Text className="text-[#FF5722] font-bold">View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
            )}

            {/* Quick Actions - Hide when searching */}
            {searchQuery.trim().length === 0 && (
              <View className="mb-8">
              <Text className="text-xl font-bold text-[#212121] mb-4">Quick Actions</Text>
              <View className="flex-row gap-4">
                <TouchableOpacity 
                  className="bg-[#F5F5F5] rounded-xl p-4 flex-1 items-center"
                  onPress={() => router.push('/(tabs)/orders')}
                >
                  <Clock color="#D32F2F" size={24} />
                  <Text className="mt-2 text-[#212121] font-medium">Track Order</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="bg-[#F5F5F5] rounded-xl p-4 flex-1 items-center"
                  onPress={() => router.push('/(tabs)/explore')}
                >
                  <Pizza color="#D32F2F" size={24} />
                  <Text className="mt-2 text-[#212121] font-medium">Customize Pizza</Text>
                </TouchableOpacity>
              </View>
            </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Customization Modal */}
      <Modal
        visible={customizationModalVisible}
        animationType="slide"
        onRequestClose={() => setCustomizationModalVisible(false)}
        statusBarTranslucent={true}
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          {/* Modal Header with Swipe Indicator */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <View className="flex-1 items-center">
              <View className="w-10 h-1 bg-gray-300 rounded-full mb-2" />
              <Text className="text-xl font-bold text-gray-900">Customize</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setCustomizationModalVisible(false)}
              className="bg-gray-100 rounded-full p-2 absolute right-4"
            >
              <X size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {selectedItem && (
            <ScrollView className="px-4">
              {/* Item Header */}
              <View className="items-center py-4">
                <Image
                  source={{ uri: selectedItem.image_url }} 
                  className="w-48 h-48 rounded-2xl mb-4"
                />
                <Text className="text-2xl font-bold text-gray-900">{selectedItem.name}</Text>
                <Text className="text-gray-500 text-center mt-2">{selectedItem.description}</Text>
                <Text className="text-lg font-bold text-red-500 mt-2">
                  Starting from PKR {selectedItem.sizes?.[0]?.price || 0}
                </Text>
              </View>

              {/* Size Selection */}
              <Text className="text-lg font-bold text-gray-900 mt-4 mb-2">Select Size</Text>
              <View className="flex-row flex-wrap mb-4">
                {selectedItem.sizes?.map(size => (
                  <TouchableOpacity
                    key={size.id}
                    className={`border rounded-full px-4 py-2 mr-2 mb-2 ${selectedSize === size.id ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    onPress={() => setSelectedSize(size.id)}
                  >
                    <Text className={selectedSize === size.id ? 'text-red-500 font-medium' : 'text-gray-700'}>
                      {size.size_name} - PKR {size.price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Quantity Selector */}
              <View className="mt-6">
                <Text className="text-lg font-bold text-gray-900 mb-2">Quantity</Text>
                <View className="flex-row items-center justify-between bg-gray-100 rounded-full p-2 w-32">
                  <TouchableOpacity 
                    className="bg-white rounded-full p-2"
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={16} color="#212121" />
                  </TouchableOpacity>
                  <Text className="text-lg font-bold">{quantity}</Text>
                  <TouchableOpacity 
                    className="bg-white rounded-full p-2"
                    onPress={() => setQuantity(quantity + 1)}
                  >
                    <Plus size={16} color="#212121" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Total and Add to Cart */}
              <View className="mt-8 mb-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-bold text-gray-900">Total</Text>
                  <Text className="text-2xl font-bold text-red-500">PKR {calculateTotalPrice()}</Text>
                </View>
                <TouchableOpacity 
                  className="bg-red-500 rounded-full py-4 items-center"
                  onPress={addToCart}
                >
                  <Text className="text-white font-bold text-lg">Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Address Change Modal */}
      <Modal
        visible={addressChangeModalVisible}
        animationType="slide"
        onRequestClose={() => setAddressChangeModalVisible(false)}
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => setAddressChangeModalVisible(false)}>
              <X size={24} color="#666" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Change Delivery Address</Text>
            <View className="w-6" />
          </View>
          
          <ScrollView className="px-4 py-6">
            {userState.profile?.addresses && userState.profile.addresses.length > 0 ? (
              <View>
                <Text className="text-lg font-bold text-gray-800 mb-4">Select Address</Text>
                {userState.profile.addresses.map((address) => (
                  <TouchableOpacity
                    key={address.id}
                    className={`p-4 rounded-xl mb-3 border-2 ${
                      address.isDefault
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    onPress={() => handleAddressSelect(address)}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                          <Text className={`text-lg font-bold ${
                            address.isDefault ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {address.title}
                          </Text>
                          {address.isDefault && (
                            <View className="bg-red-500 px-2 py-1 rounded-full ml-2">
                              <Text className="text-white text-xs font-medium">Default</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-gray-600">
                          {address.street}, {address.city}, {address.zip}
                        </Text>
                      </View>
                      {address.isDefault && (
                        <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center">
                          <View className="w-3 h-3 rounded-full bg-white" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="py-8 items-center">
                <MapPin size={48} color="#E0E0E0" />
                <Text className="text-gray-500 text-lg mt-2">No addresses saved</Text>
                <Text className="text-gray-400 text-center mt-1">
                  Add an address in your profile to change delivery location
                </Text>
                <TouchableOpacity 
                  className="bg-red-500 rounded-full px-6 py-3 mt-4"
                  onPress={() => {
                    setAddressChangeModalVisible(false);
                    router.push('/(tabs)/profile');
                  }}
                >
                  <Text className="text-white font-bold">Go to Profile</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
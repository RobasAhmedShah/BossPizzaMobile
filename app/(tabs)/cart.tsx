import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Minus, Plus, X, ShoppingCart, CreditCard, Wallet } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../lib/context/CartContext';


// Mock data for payment methods
const paymentMethods = [
  { id: '1', name: 'Credit Card', icon: 'CreditCard' },
  { id: '4', name: 'Cash on Delivery', icon: 'Wallet' },
];

export default function CartScreen() {
  const router = useRouter();
  const { state, removeItem, updateQuantity } = useCart();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('1');

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeItem(id) },
      ]
    );
  };

  const handleCheckout = () => {
    if (state.items.length === 0) {
      Alert.alert('Empty Cart', 'Please add some items to your cart first!');
      return;
    }
    
    router.push('/checkout');
  };

  const renderPaymentMethod = (method: { id: string; name: string; icon: string }) => {
    const isSelected = selectedPaymentMethod === method.id;
    return (
      <TouchableOpacity
        key={method.id}
        className={`flex-row items-center p-4 rounded-xl mb-3 ${
          isSelected ? 'bg-red-100 border-2 border-red-500' : 'bg-gray-100'
        }`}
        onPress={() => setSelectedPaymentMethod(method.id)}
      >
        <View className="mr-3">
          {method.icon === 'CreditCard' && <CreditCard size={24} color="#D32F2F" />}
          {method.icon === 'Wallet' && <Wallet size={24} color="#D32F2F" />}
          {method.icon === 'Smartphone' && <Smartphone size={24} color="#D32F2F" />}
        </View>
        <Text className="text-lg font-medium text-gray-800">{method.name}</Text>
        {isSelected && (
          <View className="ml-auto w-5 h-5 rounded-full bg-red-500 items-center justify-center">
            <View className="w-2 h-2 rounded-full bg-white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-red-600 pt-12 pb-6 px-4">
        <View className="flex-row items-center">
          <ShoppingCart size={28} color="white" />
          <Text className="text-white text-2xl font-bold ml-3">Your Cart</Text>
        </View>
      </View>

      {/* Cart Items */}
      <ScrollView className="flex-1 px-4 py-6">
        {state.items.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ShoppingCart size={64} color="#D32F2F" />
            <Text className="text-xl font-bold mt-4">Your cart is empty</Text>
            <Text className="text-gray-500 mt-2">Add delicious items to your cart</Text>
          </View>
        ) : (
          <>
            {state.items.map((item) => (
              <View key={item.id} className="flex-row bg-white rounded-xl shadow-sm mb-4 p-4">
                <View className="w-20 h-20 rounded-lg bg-gray-200 items-center justify-center">
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      className="w-20 h-20 rounded-lg"
                    />
                  ) : (
                    <Text className="text-2xl">
                      {item.type === 'custom_pizza' ? '🍕' : item.type === 'deal' ? '🎁' : '🍽️'}
                    </Text>
                  )}
                </View>
                <View className="flex-1 ml-4">
                  <View className="flex-row justify-between">
                    <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
                    <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                      <X size={20} color="#757575" />
                    </TouchableOpacity>
                  </View>
                  
                  {item.description && (
                    <Text className="text-gray-500 text-sm mt-1">{item.description}</Text>
                  )}
                  
                  {/* Display customization details based on type */}
                  {item.type === 'menu_item' && item.size && (
                    <Text className="text-gray-500 text-xs mt-1">Size: {item.size.size_name}</Text>
                  )}
                  
                  {item.type === 'custom_pizza' && item.pizzaCustomization && (
                    <View className="mt-1">
                      <Text className="text-gray-500 text-xs">
                        {item.pizzaCustomization.size.name} • {item.pizzaCustomization.crust.name}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {item.pizzaCustomization.sauce.name}
                      </Text>
                      {item.pizzaCustomization.toppings.length > 0 && (
                        <Text className="text-gray-500 text-xs">
                          Toppings: {item.pizzaCustomization.toppings.map(t => t.name).join(', ')}
                        </Text>
                      )}
                    </View>
                  )}
                  
                  {item.customizations?.toppings && item.customizations.toppings.length > 0 && (
                    <Text className="text-gray-500 text-xs mt-1">
                      Toppings: {item.customizations.toppings.join(', ')}
                    </Text>
                  )}
                  
                  <Text className="text-red-600 font-bold mt-2">PKR {item.totalPrice}</Text>
                  
                  <View className="flex-row items-center mt-3">
                    <TouchableOpacity 
                      className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center"
                      onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus size={16} color="#212121" />
                    </TouchableOpacity>
                    <Text className="mx-4 text-lg font-medium">{item.quantity}</Text>
                    <TouchableOpacity 
                      className="w-8 h-8 rounded-full bg-red-100 items-center justify-center"
                      onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus size={16} color="#D32F2F" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {/* Order Summary */}
            <View className="bg-gray-50 rounded-xl p-4 mt-2">
              <Text className="text-xl font-bold mb-4">Order Summary</Text>
              
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Subtotal</Text>
                <Text className="text-gray-800 font-medium">PKR {state.subtotal}</Text>
              </View>
              
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Delivery Fee</Text>
                <Text className="text-gray-800 font-medium">PKR {state.deliveryFee}</Text>
              </View>
              
              <View className="flex-row justify-between mb-4">
                <Text className="text-gray-600">Tax (15%)</Text>
                <Text className="text-gray-800 font-medium">PKR {state.tax}</Text>
              </View>
              
              <View className="border-t border-gray-200 pt-3">
                <View className="flex-row justify-between">
                  <Text className="text-lg font-bold">Total</Text>
                  <Text className="text-lg font-bold text-red-600">PKR {state.total}</Text>
                </View>
              </View>
            </View>

            {/* Payment Methods */}
            <View className="mt-6">
              <Text className="text-xl font-bold mb-4">Payment Method</Text>
              {paymentMethods.map(renderPaymentMethod)}
            </View>
          </>
        )}
      </ScrollView>

      {/* Checkout Button */}
      {state.items.length > 0 && (
        <View className="p-4 bg-white border-t border-gray-200">
          <TouchableOpacity 
            className="bg-red-600 rounded-xl py-4 items-center"
            onPress={handleCheckout}
          >
            <Text className="text-white text-lg font-bold">Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
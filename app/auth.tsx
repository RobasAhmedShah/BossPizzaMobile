import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, state } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert('Sign In Failed', error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      Alert.alert(
        'Success',
        'Account created! Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => setIsLogin(true) }]
      );
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    setLoading(false);

    if (error) {
      Alert.alert('Google Sign In Failed', error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 ml-4">
          {isLogin ? 'Sign In' : 'Create Account'}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Welcome Text */}
          <View className="mt-8 mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to{'\n'}Big Boss Pizza
            </Text>
            <Text className="text-gray-600 text-base">
              {isLogin 
                ? 'Sign in to continue ordering your favorite pizzas'
                : 'Create an account to start your pizza journey'
              }
            </Text>
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Email Address</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-4">
              <Mail size={20} color="#666" />
              <TextInput
                className="flex-1 ml-3 text-gray-900"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Password</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-4">
              <Lock size={20} color="#666" />
              <TextInput
                className="flex-1 ml-3 text-gray-900"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#666" />
                ) : (
                  <Eye size={20} color="#666" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password (Sign Up only) */}
          {!isLogin && (
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">Confirm Password</Text>
              <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-4">
                <Lock size={20} color="#666" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#666" />
                  ) : (
                    <Eye size={20} color="#666" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Sign In/Up Button */}
          <TouchableOpacity
            className={`bg-red-600 rounded-xl py-4 mb-4 ${loading ? 'opacity-50' : ''}`}
            onPress={isLogin ? handleSignIn : handleSignUp}
            disabled={loading || state.loading}
          >
            <Text className="text-white text-center text-lg font-bold">
              {loading || state.loading 
                ? 'Please wait...' 
                : isLogin ? 'Sign In' : 'Create Account'
              }
            </Text>
          </TouchableOpacity>

          {/* Google Sign In */}
          <TouchableOpacity
            className="bg-white border-2 border-gray-200 rounded-xl py-4 mb-6 flex-row items-center justify-center"
            onPress={handleGoogleSignIn}
            disabled={loading || state.loading}
          >
            <Text className="text-gray-700 text-center text-lg font-medium ml-2">
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Toggle Login/SignUp */}
          <View className="flex-row justify-center items-center mb-8">
            <Text className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text className="text-red-600 font-semibold">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Skip for now */}
          <TouchableOpacity
            className="bg-gray-100 rounded-xl py-4"
            onPress={() => router.replace('/(tabs)')}
          >
            <Text className="text-gray-600 text-center text-lg font-medium">
              Skip for now
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

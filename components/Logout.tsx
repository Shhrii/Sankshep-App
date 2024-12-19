import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Logout = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userRole'); // Clear the locally stored role
      await auth().signOut(); // Sign out the user from Firebase
      // Alert.alert('Success', 'You have been logged out.');
      navigation.navigate('Login' as never); // Redirect to the login screen
    } catch (error) {
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  const handleGoBack = () => {
    navigation.goBack(); // Navigate to the previous screen
  };

  return (
    <View style={styles.container}>
      <Image
          source={require('../assets/LOGO.png')}
          style={{
            height: 50,
            width: 200,
            marginTop: 30,
            objectFit: 'contain',
            marginBottom: 20,
          }}
        />
      <Text style={styles.title}>Are you sure you want to log out?</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
        <Text style={styles.goBackButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#006b65',
    borderRadius: 20,
    paddingVertical: 13,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goBackButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 13,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  goBackButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Logout;

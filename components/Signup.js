import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const Signup = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDoctor, setIsDoctor] = useState(false);
  const [placeOfPractice, setPlaceOfPractice] = useState('');

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '245940828605-0so1qu6j7lgege7arei9iuhnlsglss10.apps.googleusercontent.com',
    });
  }, []);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    if (isDoctor && !placeOfPractice) {
      Alert.alert('Error', 'Please enter your place of practice.');
      return;
    }

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const userId = userCredential.user.uid;

      // Save user details in Firebase Realtime Database
      await database()
        .ref(`/users/${userId}`)
        .set({
          name,
          email,
          phone,
          isDoctor,
          placeOfPractice: isDoctor ? placeOfPractice : null,
        });

      // Save role locally for next login session
      await AsyncStorage.setItem('userRole', isDoctor ? 'Doctor' : 'NonDoctor');
      // Navigate based on role
      if (isDoctor) {
        navigation.replace('DoctorPage');
      } else {
        navigation.replace('NonDoctorPage');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  async function onGoogleButtonPress() {
    try{
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data.idToken;
      console.log(idToken);
      // Alert.alert('Success', 'User registered successfully!');
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
      navigation.navigate('SignInWithGoogle');
  
    return auth().signInWithCredential(googleCredential);
    }catch{
      console.error('Error during Google Sign-In:', error);
      Alert.alert('Error', 'Failed to register the user.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
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
      </View>
      <Text style={styles.title}>Let's get started !!</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#888"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#888"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, isDoctor && styles.selectedRoleButton]}
          onPress={() => setIsDoctor(true)}
        >
          <Text style={[styles.roleButtonText, isDoctor && styles.selectedRoleButtonText]}>Doctor</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, !isDoctor && styles.selectedRoleButton]}
          onPress={() => setIsDoctor(false)}
        >
          <Text style={[styles.roleButtonText, !isDoctor && styles.selectedRoleButtonText]}>Non-Doctor</Text>
        </TouchableOpacity>
      </View>

      {isDoctor && (
        <TextInput
          style={styles.input}
          placeholder="Place of Practice"
          placeholderTextColor="#888"
          value={placeOfPractice}
          onChangeText={setPlaceOfPractice}
        />
      )}

      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>Or register with</Text>

      <TouchableOpacity style={styles.googleButton} onPress={onGoogleButtonPress}>
        <Image
          style={styles.googleIcon}
          source={{
            uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png',
          }}
        />
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>New to the app?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#F9F9F9',
    padding: 17,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 14,
    color:'#000',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0d6b65',
    padding: 15,
    borderRadius: 20,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedRoleButton: {
    backgroundColor: '#0d6b65',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#0d6b65',
    fontWeight: 'bold',
  },
  selectedRoleButtonText: {
    color: '#FFFFFF',
  },
  signupButton: {
    backgroundColor: '#0d6b65',
    width: '100%',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    color: '#666',
    paddingVertical: 20,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center',
    textAlign:'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
    marginBottom: 15,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    textAlign:'center',
    fontWeight: '500',
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: 'grey',
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    color: '#0d6b65',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Signup;

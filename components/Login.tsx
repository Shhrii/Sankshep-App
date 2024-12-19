import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  Image,
  StyleSheet,
  Modal,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '245940828605-0so1qu6j7lgege7arei9iuhnlsglss10.apps.googleusercontent.com',
    });
  }, []);

  const handleLogin = async () => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const userId = userCredential.user.uid;

      const snapshot = await database().ref(`/users/${userId}`).once('value');
      const userData = snapshot.val();

      if (!userData) {
        Alert.alert('Error', 'User data not found.');
        return;
      }

      const role = userData.isDoctor ? 'Doctor' : 'NonDoctor';
      await AsyncStorage.setItem('userRole', role);

      if (userData.isDoctor) {
        navigation.navigate('DoctorPage' as never);
      } else {
        navigation.navigate('NonDoctorPage' as never);
      }

    } catch (error: any) {
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

  const handleForgotPassword = async () => {
    try {
      if (!resetEmail) {
        Alert.alert('Error', 'Please enter your email.');
        return;
      }

      await auth().sendPasswordResetEmail(resetEmail);
      Alert.alert('Success', 'Password reset email sent!');
      setIsModalVisible(false); // Close modal after sending the email
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/menu-logo.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome back.</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity onPress={() => setIsModalVisible(true)}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleButton} onPress={onGoogleButtonPress}>
        <Image
          style={styles.googleIcon}
          source={{
            uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png',
          }}
        />
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>
          New to the app?{' '}
          <Text
            style={styles.registerLink}
            onPress={() => navigation.navigate('Signup' as never)}
          >
            Register
          </Text>
        </Text>
      </View>

      {/* Forgot Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.resetButton} onPress={handleForgotPassword}>
              <Text style={styles.resetButtonText}>Send Reset Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 30,
    backgroundColor: '#fff',
    paddingTop: 100,
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 20,
    marginBottom: 10,
    borderRadius: 20,
    color:'#000',
    backgroundColor: '#F9F9F9',
  },
  forgotPasswordText: {
    color: '#0d6b65',
    textAlign: 'right',
    marginTop: 10,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#0d6b65',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  registerContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#333',
  },
  registerLink: {
    color: '#0B6158',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#0d6b65',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#d9534f',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
    marginTop:20,
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
});

export default Login;
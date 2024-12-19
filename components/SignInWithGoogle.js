// File: App.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const HomePage = ({ navigation }) => {
  const [authEmail, setAuthEmail] = useState(null);
  const [dbRole, setDbRole] = useState(null);
  const [dbEmail, setDbEmail] = useState(null);
  const [dbPracticePlace, setDbPracticePlace] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [practicePlace, setPracticePlace] = useState('');
  const [showPracticeField, setShowPracticeField] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged((user) => {
      if (user) {
        setAuthEmail(user.email);
        fetchUserData(user.uid);
      } else {
        setAuthEmail(null);
        setDbRole(null);
        setDbEmail(null);
        setDbPracticePlace(null);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (authEmail && dbRole) {
      // Redirect based on role if logged in
      if (dbRole === 'Doctor') {
        navigation.navigate('DoctorPage');
      } else if (dbRole === 'Not a Doctor') {
        navigation.navigate('NonDoctorPage');
      }
    }
  }, [authEmail, dbRole, navigation]);

  const fetchUserData = (userId) => {
    const userRef = database().ref(`/users/${userId}`);
    userRef
      .once('value')
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setDbEmail(data.email || 'No email found');
          setDbRole(data.role || 'No role assigned');
          setDbPracticePlace(data.practicePlace || 'No practice place found');
        } else {
          setDbEmail('No email found');
          setDbRole('No role assigned');
          setDbPracticePlace('No practice place found');
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error.message);
        Alert.alert('Error', 'Failed to fetch user data.');
      });
  };

  const updateRoleAndEmail = () => {
    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'User is not authenticated');
      return;
    }
    if (!selectedRole.trim()) {
      Alert.alert('Error', 'Role must be selected');
      return;
    }
    if (selectedRole === 'Doctor' && !practicePlace.trim()) {
      Alert.alert('Error', 'Place of practice must be provided for doctors');
      return;
    }

    const userRef = database().ref(`/users/${user.uid}`);
    const dataToStore = {
      email: user.email,
      role: selectedRole,
    };
    if (selectedRole === 'Doctor') {
      dataToStore.practicePlace = practicePlace;
    }

    userRef
      .set(dataToStore)
      .then(() => {
        // Alert.alert('Success', 'Data updated successfully!');
        setDbRole(selectedRole);
        setDbEmail(user.email);
        if (selectedRole === 'Doctor') {
          setDbPracticePlace(practicePlace);
        }
        setSelectedRole('');
        setPracticePlace('');
        setShowPracticeField(false);

        // Navigate to specific page based on role
        if (selectedRole === 'Doctor') {
          navigation.navigate('DoctorPage');
        } else {
          navigation.navigate('NonDoctorPage');
        }
      })
      .catch((error) => {
        console.error('Error updating data:', error.message);
        Alert.alert('Error', 'Failed to update data.');
      });
  };

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setShowPracticeField(role === 'Doctor');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tell us bit more about you.</Text>
      <View style={styles.block1}>
        <Text style={styles.label}>Welcome 👋 </Text>
        <Text style={styles.value}>{authEmail || 'No email available'}</Text>
      </View>
      <Text style={styles.label1}>Select your role:</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[
            styles.roleOption,
            selectedRole === 'Doctor' ? styles.roleOptionSelected : null,
          ]}
          onPress={() => handleRoleSelection('Doctor')}
        >
          <Text
            style={[
              styles.roleText,
              selectedRole === 'Doctor' ? styles.roleTextSelected : null,
            ]}
          >
            Doctor
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleOption,
            selectedRole === 'Not a Doctor' ? styles.roleOptionSelected : null,
          ]}
          onPress={() => handleRoleSelection('Not a Doctor')}
        >
          <Text
            style={[
              styles.roleText,
              selectedRole === 'Not a Doctor' ? styles.roleTextSelected : null,
            ]}
          >
            Not a Doctor
          </Text>
        </TouchableOpacity>
      </View>

      {showPracticeField && (
        <TextInput
          style={[styles.input, styles.inputPadding]}
          placeholder="Enter place of practice"
          placeholderTextColor="#888"
          value={practicePlace}
          onChangeText={setPracticePlace}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={updateRoleAndEmail}>
        <Text style={styles.buttonText}>Proceed</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#F7FAFC',
    padding: 20,
  },
  header: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#006b65',
    marginBottom: 50,
  },
  block1:{
    flexDirection:'row',
  },
  label: {
    textAlign:'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#006b65',
    marginBottom: 10,
  },
  label1: {
    textAlign:'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f2782c',
    marginBottom: 15,

  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 15,
  },
  roleOption: {
    flex: 1,
    padding: 20,
    marginHorizontal: 5,
    backgroundColor: '#EDF2F7',
    borderRadius: 20,
    alignItems: 'center',
  },
  roleOptionSelected: {
    backgroundColor: '#006b65',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
  },
  roleTextSelected: {
    color: '#fff',
  },
  input: {
    width: '100%',
    height: 60,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
  },
  inputPadding: {
    padding: 10,
  },
  button: {
    width: '100%',
    backgroundColor: '#006b65',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomePage;

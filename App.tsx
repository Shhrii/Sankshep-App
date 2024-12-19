import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Signup from './components/Signup';
import Login from './components/Login';
import InputField from './components/InputFeild';
import SplashScreen from './components/SplashScreen';
import DoctorPage from './components/DoctorPage';
import NonDoctorPage from './components/NonDoctorPage';
import Poll from './components/Poll';
import Pollx from './components/Pollx';
import WebViewScreen from './components/WebViewScreen';
import AuthLoadingScreen from './components/AuthLoadingScreen';
import SignInWithGoogle from './components/SignInWithGoogle';
import Logout from './components/Logout';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen">
      <Stack.Screen name="AuthLoadingScreen" component={AuthLoadingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
        <Stack.Screen name="DoctorPage" component={DoctorPage} options={{ headerShown: false }} />  
        <Stack.Screen name="NonDoctorPage" component={NonDoctorPage} options={{ headerShown: false }} />  
        <Stack.Screen name="Poll" component={Poll} options={{ headerShown: false }} />  
        <Stack.Screen name="Pollx" component={Pollx} options={{ headerShown: false }} />  
        <Stack.Screen name="WebViewScreen" component={WebViewScreen} options={{ headerShown: false }} />  
        <Stack.Screen name="SignInWithGoogle" component={SignInWithGoogle} options={{ headerShown: false }} />  
        <Stack.Screen name="Logout" component={Logout} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

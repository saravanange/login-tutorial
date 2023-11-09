import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [token, setToken] = useState('');
  const [userinfo, setUserinfo] = useState(null);
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '1038184132515-e4ps35i7kpjoeeo9gs89ma3atae87oko.apps.googleusercontent.com',
    webClientId: '1038184132515-a7fhdhsv7vm76l4ml1j2gbvjmfja49ju.apps.googleusercontent.com',
    iosClientId:'1038184132515-uqmf3pjeqmkbmplm8dvco8l8c4av42c6.apps.googleusercontent.com'
  });

  useEffect(() => {
    handleEffect();
  }, [response, token]);

  async function handleEffect() {
    const user = await getLocalUser();
    console.log('user', user);
    if (!user) {
      console.log('user --1', user);
      if (response?.type === 'success') {
        console.log('user --2', user);
        setToken(response.authentication.accessToken);
        await getUserInfo(response.authentication.accessToken);
      }
    } else {
      console.log('user --3', user);
      setUserinfo(user);
      console.log('loaded locally');
    }
  }

  const getLocalUser = async () => {
    try {
      const user = await AsyncStorage.getItem('@user');
      if (!user) return null;
      return JSON.parse(user);
    } catch (error) {
      console.error('Error retrieving user from AsyncStorage:', error);
      return null;
    }
  };

  const getUserInfo = async (token) => {
    if (!token) return;
    try {
      const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = await response.json();
      await AsyncStorage.setItem('@user', JSON.stringify(user));
      setUserinfo(user);
      console.log('getUserInfo --1', user);
    } catch (error) {
      console.error('Error fetching user information:', error);
    }
  };

  const removeLocalStore = async () => {
    try {
      await AsyncStorage.removeItem('@user');
      setUserinfo(null);
      console.log('Local store removed');
    } catch (error) {
      console.error('Error removing user from AsyncStorage:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>{JSON.stringify(userinfo,null,2)}</Text>
      <Text>Coding with Sarav!</Text>
      <Button
        title="Sign in with Google"
        disabled={!request}
        onPress={() => {
          promptAsync();
        }}
      />
      <Button title="Remove local store" onPress={removeLocalStore} />
      <StatusBar style="auto" />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  card: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});

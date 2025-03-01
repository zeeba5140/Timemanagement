// Timer Management App with Light/Dark Mode Toggle

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProgressBar from 'react-native-progress/Bar';

interface Timer {
  id: string;
  name: string;
  duration: number;
  remaining: number;
  status: 'Running' | 'Paused' | 'Completed';
  category: string;
  halfwayAlert: boolean;
}

const categories = ['Workout', 'Study', 'Break'];

const HomeScreen = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [halfwayAlert, setHalfwayAlert] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [completedTimer, setCompletedTimer] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    loadTimers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        return prevTimers.map((timer) => {
          if (timer.status === 'Running' && timer.remaining > 0) {
            const updatedTimer = { ...timer, remaining: timer.remaining - 1 };
            if (updatedTimer.remaining === Math.floor(timer.duration / 2) && timer.halfwayAlert) {
              Alert.alert('Halfway Alert', `Timer ${timer.name} is halfway done!`);
            }
            if (updatedTimer.remaining === 0) {
              updatedTimer.status = 'Completed';
              setCompletedTimer(updatedTimer.name);
              setModalVisible(true);
              setHistory((prevHistory) => {
                const newHistory = [...prevHistory, `${updatedTimer.name} completed at ${new Date().toLocaleTimeString()}`];
                saveHistory(newHistory);
                return newHistory;
              });
            }
            return updatedTimer;
          }
          return timer;
        });
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadTimers = async () => {
    const storedTimers = await AsyncStorage.getItem('timers');
    const storedHistory = await AsyncStorage.getItem('history');
    if (storedTimers) setTimers(JSON.parse(storedTimers));
    if (storedHistory) setHistory(JSON.parse(storedHistory));
  };

  const saveTimers = async (newTimers: Timer[]) => {
    await AsyncStorage.setItem('timers', JSON.stringify(newTimers));
    setTimers(newTimers);
  };

  const saveHistory = async (newHistory: string[]) => {
    await AsyncStorage.setItem('history', JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const addTimer = () => {
    if (!name || !duration) {
      Alert.alert('Error', 'Name and Duration are required');
      return;
    }
    const newTimer: Timer = {
      id: Date.now().toString(),
      name,
      duration: parseInt(duration),
      remaining: parseInt(duration),
      status: 'Paused',
      category,
      halfwayAlert,
    };
    saveTimers([...timers, newTimer]);
    setName('');
    setDuration('');
    setHalfwayAlert(false);
  };

  const startTimer = (id: string) => {
    setTimers((prevTimers) => {
      return prevTimers.map((timer) => (timer.id === id ? { ...timer, status: 'Running' } : timer));
    });
  };

  const pauseTimer = (id: string) => {
    setTimers((prevTimers) => {
      return prevTimers.map((timer) => (timer.id === id ? { ...timer, status: 'Paused' } : timer));
    });
  };

  const resetTimer = (id: string) => {
    setTimers((prevTimers) => {
      return prevTimers.map((timer) => (timer.id === id ? { ...timer, remaining: timer.duration, status: 'Paused' } : timer));
    });
  };

  return (
    <ScrollView style={theme === 'light' ? styles.lightContainer : styles.darkContainer}>
      <Button title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme`} onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
      <TextInput placeholder="Timer Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Duration (seconds)" keyboardType="numeric" value={duration} onChangeText={setDuration} style={styles.input} />
      {categories.map((cat) => (
        <Button key={cat} title={cat} onPress={() => setCategory(cat)} color={category === cat ? 'blue' : 'gray'} />
      ))}
      <Button title="Add Timer" onPress={addTimer} />
      {timers.map((timer) => (
        <View key={timer.id} style={styles.timerCard}>
          <Text>{timer.name} - {timer.remaining}s</Text>
          <ProgressBar progress={timer.remaining / timer.duration} width={200} />
          <Button title="Start" onPress={() => startTimer(timer.id)} />
          <Button title="Pause" onPress={() => pauseTimer(timer.id)} />
          <Button title="Reset" onPress={() => resetTimer(timer.id)} />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: '#f5f5f5',
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      marginBottom: 10,
      padding: 10,
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
    },
    checkboxContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
      alignItems: 'center',
    },
    categoryContainer: {
      marginVertical: 10,
      padding: 10,
      backgroundColor: '#ddd',
      borderRadius: 10,
    },
    categoryTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    timerItem: {
      marginBottom: 10,
      padding: 10,
      backgroundColor: '#eee',
      borderRadius: 10,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    modalView: {
      margin: 20,
      padding: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    historyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
      textAlign: 'center',
    },
    lightContainer: { backgroundColor: '#f5f5f5', padding: 20 },
    darkContainer: { backgroundColor: '#333', padding: 20 },
    input: { marginBottom: 10, padding: 10, backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: '#ccc' },
    timerCard: { marginBottom: 10, padding: 10, backgroundColor: '#eee', borderRadius: 10 },
  });

export default HomeScreen;

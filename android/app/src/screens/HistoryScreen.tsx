import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RNFS from 'react-native-fs';

const HistoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { completedTimers = [] } = route.params || {};
  const [displayTimers, setDisplayTimers] = useState(completedTimers);

  useEffect(() => {
    if (route.params?.completedTimers) {
      setDisplayTimers(route.params.completedTimers);
    }
  }, [route.params?.completedTimers]);

  const convertToJson = async () => {
    if (displayTimers.length === 0) {
      Alert.alert('No completed timers to export');
      return;
    }
    const json = JSON.stringify(displayTimers, null, 2);
    const path = `${RNFS.DocumentDirectoryPath}/completedTimers.json`;

    try {
      await RNFS.writeFile(path, json, 'utf8');
      Alert.alert('Success', `JSON File Saved at: ${path}`);
    } catch (error) {
      console.error('Failed to save JSON:', error);
      Alert.alert('Failed to save JSON');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completed Timers</Text>
      {displayTimers.length === 0 ? (
        <Text>No completed timers available</Text>
      ) : (
        <FlatList
          data={displayTimers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.timerItem}>
              <Text>Title: {item.name}</Text>
              <Text>Duration: {item.duration}s</Text>
              <Text>Status: {item.status}</Text>
            </View>
          )}
        />
      )}
      <Button title="Convert to JSON" onPress={convertToJson} />
      <Button title="Back to Home" onPress={() => navigation.navigate('Home', { completedTimers: displayTimers })} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  timerItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#ddd',
    borderRadius: 10,
  },
});

export default HistoryScreen;

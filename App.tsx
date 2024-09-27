import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = 'b21e94c3fe81e7fd7aad01176f7aebaa'; // Replace with your actual API key

const App = () => {
  const [searchInput, setSearchInput] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [unit, setUnit] = useState('metric'); // 'metric' for Celsius, 'imperial' for Fahrenheit
  const [errorMessage, setErrorMessage] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from AsyncStorage
  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  // Save search input to search history in AsyncStorage
  const saveToSearchHistory = async (input: string) => {
    try {
      let history = await AsyncStorage.getItem('searchHistory');
      let parsedHistory: string[] = history ? JSON.parse(history) : [];

      if (!parsedHistory.includes(input)) {
        parsedHistory.push(input);
        await AsyncStorage.setItem('searchHistory', JSON.stringify(parsedHistory));
        setSearchHistory(parsedHistory); // Update local state
      }
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const fetchWeather = async () => {
    try {
      let url = '';
      if (isValidCoordinates(searchInput)) {
        // If search input is valid coordinates
        const [latitude, longitude] = searchInput.split(',');
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${API_KEY}`;
      } else {
        // Assume it's a city name
        url = `https://api.openweathermap.org/data/2.5/weather?q=${searchInput}&units=${unit}&appid=${API_KEY}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        if (data.main && data.wind && data.weather) {
          setWeatherData(data);
          setErrorMessage('');
          saveToSearchHistory(searchInput); // Save search input to search history
        } else {
          setErrorMessage('Incomplete weather data received.');
        }
      } else {
        setErrorMessage(data.message || 'Error fetching weather data.');
      }
    } catch (error) {
      setErrorMessage('Unable to fetch weather data.');
    }
  };

  const isValidCoordinates = (input: string) => {
    // Validate if input is in the format of "latitude,longitude"
    const regex = /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}/;
    return regex.test(input);
  };

  const toggleUnit = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };

  return (
    <LinearGradient colors={['#1e90ff', '#87CEEB']} style={styles.container}>
      <Text style={styles.title}>Weatherly</Text>

      {/* Search Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter city name or latitude,longitude"
        value={searchInput}
        onChangeText={setSearchInput}
        placeholderTextColor="#A9A9A9"
      />

      {/* Fetch Weather Button */}
      <TouchableOpacity style={styles.button} onPress={fetchWeather}>
        <LinearGradient colors={['#4682B4', '#00BFFF']} style={styles.button}>
          <Text style={styles.buttonText}>Get Weather</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Display Weather Data */}
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : (
        weatherData && (
          <View style={styles.weatherDetails}>
            <Text style={styles.cityName}>{weatherData.name}</Text>
            <Text style={styles.weatherInfo}>
              Temp: {weatherData.main.temp}° {unit === 'metric' ? 'Celsius' : 'Fahrenheit'}
            </Text>
            <Text style={styles.weatherInfo}>Wind: {weatherData.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</Text>
            <Text style={styles.weatherInfo}>Weather: {weatherData.weather[0].description}</Text>
          </View>
        )
      )}

      {/* Toggle Celsius/Fahrenheit */}
      <TouchableOpacity style={styles.button} onPress={toggleUnit}>
        <LinearGradient colors={['#4682B4', '#00BFFF']} style={styles.button}>
          <Text style={styles.buttonText}>
            Switch to {unit === 'metric' ? 'Fahrenheit' : 'Celsius'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Search History:</Text>
          {searchHistory.map((historyItem, index) => (
            <TouchableOpacity key={index} onPress={() => setSearchInput(historyItem)}>
              <Text style={styles.historyItem}>{historyItem}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    fontSize: 18,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  weatherDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  weatherInfo: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 5,
  },
  historyContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  historyItem: {
    fontSize: 16,
    color: '#fff',
    textDecorationLine: 'underline',
    marginBottom: 5,
  },
});

export default App;

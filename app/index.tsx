import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator, AppState, AppStateStatus, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import { PorcupineManager } from '@picovoice/porcupine-react-native';
import RNFS from 'react-native-fs';

const keywordPath = Platform.select({
  android: 'hey-computer.ppn',
  // ios: 'chottu_ios.ppn', // if applicable
});

const RecordingComponent: React.FC = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Tap microphone or say "hey computer" to start recording');
  const appState = useRef(AppState.currentState);
  const porcupineRef = useRef<PorcupineManager | null>(null);

  useEffect(() => {
    const setup = async () => {
      try {
        const { status: micStatus } = await Audio.requestPermissionsAsync();
        if (micStatus !== 'granted') {
          alert('Permission to access microphone is required!');
          return;
        }

        // 👂 Wake word initialization
        porcupineRef.current = await PorcupineManager.fromKeywordPaths(
          "KozLQ3bQ3gTolw61GpnOvsdaZyJfEKHOMUyG/lmxpRmZuErD4ip9FQ==",
          [keywordPath!],
          wakeWordDetected
        );
        await porcupineRef.current.start();
        console.log('Wake word detection started.');

      } catch (error) {
        console.error('Error initializing audio or wake word detection:', error);
      }
    };

    setup();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground');
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      porcupineRef.current?.delete();
    };
  }, []);

  const wakeWordDetected = () => {
    console.log('Wake word detected: "hey computer"');
    setStatus('Wake word detected! Starting recording...');
    startRecording();
  };

  const startRecording = async (): Promise<void> => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setStatus('Recording in progress...');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async (): Promise<void> => {
    if (!recording) return;

    try {
      console.log('Stopping recording..');
      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      console.log('Recording stopped, file URI:', uri);

      setRecording(null);
      setIsRecording(false);
      setStatus('Processing recording...');

      if (uri) {
        await sendAudioToAPI(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      setIsRecording(false);
      setRecording(null);
      setStatus('Tap microphone to start recording');
    }
  };

  const sendAudioToAPI = async (uri: string): Promise<void> => {
    if (!uri) return;

    setIsSending(true);
    setStatus('Sending recording...');

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);

      const response = await fetch('https://acaa-2409-40e5-1059-b714-154e-f9df-4088-acb1.ngrok-free.app/process-audio/', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API response:', data);
        setStatus('Recording sent successfully');
      } else {
        console.error('API error:', response.status);
        setStatus('Failed to send recording');
      }
    } catch (err) {
      console.error('Error sending audio to API:', err);
      setStatus('Error sending recording');
    } finally {
      setTimeout(() => {
        setStatus('Tap microphone or say "chottu" to start recording');
      }, 2000);
      setIsSending(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Press the mic or say "chottu" to record
        </Text>
        <Text style={styles.keywordText}>Your wake word: "chottu"</Text>
      </View>

      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={toggleRecording}
        disabled={isSending}
      >
        <View style={[
          styles.button,
          isRecording ? styles.recordingActive : null,
          isSending ? styles.disabled : null
        ]}>
          <FontAwesome
            name={isRecording ? "stop" : "microphone"}
            size={28}
            color="#fff"
          />
        </View>
      </TouchableOpacity>

      <Text style={styles.status}>{status}</Text>
      {isSending && <ActivityIndicator size="large" color="#007AFF" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  infoContainer: {
    position: 'absolute', top: 40, left: 0, right: 0,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 15, alignItems: 'center', borderRadius: 8, margin: 10,
  },
  infoText: {
    fontSize: 16, color: '#007AFF', marginBottom: 5,
  },
  keywordText: {
    fontSize: 14, color: '#666', fontStyle: 'italic',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
  },
  recordingActive: {
    backgroundColor: '#FF3B30',
  },
  disabled: {
    backgroundColor: '#999',
  },
  status: {
    marginTop: 10, fontSize: 16, color: '#333', textAlign: 'center',
  },
});

export default RecordingComponent;

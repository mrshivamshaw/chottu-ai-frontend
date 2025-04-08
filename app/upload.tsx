import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

type FileType = {
  uri: string;
  name: string;
  size: number;
  mimeType?: string;
  file?: any;
};

const ExcelUploader: React.FC = () => {
  const [file, setFile] = useState<FileType | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/vnd.ms-excel', // .xls
        ],
        copyToCacheDirectory: true,
      });
  
      if ('assets' in result && result.assets) {
        const selectedFile: FileType = {
          uri: result.assets[0].uri || '',
          name: result.assets[0].name || 'unknown.xlsx',
          size: result.assets[0].size || 0,
          mimeType: result.assets[0].mimeType,
        };
        setFile(selectedFile);
      } else {
        Alert.alert('Error', 'No file selected.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file.');
    }
  };

  const uploadFile = async () => {
    if (!file) {
      Alert.alert('No File', 'Please select a file first!');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      } as unknown as Blob); // 👈 workaround for RN FormData quirk

      const response = await fetch('https://acaa-2409-40e5-1059-b714-154e-f9df-4088-acb1.ngrok-free.app/upload-products/', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      Alert.alert('Upload Result', data.message || 'Uploaded successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Upload Failed', 'Something went wrong.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Excel Uploader</Text>

      <Button title="Pick Excel File" onPress={pickFile} />
      {file && <Text style={styles.fileName}>📄 {file.name}</Text>}

      {uploading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      ) : (
        <Button title="Upload File" onPress={uploadFile} disabled={!file} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    marginTop: 100,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  fileName: {
    marginVertical: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default ExcelUploader;

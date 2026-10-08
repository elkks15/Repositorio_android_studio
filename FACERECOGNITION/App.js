import { CameraView, useCameraPermissions } from 'expo-camera';
import { Asset, usePermissions as useMediaLibraryPermissions } from 'expo-media-library';
import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState('back');
  const [cameraReady, setCameraReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = useMediaLibraryPermissions({
    writeOnly: true,
  });

  if (!permission || !mediaPermission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Necesitamos permiso para usar la cámara</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionText}>Permitir cámara</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!mediaPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Necesitamos permiso para guardar fotos en tu galería</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestMediaPermission}>
          <Text style={styles.permissionText}>Permitir galería</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function takeAndSavePhoto() {
    if (!cameraRef.current || !cameraReady || saving) {
      return;
    }

    setSaving(true);
    try {
      const photo = await cameraRef.current.takePictureAsync();
      await Asset.create(photo.uri);
      Alert.alert('Listo', 'La foto se guardó en tu galería.');
    } catch (error) {
      Alert.alert('Error', error?.message ?? 'No se pudo guardar la foto.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        onCameraReady={() => setCameraReady(true)}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Voltear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.captureButton, saving && styles.captureButtonDisabled]}
          onPress={takeAndSavePhoto}
          disabled={saving || !cameraReady}
        >
          <View style={styles.captureInner} />
        </TouchableOpacity>
        <View style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    color: '#fff',
    fontSize: 16,
  },
  permissionButton: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionText: {
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  button: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  captureButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
});

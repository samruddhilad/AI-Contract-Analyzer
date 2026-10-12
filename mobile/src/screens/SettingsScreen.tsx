import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useMobileContract } from '../context/ContractContext';
import { LAN_HOST_IP } from '../config';

export const SettingsScreen: React.FC = () => {
  const {
    colors,
    theme,
    toggleTheme,
    backendConnected,
    backendUrl,
    setBackendUrl,
    checkHealth,
  } = useMobileContract();

  const [inputUrl, setInputUrl] = useState(backendUrl);

  const handleSaveUrl = (urlToSave?: string) => {
    const target = (urlToSave || inputUrl).trim();
    setInputUrl(target);
    setBackendUrl(target);
    checkHealth();
    Alert.alert('Saved', `Backend endpoint updated to ${target}`);
  };

  const applyPreset = (presetUrl: string) => {
    setInputUrl(presetUrl);
    handleSaveUrl(presetUrl);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.bgBase }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          Manage interface theme, backend server address, and review app info.
        </Text>
      </View>

      {/* 1. Theme Card */}
      <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Appearance</Text>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
          Current Theme: {theme === 'light' ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
        </Text>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.btn, { backgroundColor: colors.bgSurfaceSubtle, borderColor: colors.borderSubtle }]}
        >
          <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
            Switch to {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Backend URL Card */}
      <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>FastAPI Backend</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: backendConnected ? colors.riskLowBg : colors.riskHighBg },
            ]}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                color: backendConnected ? colors.riskLow : colors.riskHigh,
              }}
            >
              {backendConnected ? 'CONNECTED' : 'OFFLINE'}
            </Text>
          </View>
        </View>

        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
          For physical devices, use your computer's Wi-Fi IP (e.g. http://192.168.1.15:8000). Android emulator uses http://10.0.2.2:8000.
        </Text>

        <TextInput
          value={inputUrl}
          onChangeText={setInputUrl}
          placeholder="http://127.0.0.1:8000"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              backgroundColor: colors.bgSurfaceSubtle,
              color: colors.textPrimary,
              borderColor: colors.borderSubtle,
            },
          ]}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Quick Platform Presets */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => applyPreset('http://127.0.0.1:8000')}
            style={{
              paddingHorizontal: 8,
              paddingVertical: 5,
              borderRadius: 6,
              backgroundColor: colors.bgSurfaceSubtle,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
            }}
          >
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>💻 127.0.0.1 (Web/iOS)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => applyPreset('http://10.0.2.2:8000')}
            style={{
              paddingHorizontal: 8,
              paddingVertical: 5,
              borderRadius: 6,
              backgroundColor: colors.bgSurfaceSubtle,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
            }}
          >
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>🤖 10.0.2.2 (Android)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => applyPreset(`http://${LAN_HOST_IP}:8000`)}
            style={{
              paddingHorizontal: 8,
              paddingVertical: 5,
              borderRadius: 6,
              backgroundColor: colors.bgSurfaceSubtle,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
            }}
          >
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>📱 {LAN_HOST_IP} (LAN)</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => handleSaveUrl()}
            style={[styles.btn, { flex: 1, backgroundColor: colors.primary }]}
          >
            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 13 }}>Save & Test</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={checkHealth}
            style={[styles.btn, { backgroundColor: colors.bgSurfaceSubtle, borderColor: colors.borderSubtle, paddingHorizontal: 16 }]}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 13 }}>↻</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Firebase Status */}
      <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Cloud & Persistence</Text>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
          Local storage active. Cloud Firestore synchronization activates when credentials are configured in firebaseConfig.ts.
        </Text>
        <View style={[styles.statusPill, { backgroundColor: colors.bgSurfaceSubtle }]}>
          <Text style={{ fontSize: 12, color: colors.textPrimary }}>
            📦 Local Storage: <Text style={{ color: colors.riskLow, fontWeight: '700' }}>Active</Text>
          </Text>
        </View>
      </View>

      {/* 4. Model Architecture */}
      <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Architecture</Text>
        <Text style={[styles.cardDesc, { color: colors.textSecondary, lineHeight: 18 }]}>
          • Model: Qwen2.5-1.5B-Instruct SLM{'\n'}
          • Design System: Stitch MCP LexiGuard AI{'\n'}
          • Pipeline: Text Extraction → NLP Classification → Chunk Embeddings → SLM Q&A
        </Text>
      </View>

      {/* 5. Legal Disclaimer */}
      <View style={[styles.disclaimerCard, { backgroundColor: colors.riskMediumBg, borderColor: colors.riskMediumBorder }]}>
        <Text style={[styles.disclaimerTitle, { color: colors.riskMedium }]}>
          Legal Disclaimer
        </Text>
        <Text style={[styles.disclaimerText, { color: colors.textPrimary }]}>
          "AI-generated contract analysis is for informational and research purposes only and is not legal advice."
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  header: {
    gap: 4,
    marginTop: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  sub: {
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  statusPill: {
    padding: 10,
    borderRadius: 6,
  },
  disclaimerCard: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});

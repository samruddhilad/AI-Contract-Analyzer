import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useMobileContract } from '../context/ContractContext';

export const UploadScreen: React.FC = () => {
  const { colors, isAnalyzing, analyzeDocument, backendConnected, isHealthChecked, checkHealth } = useMobileContract();
  const [selectedAsset, setSelectedAsset] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (res.canceled) return;
      const asset = res.assets[0];

      const ext = asset.name.substring(asset.name.lastIndexOf('.')).toLowerCase();
      if (!['.pdf', '.docx', '.txt'].includes(ext)) {
        Alert.alert('Unsupported Format', 'Please choose a .pdf, .docx, or .txt file.');
        return;
      }

      setSelectedAsset(asset);
    } catch (e: any) {
      Alert.alert('Selection Error', e.message || 'Could not access document.');
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpload = async () => {
    if (!selectedAsset || isAnalyzing || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await analyzeDocument({
        uri: selectedAsset.uri,
        name: selectedAsset.name,
        mimeType: selectedAsset.mimeType,
        size: selectedAsset.size,
        file: (selectedAsset as any).file,
      });
      setSelectedAsset(null);
    } catch (err: any) {
      Alert.alert('Analysis Failed', err.message || 'Backend could not process document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.bgBase }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Upload Contract</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          Select a legal document from your device storage. Supports PDF, DOCX, and TXT files.
        </Text>
      </View>

      {isHealthChecked && !backendConnected && (
        <View style={[styles.warningBanner, { backgroundColor: colors.riskHighBg, borderColor: colors.riskHighBorder }]}>
          <Text style={{ fontSize: 18 }}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.warningText, { color: colors.riskHigh }]}>
              Backend is offline. Ensure FastAPI is running on port 8000 and check Settings for LAN IP.
            </Text>
          </View>
          <TouchableOpacity
            onPress={checkHealth}
            style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.bgSurface, borderRadius: 6 }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.riskHigh }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Picker Zone */}
      {!selectedAsset ? (
        <TouchableOpacity
          onPress={pickDocument}
          style={[
            styles.dropZone,
            {
              backgroundColor: colors.bgSurface,
              borderColor: colors.primary,
            },
          ]}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 44, marginBottom: 8 }}>📄</Text>
          <Text style={[styles.dropTitle, { color: colors.textPrimary }]}>Select Document</Text>
          <Text style={[styles.dropSub, { color: colors.textMuted }]}>
            Tap to open native document picker
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>PDF • DOCX • TXT</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle },
          ]}
        >
          <View style={styles.fileRow}>
            <Text style={{ fontSize: 32 }}>📑</Text>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={[styles.fileName, { color: colors.textPrimary }]}>
                {selectedAsset.name}
              </Text>
              <Text style={[styles.fileMeta, { color: colors.textMuted }]}>
                {formatBytes(selectedAsset.size)} • {selectedAsset.name.split('.').pop()?.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedAsset(null)}
              style={styles.removeBtn}
            >
              <Text style={{ color: colors.riskHigh, fontSize: 18, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleUpload}
            disabled={isAnalyzing || isSubmitting}
            style={[
              styles.startBtn,
              {
                backgroundColor: colors.primary,
                opacity: isAnalyzing || isSubmitting ? 0.6 : 1,
              },
            ]}
          >
            {isAnalyzing || isSubmitting ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.btnText}>Analyzing with Qwen SLM...</Text>
              </View>
            ) : (
              <Text style={styles.btnText}>Start AI Analysis</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Progress Box if analyzing */}
      {isAnalyzing && (
        <View style={[styles.progressCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.progressTitle, { color: colors.textPrimary }]}>
            Extracting text & running SLM reasoning
          </Text>
          <Text style={[styles.progressSub, { color: colors.textMuted }]}>
            Evaluating clauses, risks, and entities via Qwen2.5-1.5B...
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    gap: 6,
    marginTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  sub: {
    fontSize: 13,
    lineHeight: 18,
  },
  warningBanner: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  dropZone: {
    padding: 36,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dropTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  dropSub: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '700',
  },
  fileMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  removeBtn: {
    padding: 6,
  },
  startBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  progressCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  progressSub: {
    fontSize: 12,
    textAlign: 'center',
  },
});

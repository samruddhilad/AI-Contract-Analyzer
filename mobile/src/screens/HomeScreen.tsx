import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useMobileContract } from '../context/ContractContext';

export const HomeScreen: React.FC = () => {
  const { colors, setActiveTab, contractHistory, selectContract, activeContract } = useMobileContract();

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.bgBase }]}>
      {/* Greeting Banner */}
      <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
        <Text style={styles.heroSub}>SLM-POWERED CONTRACT REVIEW</Text>
        <Text style={styles.heroTitle}>AI Contract Analyzer</Text>
        <Text style={styles.heroDesc}>
          Extract clauses, identify risks, and ask questions grounded in your legal documents.
        </Text>

        <TouchableOpacity
          onPress={() => setActiveTab('upload')}
          style={[styles.uploadBtn, { backgroundColor: '#ffffff' }]}
          activeOpacity={0.85}
        >
          <Text style={[styles.uploadBtnText, { color: colors.primary }]}>
            📤 Upload Contract (PDF/DOCX/TXT)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Contract Quick Actions */}
      {activeContract && (
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bgSurface,
              borderColor: colors.borderSubtle,
              borderLeftColor: colors.primary,
              borderLeftWidth: 4,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Active Document</Text>
          <Text style={[styles.docName, { color: colors.primary }]}>
            {activeContract.filename}
          </Text>
          <Text style={[styles.docType, { color: colors.textMuted }]}>
            {activeContract.contract_type?.contract_type} •{' '}
            {Math.round((activeContract.contract_type?.confidence || 0) * 100)}% Confidence
          </Text>

          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={() => setActiveTab('contracts')}
              style={[styles.smallBtn, { backgroundColor: colors.bgSurfaceSubtle, borderColor: colors.borderSubtle }]}
            >
              <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '600' }}>
                View Analysis
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('ask_ai')}
              style={[styles.smallBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                Ask AI Questions 💬
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Recent Contracts Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Analyses</Text>
        {contractHistory.length > 0 && (
          <TouchableOpacity onPress={() => setActiveTab('contracts')}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {contractHistory.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>📄</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Contracts Yet</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
            Upload a PDF, DOCX, or TXT file to begin your analysis.
          </Text>
        </View>
      ) : (
        contractHistory.slice(0, 3).map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              selectContract(item);
              setActiveTab('contracts');
            }}
            style={[styles.historyItem, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={[styles.historyName, { color: colors.textPrimary }]}>
                {item.filename}
              </Text>
              <Text style={[styles.historyType, { color: colors.textMuted }]}>
                {item.contract_type} • {new Date(item.analyzed_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={{ color: colors.primary, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ))
      )}

      {/* Model Spec Card */}
      <View style={[styles.modelCard, { backgroundColor: colors.bgSurfaceSubtle, borderColor: colors.borderSubtle }]}>
        <Text style={[styles.modelTitle, { color: colors.textPrimary }]}>🧠 Qwen2.5-1.5B-Instruct</Text>
        <Text style={[styles.modelDesc, { color: colors.textMuted }]}>
          Private, fast, on-device compatible Small Language Model for legal understanding without data leakage.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  heroCard: {
    padding: 20,
    borderRadius: 16,
    gap: 10,
  },
  heroSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#e0e7ff',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  heroDesc: {
    fontSize: 13,
    color: '#e0e7ff',
    lineHeight: 18,
  },
  uploadBtn: {
    marginTop: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  docName: {
    fontSize: 16,
    fontWeight: '700',
  },
  docType: {
    fontSize: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  smallBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyType: {
    fontSize: 11,
    marginTop: 2,
  },
  modelCard: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  modelTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  modelDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
});

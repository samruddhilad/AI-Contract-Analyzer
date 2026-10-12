import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useMobileContract } from '../context/ContractContext';
import { AnalysisScreen } from './AnalysisScreen';

export const ContractsScreen: React.FC = () => {
  const {
    contractHistory,
    activeContract,
    selectContract,
    deleteContract,
    setActiveTab,
    colors,
  } = useMobileContract();

  // If an active contract is selected and we want to view it, we can display Analysis or list
  const [viewMode, setViewMode] = React.useState<'list' | 'detail'>('list');

  const handleOpen = (item: any) => {
    selectContract(item);
    setViewMode('detail');
  };

  const handleAsk = (item: any) => {
    selectContract(item);
    setActiveTab('ask_ai');
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Delete Contract', `Are you sure you want to remove ${name} from history?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteContract(id) },
    ]);
  };

  if (viewMode === 'detail' && activeContract) {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={() => setViewMode('list')}
          style={[styles.backBar, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderSubtle }]}
        >
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>
            ‹ Back to All Contracts
          </Text>
        </TouchableOpacity>
        <AnalysisScreen />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.bgBase }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Contract History</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          Review previous contracts, check risk analyses, or ask grounded questions.
        </Text>
      </View>

      {contractHistory.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>📑</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Contracts in History</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
            Contracts analyzed will appear here for future reference.
          </Text>
          <TouchableOpacity
            onPress={() => setActiveTab('upload')}
            style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 12 }]}
          >
            <Text style={styles.btnText}>Upload Contract</Text>
          </TouchableOpacity>
        </View>
      ) : (
        contractHistory.map((item) => (
          <View
            key={item.id}
            style={[
              styles.card,
              { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={[styles.fileName, { color: colors.textPrimary }]}>
                  {item.filename}
                </Text>
                <Text style={[styles.fileType, { color: colors.textMuted }]}>
                  {item.contract_type} • {new Date(item.analyzed_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.riskLowBg }]}>
                <Text style={[styles.badgeText, { color: colors.riskLow }]}>
                  {Math.round(item.confidence * 100)}% Match
                </Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => handleOpen(item)}
                style={[styles.actionBtn, { backgroundColor: colors.bgSurfaceSubtle, borderColor: colors.borderSubtle }]}
              >
                <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '600' }}>
                  Open Analysis
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleAsk(item)}
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                  Ask AI 💬
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => confirmDelete(item.id, item.filename)}
                style={[styles.deleteBtn, { borderColor: colors.riskHighBorder }]}
              >
                <Text style={{ color: colors.riskHigh, fontSize: 12, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
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
  backBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: 'center',
  },
  primaryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '700',
  },
  fileType: {
    fontSize: 11,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useMobileContract } from '../context/ContractContext';

export const AnalysisScreen: React.FC = () => {
  const { activeContract, colors, setActiveTab } = useMobileContract();
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const [clausesExpanded, setClausesExpanded] = useState(true);
  const [risksExpanded, setRisksExpanded] = useState(true);
  const [entitiesExpanded, setEntitiesExpanded] = useState(true);

  if (!activeContract) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.bgBase }]}>
        <Text style={{ fontSize: 40, marginBottom: 8 }}>📄</Text>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Contract Selected</Text>
        <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
          Upload a contract or choose one from the Contracts tab to inspect analysis results.
        </Text>
        <TouchableOpacity
          onPress={() => setActiveTab('upload')}
          style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 12 }]}
        >
          <Text style={styles.btnText}>Upload Document</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const confidence = Math.round((activeContract.contract_type?.confidence || 0) * 100);

  const clausesList = [
    { key: 'termination', name: 'Termination' },
    { key: 'payment', name: 'Payment Terms' },
    { key: 'confidentiality', name: 'Confidentiality' },
    { key: 'liability', name: 'Liability & Indemnity' },
    { key: 'renewal', name: 'Renewal' },
    { key: 'governing_law', name: 'Governing Law' },
    { key: 'intellectual_property', name: 'Intellectual Property' },
    { key: 'non_compete', name: 'Non-Compete' },
    { key: 'data_privacy', name: 'Data Privacy' },
  ];

  const checkClause = (key: string) => {
    for (const [k, v] of Object.entries(activeContract.clauses || {})) {
      if (k.toLowerCase().includes(key)) {
        return Boolean(v);
      }
    }
    return false;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}>
          <Text numberOfLines={2} style={[styles.docTitle, { color: colors.textPrimary }]}>
            {activeContract.filename}
          </Text>

          <View style={styles.tagRow}>
            <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {activeContract.contract_type?.contract_type}
              </Text>
            </View>

            <View style={[styles.badge, { backgroundColor: colors.riskLowBg }]}>
              <Text style={[styles.badgeText, { color: colors.riskLow }]}>
                {confidence}% Confidence
              </Text>
            </View>
          </View>
        </View>

        {/* 1. Summary Card */}
        <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}>
          <TouchableOpacity
            onPress={() => setSummaryExpanded(!summaryExpanded)}
            style={styles.cardHeader}
          >
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
              📝 Executive Summary
            </Text>
            <Text style={{ color: colors.primary, fontSize: 13 }}>{summaryExpanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {summaryExpanded && (
            <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
              {activeContract.summary}
            </Text>
          )}
        </View>

        {/* 2. Key Extracted Information */}
        <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}>
          <TouchableOpacity
            onPress={() => setEntitiesExpanded(!entitiesExpanded)}
            style={styles.cardHeader}
          >
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
              🏷️ Key Information
            </Text>
            <Text style={{ color: colors.primary, fontSize: 13 }}>{entitiesExpanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {entitiesExpanded && (
            <View style={{ gap: 10 }}>
              {activeContract.entities?.parties && activeContract.entities.parties.length > 0 && (
                <View>
                  <Text style={[styles.subLabel, { color: colors.textMuted }]}>PARTIES</Text>
                  <Text style={[styles.entityVal, { color: colors.textPrimary }]}>
                    {activeContract.entities.parties.join(', ')}
                  </Text>
                </View>
              )}

              {activeContract.entities?.dates && activeContract.entities.dates.length > 0 && (
                <View>
                  <Text style={[styles.subLabel, { color: colors.textMuted }]}>IMPORTANT DATES</Text>
                  <Text style={[styles.entityVal, { color: colors.textPrimary }]}>
                    {activeContract.entities.dates.join(', ')}
                  </Text>
                </View>
              )}

              {activeContract.entities?.money && activeContract.entities.money.length > 0 && (
                <View>
                  <Text style={[styles.subLabel, { color: colors.textMuted }]}>AMOUNTS & VALUES</Text>
                  <Text style={[styles.entityVal, { color: colors.riskLow }]}>
                    {activeContract.entities.money.join(', ')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* 3. Important Clauses */}
        <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}>
          <TouchableOpacity
            onPress={() => setClausesExpanded(!clausesExpanded)}
            style={styles.cardHeader}
          >
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
              ⚖️ Important Clauses
            </Text>
            <Text style={{ color: colors.primary, fontSize: 13 }}>{clausesExpanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {clausesExpanded && (
            <View style={styles.clauseGrid}>
              {clausesList.map((clause) => {
                const detected = checkClause(clause.key);
                return (
                  <View
                    key={clause.key}
                    style={[
                      styles.clauseItem,
                      {
                        backgroundColor: detected ? colors.riskLowBg : colors.bgSurfaceSubtle,
                        borderColor: detected ? colors.riskLowBorder : colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.clauseName,
                        { color: detected ? colors.riskLow : colors.textMuted },
                      ]}
                    >
                      {detected ? '✓' : '✗'} {clause.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 4. Risk / Attention Points */}
        <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}>
          <TouchableOpacity
            onPress={() => setRisksExpanded(!risksExpanded)}
            style={styles.cardHeader}
          >
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
              ⚠️ Risk / Attention Points
            </Text>
            <Text style={{ color: colors.primary, fontSize: 13 }}>{risksExpanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {risksExpanded && (
            <View style={{ gap: 8 }}>
              <View style={[styles.riskBadge, { backgroundColor: colors.riskMediumBg, borderColor: colors.riskMediumBorder }]}>
                <Text style={[styles.riskBadgeText, { color: colors.riskMedium }]}>
                  Review Carefully • Potential Concerns
                </Text>
              </View>
              <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
                {activeContract.risk_analysis}
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Sticky Bottom Ask AI Button */}
      <View
        style={[
          styles.stickyFooter,
          {
            backgroundColor: colors.bgSurface,
            borderTopColor: colors.borderSubtle,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('ask_ai')}
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Ask AI Questions About This Contract 💬</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  docTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
  },
  subLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  entityVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  clauseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  clauseItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  clauseName: {
    fontSize: 11,
    fontWeight: '600',
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  riskBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    borderTopWidth: 1,
  },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

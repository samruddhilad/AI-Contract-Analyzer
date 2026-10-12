import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useMobileContract } from '../context/ContractContext';

export const TopBar: React.FC = () => {
  const { colors, theme, toggleTheme, activeContract, backendConnected } = useMobileContract();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgSurface,
          borderBottomColor: colors.borderSubtle,
        },
      ]}
    >
      <View style={styles.left}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>LexiGuard</Text>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: backendConnected ? colors.riskLow : colors.riskHigh },
          ]}
        />
      </View>

      {activeContract ? (
        <View style={[styles.docBadge, { backgroundColor: colors.primaryLight }]}>
          <Text
            numberOfLines={1}
            style={[styles.docName, { color: colors.primary }]}
          >
            {activeContract.filename || 'Active Document'}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        onPress={toggleTheme}
        style={[styles.themeBtn, { backgroundColor: colors.bgSurfaceSubtle, borderColor: colors.borderSubtle }]}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 13, color: colors.textPrimary, fontWeight: '600' }}>
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  docBadge: {
    maxWidth: 130,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  docName: {
    fontSize: 11,
    fontWeight: '600',
  },
  themeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
});

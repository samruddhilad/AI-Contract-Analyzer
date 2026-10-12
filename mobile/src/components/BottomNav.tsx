import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMobileContract, MobileTab } from '../context/ContractContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, colors, activeContract } = useMobileContract();

  const tabs: { key: MobileTab; label: string; icon: string }[] = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'upload', label: 'Upload', icon: '📤' },
    { key: 'contracts', label: 'Contracts', icon: '📑' },
    { key: 'ask_ai', label: 'Ask AI', icon: '💬' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bgSurface,
          borderTopColor: colors.borderSubtle,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 18 }}>{tab.icon}</Text>
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? colors.primary : colors.textMuted,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {tab.label}
            </Text>
            {tab.key === 'ask_ai' && activeContract && (
              <View style={[styles.badgeDot, { backgroundColor: colors.riskLow }]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 4,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 56,
    position: 'relative',
  },
  label: {
    fontSize: 10,
    marginTop: 2,
  },
  badgeDot: {
    position: 'absolute',
    top: 4,
    right: 14,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  MobileContractProvider,
  useMobileContract,
} from './src/context/ContractContext';
import { TopBar } from './src/components/TopBar';
import { BottomNav } from './src/components/BottomNav';

import { HomeScreen } from './src/screens/HomeScreen';
import { UploadScreen } from './src/screens/UploadScreen';
import { ContractsScreen } from './src/screens/ContractsScreen';
import { AskAiScreen } from './src/screens/AskAiScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const MainAppLayout: React.FC = () => {
  const { activeTab, colors, theme } = useMobileContract();

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'upload':
        return <UploadScreen />;
      case 'contracts':
        return <ContractsScreen />;
      case 'ask_ai':
        return <AskAiScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgSurface }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <TopBar />
      <View style={[styles.content, { backgroundColor: colors.bgBase }]}>
        {renderScreen()}
      </View>
      <BottomNav />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <MobileContractProvider>
      <MainAppLayout />
    </MobileContractProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useMobileContract } from '../context/ContractContext';
import { CitationAccordion } from '../components/CitationAccordion';

const SUGGESTIONS = [
  'What is the notice period?',
  'Can the landlord terminate early?',
  'What are the payment terms?',
  'Is there an automatic renewal clause?',
  'Who are the parties and governing law?',
];

export const AskAiScreen: React.FC = () => {
  const {
    activeContract,
    chatMessages,
    isAsking,
    askQuestion,
    clearChat,
    colors,
    setActiveTab,
  } = useMobileContract();

  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [chatMessages, isAsking]);

  if (!activeContract) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.bgBase }]}>
        <Text style={{ fontSize: 40, marginBottom: 8 }}>💬</Text>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Contract Selected</Text>
        <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
          Please upload or choose a contract first to ask questions grounded in the document.
        </Text>
        <TouchableOpacity
          onPress={() => setActiveTab('upload')}
          style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 12 }]}
        >
          <Text style={styles.btnText}>Upload Contract</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim() || isAsking) return;
    askQuestion(q);
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bgBase }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Document Context Header Banner */}
      <View
        style={[
          styles.docBanner,
          {
            backgroundColor: colors.bgSurface,
            borderBottomColor: colors.borderSubtle,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.docSub, { color: colors.textMuted }]}>CURRENT CONTRACT</Text>
          <Text numberOfLines={1} style={[styles.docTitle, { color: colors.textPrimary }]}>
            {activeContract.filename}
          </Text>
        </View>

        {chatMessages.length > 0 && (
          <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Suggested Questions Chips */}
      <View style={[styles.suggestionsRow, { backgroundColor: colors.bgSurfaceSubtle }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}>
          {SUGGESTIONS.map((sug, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleSend(sug)}
              disabled={isAsking}
              style={[styles.chip, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, { color: colors.textPrimary }]}>{sug}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chat Messages List */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.chatScroll}
      >
        {chatMessages.length === 0 ? (
          <View style={styles.welcomeBox}>
            <Text style={{ fontSize: 32, marginBottom: 6 }}>🤖</Text>
            <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>
              Ask Anything About This Contract
            </Text>
            <Text style={[styles.welcomeDesc, { color: colors.textMuted }]}>
              Questions are answered by Qwen2.5-1.5B-Instruct using retrieved contract passages.
            </Text>
          </View>
        ) : (
          chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[
                  styles.msgRow,
                  { justifyContent: isUser ? 'flex-end' : 'flex-start' },
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isUser
                      ? [styles.userBubble, { backgroundColor: colors.primary }]
                      : [styles.aiBubble, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }],
                  ]}
                >
                  <Text
                    style={[
                      styles.msgText,
                      { color: isUser ? '#ffffff' : colors.textPrimary },
                    ]}
                  >
                    {msg.text}
                  </Text>

                  {/* Sources Accordion */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <CitationAccordion sources={msg.sources} />
                  )}

                  <Text
                    style={[
                      styles.timestamp,
                      { color: isUser ? 'rgba(255,255,255,0.7)' : colors.textMuted },
                    ]}
                  >
                    {msg.timestamp}
                  </Text>
                </View>
              </View>
            );
          })
        )}

        {isAsking && (
          <View style={[styles.typingBox, { backgroundColor: colors.bgSurface, borderColor: colors.borderSubtle }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.typingText, { color: colors.textMuted }]}>
              Searching contract & generating answer...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Input */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.bgSurface,
            borderTopColor: colors.borderSubtle,
          },
        ]}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask a question about this contract..."
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              backgroundColor: colors.bgSurfaceSubtle,
              color: colors.textPrimary,
              borderColor: colors.borderSubtle,
            },
          ]}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />

        <TouchableOpacity
          onPress={() => handleSend()}
          disabled={!input.trim() || isAsking}
          style={[
            styles.sendBtn,
            {
              backgroundColor: colors.primary,
              opacity: !input.trim() || isAsking ? 0.5 : 1,
            },
          ]}
        >
          <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 13 }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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
  primaryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  docBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  docSub: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  clearBtn: {
    padding: 6,
  },
  suggestionsRow: {
    paddingVertical: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chatScroll: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  welcomeBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  welcomeDesc: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 16,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 14,
  },
  userBubble: {
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    borderBottomLeftRadius: 2,
    borderWidth: 1,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  typingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  typingText: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 14,
    borderWidth: 1,
  },
  sendBtn: {
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

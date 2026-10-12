import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMobileContract } from '../context/ContractContext';

interface CitationAccordionProps {
  sources: string[];
}

export const CitationAccordion: React.FC<CitationAccordionProps> = ({ sources }) => {
  const [expanded, setExpanded] = useState(false);
  const { colors } = useMobileContract();

  if (!sources || sources.length === 0) return null;

  return (
    <View style={[styles.container, { borderTopColor: colors.borderSubtle }]}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.header}
        activeOpacity={0.7}
      >
        <Text style={[styles.toggleText, { color: colors.primary }]}>
          {expanded ? '▲' : '▼'} Sources from document ({sources.length} excerpt{sources.length > 1 ? 's' : ''})
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          {sources.map((src, i) => (
            <View
              key={i}
              style={[
                styles.card,
                {
                  backgroundColor: colors.bgSurface,
                  borderColor: colors.borderSubtle,
                  borderLeftColor: colors.primary,
                },
              ]}
            >
              <Text style={[styles.excerptIndex, { color: colors.textMuted }]}>
                Excerpt #{i + 1}
              </Text>
              <Text style={[styles.sourceText, { color: colors.textSecondary }]}>
                "{src.trim()}"
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
  },
  header: {
    paddingVertical: 4,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    marginTop: 6,
    gap: 6,
  },
  card: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  excerptIndex: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  sourceText: {
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});

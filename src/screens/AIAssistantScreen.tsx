import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import { spacing, radii, useTheme } from '../theme/colors';
import Icon from '../components/Icon';

type Message = { id: string; from: 'user' | 'assistant'; text: string };

const initialMessages: Message[] = [
  {
    id: '1',
    from: 'assistant',
    text: "Hi, I'm here to help with day-to-day questions. I'm not a diagnostic tool — for medical concerns, please talk to your child's care team.",
  },
];

const chatWithAssistant = httpsCallable<{ messages: { from: string; text: string }[] }, { reply: string }>(functions, 'chatWithAssistant');

export default function AIAssistantScreen({ navigation }: any) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const { colors } = useTheme();

  const send = async () => {
    if (!input.trim() || sending) return;
    const userMsg: Message = { id: Date.now().toString(), from: 'user', text: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setSending(true);
    try {
      const result = await chatWithAssistant({ messages: nextMessages.map((m) => ({ from: m.from, text: m.text })) });
      setMessages((prev) => [...prev, { id: Date.now().toString() + '-a', from: 'assistant', text: result.data.reply }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { id: Date.now().toString() + '-err', from: 'assistant', text: "Sorry, I couldn't respond just now. Please try again in a moment." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="back" size={16} color={colors.primary} />
          <Text style={[styles.back, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Assistant</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView style={styles.messages} contentContainerStyle={{ padding: spacing.lg }}>
        {messages.map((m) => (
          <View key={m.id} style={[styles.bubble, m.from === 'user' ? [styles.userBubble, { backgroundColor: colors.primary }] : [styles.assistantBubble, { backgroundColor: colors.surface, borderColor: colors.border }]]}>
            <Text style={m.from === 'user' ? styles.userText : [styles.assistantText, { color: colors.ink }]}>{m.text}</Text>
          </View>
        ))}
        {sending && (
          <View style={[styles.bubble, styles.assistantBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask a question..."
          placeholderTextColor={colors.inkFaint}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          editable={!sending}
        />
        <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }]} onPress={send} disabled={sending}>
          <Text style={styles.sendButtonText}>{sending ? '…' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, paddingBottom: spacing.sm },
  back: { fontWeight: '600', fontSize: 15 },
  headerTitle: { fontWeight: '700', fontSize: 16 },
  messages: { flex: 1 },
  bubble: { maxWidth: '82%', borderRadius: radii.md, padding: spacing.sm, marginBottom: spacing.sm },
  assistantBubble: { borderWidth: 1, alignSelf: 'flex-start' },
  userBubble: { alignSelf: 'flex-end' },
  assistantText: { fontSize: 15 },
  userText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  inputRow: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm, borderTopWidth: 1 },
  input: {
    flex: 1, borderWidth: 1, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: 10,
  },
  sendButton: { borderRadius: radii.pill, paddingHorizontal: 20, justifyContent: 'center' },
  sendButtonText: { color: '#fff', fontWeight: '700' },
});

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import Card from '../components/Card';
import Chip from '../components/Chip';
import Icon from '../components/Icon';
import { spacing, radii, useTheme } from '../theme/colors';

const categories = ['All', 'Autism', 'ADHD', 'Learning', 'Language', 'Motor', 'Movement', 'Delay'];

interface Article {
  id: string;
  title: string;
  category: string;
  minutes: number;
  tone: 'primary' | 'coral' | 'teal';
  body: string;
}

const articles: Article[] = [
  {
    id: 'asd',
    title: 'Understanding Autism Spectrum Disorder',
    category: 'Autism',
    minutes: 7,
    tone: 'primary',
    body: 'Autism Spectrum Disorder (ASD) affects how your child communicates, socializes, and processes the world around them. Every child with autism is unique—there\'s no single "autism look," which is why it\'s called a spectrum.\n\nYou might notice your child has strong interests they dive deep into, or they prefer routines and find changes unsettling. Some children have different ways of playing, moving, or responding to sounds, lights, or textures. Others may speak differently or take longer to pick up language.\n\nIf you\'re seeing things like limited eye contact, not responding to their name, delayed speech, or difficulty making friends, it\'s worth talking to your pediatrician. An early evaluation can help you understand your child\'s strengths and challenges—and get support that makes a real difference. Many autistic children thrive with the right understanding, structure, and accommodation. You\'re not looking for a "cure"—you\'re looking for clarity and tools to help your child flourish.',
  },
  {
    id: 'adhd',
    title: 'What You Should Know About ADHD',
    category: 'ADHD',
    minutes: 6,
    tone: 'coral',
    body: 'ADHD stands for Attention-Deficit/Hyperactivity Disorder. It\'s not about laziness or misbehavior—it\'s how your child\'s brain is wired when it comes to focus, impulse control, and activity level.\n\nYou might see your child get distracted by every sound, struggle to sit still, or blurt out answers before the question is finished. They may start projects and leave them unfinished, forget instructions, or act without thinking through consequences. Some children are very active; others are quietly inattentive and may seem "spaced out."\n\nIf these patterns are showing up at home and school, and they\'re getting in the way of learning or friendships, talk to your pediatrician. They can refer you for an evaluation. Understanding whether your child has ADHD helps you stop blaming yourself or them—and start using strategies that actually work for how their brain operates. With the right support, structure, and sometimes medication, many children with ADHD learn to manage their energy and attention really well.',
  },
  {
    id: 'id',
    title: 'Understanding Intellectual Disability',
    category: 'Delay',
    minutes: 8,
    tone: 'primary',
    body: 'Intellectual Disability means your child\'s thinking, learning, and adaptive skills develop more slowly than typical. It\'s not about intelligence in just one area—it\'s broader across reasoning, problem-solving, and daily living skills.\n\nYou might notice your child is later reaching milestones like walking or talking, has difficulty learning new routines, or needs extra help with everyday tasks like eating or dressing. They may struggle more in school or with understanding how to interact with other kids.\n\nIf you\'re seeing slow development across several areas, your pediatrician can refer you to a developmental specialist for evaluation. Early intervention—speech therapy, occupational therapy, or special education—can make a huge difference. Every child grows at their own pace, and having a clear picture of your child\'s abilities helps you set realistic expectations and find the right support. With patience and the right resources, children with intellectual disabilities learn, grow, and find ways to contribute meaningfully to their families and communities.',
  },
  {
    id: 'sld',
    title: 'Specific Learning Disorders Explained',
    category: 'Learning',
    minutes: 7,
    tone: 'teal',
    body: 'Specific Learning Disorders (like dyslexia, dyscalculia, and dysgraphia) affect how your child\'s brain processes information in specific areas—reading, math, or writing—even though their overall intelligence is typical.\n\nDyslexia means reading is slow or feels hard; your child might mix up letter sounds or struggle with word recognition. Dyscalculia affects math—number sense, basic facts, and problem-solving feel confusing. Dysgraphia shows up as messy handwriting, trouble organizing thoughts on paper, or spelling difficulties.\n\nThese aren\'t signs of laziness or low ability. Your child\'s brain just needs information delivered differently. If you notice your child tries hard but reading, math, or writing stays very difficult compared to peers, ask your school for an evaluation or see your pediatrician. Once you understand the specific challenge, teachers can use specialized methods that work with your child\'s brain, not against it. Many successful people have learning disorders—they just needed the right tools and understanding along the way.',
  },
  {
    id: 'sld-speech',
    title: 'Speech & Language Disorders in Children',
    category: 'Language',
    minutes: 6,
    tone: 'teal',
    body: 'Speech and language disorders affect how your child produces sounds, understands language, or uses words to communicate. It\'s more than just mispronouncing a word or two—it\'s an ongoing pattern that gets in the way of being understood or understanding others.\n\nYour child might have a small vocabulary for their age, use short sentences, stutter or repeat sounds, or seem to miss what you\'re saying. Some children know words but can\'t say them clearly. Others struggle with the social side of talking—not picking up on cues about when to listen or take turns.\n\nIf your child\'s speech or language seems noticeably different or delayed compared to siblings or peers, bring it up with your pediatrician. A speech-language pathologist can evaluate whether there\'s a disorder and what kind of therapy might help. Early intervention—even starting before age 3—works wonders. With the right support, most children make great progress. Speech therapy isn\'t about "fixing" your child; it\'s about giving them tools to be understood and to understand the world around them.',
  },
  {
    id: 'dcd',
    title: 'Developmental Coordination Disorder (Dyspraxia)',
    category: 'Motor',
    minutes: 6,
    tone: 'primary',
    body: 'Developmental Coordination Disorder, also called dyspraxia, means your child struggles with coordinated movement and physical tasks in ways that are noticeably different from other kids their age.\n\nYou might see your child stumble often, seem clumsy, or have trouble with fine motor tasks like tying shoes, using scissors, or holding a pencil. Sports and playground skills may be harder than for peers. They might move in awkward ways or bump into things frequently. Some children also have trouble planning out movements.\n\nDyspraxia isn\'t laziness or carelessness—it\'s how their brain is coordinating messages to their muscles. If your child\'s motor skills seem significantly behind or causing frustration, talk to your pediatrician. An occupational therapist can evaluate and work with your child on coordination, balance, and confidence. With practice and targeted exercises, children improve. Many kids with dyspraxia learn workarounds and build confidence. The goal is helping your child feel capable in their own body.',
  },
  {
    id: 'tics',
    title: 'Understanding Tic Disorders',
    category: 'Movement',
    minutes: 5,
    tone: 'coral',
    body: 'Tic disorders involve sudden, repeated movements or sounds your child doesn\'t control. Tics can be simple (like eye blinking or shoulder shrugging) or complex (like touching things a certain way or saying words). They often get worse with stress or excitement.\n\nYou might notice your child blinks rapidly, clears their throat frequently, sniffs, shrugs, or says words or sounds they didn\'t mean to. They may be able to hold the tic back briefly but feel uncomfortable doing so. Tics are involuntary—your child isn\'t doing this on purpose.\n\nTourette Syndrome involves multiple motor and vocal tics lasting over a year. Other tic disorders are shorter or involve just one type. If tics are new, bothering your child, or causing social problems, see your pediatrician. Many tics are mild and don\'t need treatment. When they do, behavior strategies and sometimes medication help. The key is understanding your child isn\'t misbehaving—their nervous system is creating these movements. Most children learn to manage tics over time.',
  },
  {
    id: 'gdd',
    title: 'Global Developmental Delay in Young Children',
    category: 'Delay',
    minutes: 8,
    tone: 'primary',
    body: 'Global Developmental Delay (GDD) is when a child under 5 is behind in most areas of development—speech, motor skills, thinking, social skills, or self-care—not just one area.\n\nYour child might walk or talk later than peers, struggle to learn new skills, have poor coordination, or seem to learn more slowly overall. You\'ve probably noticed they\'re behind in several ways, not just one.\n\nGDD is a description, not a diagnosis. It helps doctors identify that your child needs support across multiple areas so they can catch up. Early intervention is crucial—services like speech therapy, occupational therapy, and special education starting before age 3 can make enormous differences. Many children with GDD progress significantly with therapy and support; others may later get a more specific diagnosis that explains the delays.\n\nIf your child is behind, don\'t wait. Contact your state\'s early intervention program (usually free for ages 0–3) or talk to your pediatrician about evaluation. Getting support now isn\'t about putting a label on your child—it\'s about giving them tools and services to help them reach their potential.',
  },
  {
    id: 'smd',
    title: 'Stereotypic Movement Disorder',
    category: 'Movement',
    minutes: 5,
    tone: 'coral',
    body: 'Stereotypic Movement Disorder involves repetitive, rhythmic movements that serve no clear purpose—and sometimes cause self-injury. These aren\'t habits; they\'re persistent, often intense patterns.\n\nYou might see hand-flapping, spinning, rocking, head-banging, self-biting, or other repeated movements. Your child may do these when excited, stressed, or just throughout the day. The movements are more intense and frequent than typical self-soothing habits.\n\nStereotypic movements can happen alongside autism, intellectual disability, or other conditions—or on their own. Some movements are harmless; others may cause injury. If your child\'s movements are intense, frequent, or self-injurious, talk to your pediatrician. A developmental specialist can evaluate what\'s driving them and whether intervention is needed. Strategies like offering alternative sensory input, reducing stress, or redirecting can help. The goal isn\'t to eliminate every movement—it\'s to keep your child safe and help them regulate their nervous system in healthier ways.',
  },
];

export interface ExpandedState {
  [key: string]: boolean;
}

export default function KnowledgeHubScreen({ navigation }: any) {
  const [active, setActive] = useState('All');
  const { colors, typography } = useTheme();
  const visible = active === 'All' ? articles : articles.filter((a) => a.category === active);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.display}>Knowledge Hub</Text>
        <Text style={[typography.body, { marginBottom: spacing.md }]}>
          Evidence-based guides, reviewed by specialists.
        </Text>

        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Icon name="search" size={16} color={colors.inkFaint} />
          <TextInput placeholder="Search guides, conditions, topics" placeholderTextColor={colors.inkFaint} style={[styles.searchInput, { color: colors.ink }]} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: spacing.md }}>
          {categories.map((c) => (
            <TouchableOpacity key={c} onPress={() => setActive(c)}>
              <View style={[styles.catChip, { backgroundColor: colors.surface, borderColor: colors.border }, active === c && { backgroundColor: colors.ink, borderColor: colors.ink }]}> 
                <Text style={[styles.catText, { color: colors.inkSoft }, active === c && styles.catTextActive]}>{c}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured guide */}
        <View style={[styles.featured, { backgroundColor: colors.ink }]}> 
          <Chip label="FEATURED" tone="primary" />
          <Text style={styles.featuredTitle}>Understanding Your Child's Evaluation Report</Text>
          <Text style={styles.featuredBody}>A plain-language walkthrough of what those clinical terms actually mean.</Text>
          <Text style={styles.featuredMeta}>10 min read</Text>
        </View>

        {visible.map((a) => (
          <TouchableOpacity key={a.id} onPress={() => navigation.navigate('ArticleDetail', { article: a })}>
            <Card style={styles.articleCard}>
              <View style={[styles.thumb, { backgroundColor: a.tone === 'primary' ? colors.primarySoft : a.tone === 'coral' ? colors.coralSoft : colors.tealSoft }]}>
                <Text style={{ fontSize: 24 }}>📚</Text>
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Chip label={a.category} tone={a.tone} />
                <Text style={[styles.articleTitle, { color: colors.ink }]}>{a.title}</Text>
                <Text style={[typography.caption, { color: colors.inkFaint }]}>{a.minutes} min read</Text>
              </View>
              <Text style={{ fontSize: 16, color: colors.inkSoft, marginLeft: 8 }}>→</Text>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: radii.pill, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: 10, marginBottom: spacing.md,
  },
  searchInput: { flex: 1, fontSize: 14 },
  catChip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: radii.pill, borderWidth: 1 },
  catChipActive: { borderColor: 'transparent' },
  catText: { fontSize: 13, fontWeight: '600' },
  catTextActive: { color: '#fff' },
  featured: { borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md },
  featuredTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 10, marginBottom: 6 },
  featuredBody: { color: '#C7CAD6', fontSize: 14, lineHeight: 20, marginBottom: 10 },
  featuredMeta: { color: '#8B90A3', fontSize: 12, fontWeight: '600' },
  articleCard: { flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 48, height: 48, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  articleTitle: { fontSize: 15, fontWeight: '700', marginTop: 6, marginBottom: 4, lineHeight: 20 },
});

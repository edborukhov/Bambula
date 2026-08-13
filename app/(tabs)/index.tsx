import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WorkoutCard } from "@/components/WorkoutCard";
import { useWorkout } from "@/context/WorkoutContext";
import { useColors } from "@/hooks/useColors";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getWeekStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sessions, workouts } = useWorkout();

  const weekStart = getWeekStart();
  const thisWeekSessions = sessions.filter(
    (s) => new Date(s.date) >= weekStart
  );

  const weeklyVolume = useMemo(
    () => thisWeekSessions.reduce((sum, s) => sum + s.totalVolume, 0),
    [thisWeekSessions]
  );

  const lastSession = sessions[0];
  const featuredWorkouts = workouts.slice(0, 3);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPadding + 16,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Let's train
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.newBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/create-workout" as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.newBtnText}>Create</Text>
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={[colors.primary + "22", colors.primary + "08"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.statsCard, { borderColor: colors.primary + "33" }]}
      >
        <Text style={[styles.statsTitle, { color: colors.mutedForeground }]}>
          This Week
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {thisWeekSessions.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Workouts
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {Math.round(weeklyVolume / 1000)}k
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Volume (kg)
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {thisWeekSessions.reduce((sum, s) => sum + s.totalSets, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Sets
            </Text>
          </View>
        </View>
      </LinearGradient>

      {lastSession && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Last Session
          </Text>
          <TouchableOpacity
            style={[styles.lastSessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.75}
            onPress={() => router.push(`/workout/${lastSession.workoutId}` as any)}
          >
            <View style={styles.lastSessionLeft}>
              <Text style={[styles.lastSessionName, { color: colors.foreground }]}>
                {lastSession.workoutName}
              </Text>
              <Text style={[styles.lastSessionMeta, { color: colors.mutedForeground }]}>
                {new Date(lastSession.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
                {" · "}
                {formatDuration(lastSession.durationSeconds)}
                {" · "}
                {lastSession.totalSets} sets
              </Text>
            </View>
            <View style={[styles.replayBtn, { backgroundColor: colors.primary }]}>
              <Ionicons name="play" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Featured
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/workouts" as any)}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.workoutList}>
          {featuredWorkouts.map((w) => (
            <WorkoutCard
              key={w.id}
              workout={w}
              onPress={() => router.push(`/workout/${w.id}` as any)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular" },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", marginTop: 2 },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  newBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    marginLeft: 5,
  },
  statsCard: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  statsTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase" },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 26, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  statDivider: { width: 1, height: 40, marginHorizontal: 8 },
  section: { gap: 14 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  workoutList: { gap: 12 },
  lastSessionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  lastSessionLeft: { flex: 1, gap: 4 },
  lastSessionName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  lastSessionMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  replayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

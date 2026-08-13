import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Session, useWorkout } from "@/context/WorkoutContext";
import { useColors } from "@/hooks/useColors";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function SessionCard({ session }: { session: Session }) {
  const colors = useColors();
  const prs = session.exerciseLogs.reduce((sum, e) => {
    const maxWeight = Math.max(...e.sets.map((s) => s.weight));
    return sum + (maxWeight > 0 ? 1 : 0);
  }, 0);

  return (
    <View
      style={[
        styles.sessionCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={[styles.sessionName, { color: colors.foreground }]}>
            {session.workoutName}
          </Text>
          <Text style={[styles.sessionDate, { color: colors.mutedForeground }]}>
            {formatDate(session.date)}
          </Text>
        </View>
        <View style={[styles.durationBadge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.durationText, { color: colors.foreground }]}>
            {formatDuration(session.durationSeconds)}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {session.exerciseLogs.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Exercises</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {session.totalSets}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Sets</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {Math.round(session.totalVolume / 1000)}k
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Volume</Text>
        </View>
      </View>

      {session.notes ? (
        <View style={[styles.noteBox, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
          <Ionicons name="star" size={13} color={colors.primary} />
          <Text style={[styles.noteText, { color: colors.foreground }]} numberOfLines={2}>
            {session.notes}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sessions } = useWorkout();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={[styles.header, { paddingTop: topPadding + 16 }]}>
            <Text style={[styles.title, { color: colors.foreground }]}>History</Text>
            {sessions.length > 0 && (
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                {sessions.length} total workout{sessions.length !== 1 ? "s" : ""}
              </Text>
            )}
          </View>
        }
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => <SessionCard session={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={52} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No workouts yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Complete your first workout to see your history here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    lineHeight: 18,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 4,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular" },
  list: {
    paddingHorizontal: 20,
  },
  sessionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardLeft: { flex: 1, gap: 4 },
  sessionName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  sessionDate: { fontSize: 13, fontFamily: "Inter_400Regular" },
  durationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  durationText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  divider: { height: StyleSheet.hairlineWidth },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center", gap: 2 },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});

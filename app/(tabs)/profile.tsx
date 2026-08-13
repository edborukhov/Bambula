import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useWorkout } from "@/context/WorkoutContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sessions, settings, updateSettings } = useWorkout();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const stats = useMemo(() => {
    const totalVolume = sessions.reduce((sum, s) => sum + s.totalVolume, 0);
    const totalSets = sessions.reduce((sum, s) => sum + s.totalSets, 0);
    const totalMinutes = sessions.reduce((sum, s) => sum + Math.round(s.durationSeconds / 60), 0);

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = sessions
      .map((s) => {
        const d = new Date(s.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort((a, b) => b - a);

    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (dates[i] === expected.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return { totalVolume, totalSets, totalMinutes, streak };
  }, [sessions]);

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
      <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>

      <View style={styles.statsGrid}>
        {[
          { label: "Workouts", value: sessions.length.toString(), icon: "barbell-outline" as const },
          { label: "Sets Done", value: stats.totalSets.toString(), icon: "checkmark-circle-outline" as const },
          { label: "Volume (kg)", value: `${Math.round(stats.totalVolume / 1000)}k`, icon: "trending-up-outline" as const },
          { label: "Hours", value: Math.round(stats.totalMinutes / 60).toString(), icon: "time-outline" as const },
        ].map((item) => (
          <View
            key={item.label}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Ionicons name={item.icon} size={22} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{item.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
          </View>
        ))}
      </View>

      {stats.streak > 0 && (
        <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.primary + "44" }]}>
          <Ionicons name="flame" size={28} color={colors.primary} />
          <View style={styles.streakInfo}>
            <Text style={[styles.streakValue, { color: colors.foreground }]}>
              {stats.streak} day streak
            </Text>
            <Text style={[styles.streakLabel, { color: colors.mutedForeground }]}>
              Keep it going
            </Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Settings</Text>
        <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="scale-outline" size={20} color={colors.mutedForeground} />
              <View style={styles.settingText}>
                <Text style={[styles.settingName, { color: colors.foreground }]}>Weight Unit</Text>
                <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>
                  {settings.weightUnit === "kg" ? "Kilograms (kg)" : "Pounds (lbs)"}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.weightUnit === "lbs"}
              onValueChange={(v) =>
                updateSettings({ weightUnit: v ? "lbs" : "kg" })
              }
              trackColor={{ false: colors.secondary, true: colors.primary + "80" }}
              thumbColor={settings.weightUnit === "lbs" ? colors.primary : colors.mutedForeground}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
        <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { icon: "barbell" as const, label: "Bambula", value: "v1.0.0" },
          ].map((item) => (
            <View key={item.label} style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
                <Text style={[styles.settingName, { color: colors.foreground }]}>{item.label}</Text>
              </View>
              <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 24 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "47%",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: "flex-start",
    gap: 8,
  },
  statValue: { fontSize: 24, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  streakInfo: { gap: 2 },
  streakValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  streakLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  section: { gap: 12 },
  sectionTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  settingCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingText: { gap: 2 },
  settingName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  settingDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
});

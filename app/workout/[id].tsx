import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ExerciseRow } from "@/components/ExerciseRow";
import { MuscleDiagram } from "@/components/MuscleDiagram";
import { useWorkout } from "@/context/WorkoutContext";
import { useColors } from "@/hooks/useColors";

function formatMinutes(min: number): string {
  if (min >= 60) return `${Math.floor(min / 60)}h ${min % 60}m`;
  return `${min}m`;
}

export default function WorkoutDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getWorkoutById, getExerciseById, settings, deleteCustomWorkout, schedule, setWorkoutSchedule } = useWorkout();

  const workout = getWorkoutById(id ?? "");

  // 0 = Mon … 6 = Sun
  const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
  const workoutDays: number[] = (id && schedule[id]) ? schedule[id] : [];

  const toggleDay = useCallback((day: number) => {
    if (!id) return;
    Haptics.selectionAsync();
    const current = schedule[id] ?? [];
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    setWorkoutSchedule(id, next);
  }, [id, schedule, setWorkoutSchedule]);

  if (!workout) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Workout not found</Text>
      </View>
    );
  }

  const totalSets = workout.exercises.reduce((sum, e) => sum + e.targetSets, 0);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/active-workout", params: { id: workout.id } });
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteCustomWorkout(workout.id);
    router.back();
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navBar, { paddingTop: topPadding + 8 }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.secondary }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color={colors.foreground} />
        </TouchableOpacity>
        {workout.isCustom && (
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.secondary }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={18} color={colors.destructive} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPadding + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: colors.primary + "22" },
            ]}
          >
            <Text style={[styles.categoryText, { color: colors.primary }]}>
              {workout.category}
            </Text>
          </View>
          <Text style={[styles.workoutName, { color: colors.foreground }]}>
            {workout.name}
          </Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {workout.description}
          </Text>

          <View style={styles.metaRow}>
            <View style={[styles.metaChip, { backgroundColor: colors.secondary }]}>
              <Ionicons name="time-outline" size={15} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {formatMinutes(workout.estimatedMinutes)}
              </Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: colors.secondary }]}>
              <Ionicons name="layers-outline" size={15} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {workout.exercises.length} exercises
              </Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: colors.secondary }]}>
              <Ionicons name="repeat-outline" size={15} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {totalSets} sets
              </Text>
            </View>
          </View>
        </View>

        {/* ── Schedule ── */}
        <View style={[styles.scheduleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.scheduleHeader}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Schedule</Text>
          </View>
          <View style={styles.dayRow}>
            {DAY_LABELS.map((label, idx) => {
              const active = workoutDays.includes(idx);
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => toggleDay(idx)}
                  activeOpacity={0.75}
                  style={[
                    styles.dayBtn,
                    active
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.secondary, borderColor: colors.border, borderWidth: 1 },
                  ]}
                >
                  <Text style={[
                    styles.dayLabel,
                    { color: active ? "#fff" : colors.mutedForeground },
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {workoutDays.length === 0 && (
            <Text style={[styles.scheduleMuted, { color: colors.mutedForeground }]}>
              Tap a day to add this workout to your weekly plan
            </Text>
          )}
        </View>

        <View style={[styles.muscleSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Muscles
          </Text>
          <MuscleDiagram
            exerciseIds={workout.exercises.map((e) => e.exerciseId)}
          />
        </View>

        <View style={styles.exerciseSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Exercises
          </Text>
          <View
            style={[
              styles.exerciseList,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {workout.exercises.map((we, idx) => {
              const exercise = getExerciseById(we.exerciseId);
              const name = we.customName ?? exercise?.name ?? "Unknown";
              const muscleGroup = we.customMuscleGroup ?? exercise?.muscleGroup ?? "";
              return (
                <ExerciseRow
                  key={we.exerciseId + idx}
                  index={idx}
                  name={name}
                  muscleGroup={muscleGroup}
                  sets={we.targetSets}
                  reps={we.targetReps}
                  weight={we.defaultWeight}
                  restSeconds={we.restSeconds}
                  weightUnit={settings.weightUnit}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.startContainer,
          {
            backgroundColor: colors.background,
            paddingBottom: bottomPadding + 16,
            borderTopColor: colors.border,
          },
        ]}
      >
        {showDeleteConfirm ? (
          <View style={styles.deleteConfirmRow}>
            <TouchableOpacity
              style={[styles.deleteConfirmBtn, { backgroundColor: colors.secondary, flex: 1 }]}
              onPress={() => setShowDeleteConfirm(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.deleteConfirmText, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteConfirmBtn, { backgroundColor: colors.destructive, flex: 2 }]}
              onPress={confirmDelete}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text style={[styles.deleteConfirmText, { color: "#fff" }]}>Delete Workout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
            onPress={handleStart}
            activeOpacity={0.85}
          >
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.startBtnText}>Start Workout</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 28 },
  heroSection: { gap: 10 },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  workoutName: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
  },
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  metaRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 4 },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  metaText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  muscleSection: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  exerciseSection: { gap: 12 },
  sectionTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  scheduleCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 14,
  },
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  dayLabel: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  scheduleMuted: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  exerciseList: {
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  startContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  deleteConfirmRow: {
    flexDirection: "row",
    gap: 10,
  },
  deleteConfirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: 16,
  },
  deleteConfirmText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 16,
  },
  startBtnText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
});

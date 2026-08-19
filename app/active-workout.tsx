import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ExerciseLog,
  Session,
  SetLog,
  useWorkout,
} from "@/context/WorkoutContext";
import { useColors } from "@/hooks/useColors";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export default function ActiveWorkoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getWorkoutById, getExerciseById, addSession, settings } = useWorkout();
  const [milestoneNote, setMilestoneNote] = useState("");

  const workout = getWorkoutById(id ?? "");

  const exerciseData = useMemo(() => {
    if (!workout) return [];
    return workout.exercises.map((we) => {
      const ex = getExerciseById(we.exerciseId);
      return {
        exerciseId: we.exerciseId,
        exerciseName: we.customName ?? ex?.name ?? "Unknown",
        muscleGroup: we.customMuscleGroup ?? ex?.muscleGroup ?? "",
        targetSets: we.targetSets,
        targetReps: we.targetReps,
        defaultWeight: we.defaultWeight,
        restSeconds: we.restSeconds,
      };
    });
  }, [workout, getExerciseById]);

  const isCircuit = workout?.workoutType === "circuit";

  const stepQueue = useMemo(() => {
    const steps: { exerciseIndex: number; setNumber: number }[] = [];
    if (exerciseData.length === 0) return steps;
    if (isCircuit) {
      const maxSets = Math.max(...exerciseData.map((e) => e.targetSets));
      for (let round = 0; round < maxSets; round++) {
        exerciseData.forEach((ex, exIdx) => {
          if (round < ex.targetSets) {
            steps.push({ exerciseIndex: exIdx, setNumber: round });
          }
        });
      }
    } else {
      exerciseData.forEach((ex, exIdx) => {
        for (let s = 0; s < ex.targetSets; s++) {
          steps.push({ exerciseIndex: exIdx, setNumber: s });
        }
      });
    }
    return steps;
  }, [exerciseData, isCircuit]);

  const [stepIndex, setStepIndex] = useState(0);
  const [exerciseSetLogs, setExerciseSetLogs] = useState<Record<number, SetLog[]>>({});
  const [allLogs, setAllLogs] = useState<ExerciseLog[]>([]);
  const [reps, setReps] = useState(exerciseData[0]?.targetReps ?? 10);
  const [weight, setWeight] = useState(exerciseData[0]?.defaultWeight ?? 0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef(Date.now());
  const [isFinished, setIsFinished] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const currentStep = stepQueue[stepIndex];
  const exerciseIndex = currentStep?.exerciseIndex ?? 0;
  const currentExercise = exerciseData[exerciseIndex];
  const completedSets = exerciseSetLogs[exerciseIndex] ?? [];

  useEffect(() => {
    if (exerciseData.length > 0) {
      setReps(exerciseData[0].targetReps);
      setWeight(exerciseData[0].defaultWeight);
    }
  }, []);

  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  useEffect(() => {
    if (!isResting || restTimeLeft <= 0) return;
    const timer = setTimeout(() => {
      setRestTimeLeft((prev) => {
        if (prev <= 1) {
          setIsResting(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [isResting, restTimeLeft]);

  useEffect(() => {
    if (exerciseData.length === 0) return;
    const totalSets = exerciseData.reduce((sum, e) => sum + e.targetSets, 0);
    const doneSets = allLogs.reduce((sum, l) => sum + l.sets.length, 0) + completedSets.length;
    const progress = totalSets > 0 ? doneSets / totalSets : 0;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [allLogs, completedSets, exerciseData]);

  if (!workout || exerciseData.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Workout not found</Text>
      </View>
    );
  }

  const handleLogSet = () => {
    if (!currentExercise || !currentStep) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newSet: SetLog = { reps, weight, completed: true };
    const updatedExerciseSetLogs = {
      ...exerciseSetLogs,
      [exerciseIndex]: [...(exerciseSetLogs[exerciseIndex] ?? []), newSet],
    };
    setExerciseSetLogs(updatedExerciseSetLogs);

    const nextStepIndex = stepIndex + 1;

    if (nextStepIndex >= stepQueue.length) {
      const finalLogs: ExerciseLog[] = exerciseData.map((ex, idx) => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        sets: updatedExerciseSetLogs[idx] ?? [],
      })).filter((log) => log.sets.length > 0);
      setAllLogs(finalLogs);
      saveAndFinish(finalLogs);
    } else {
      const nextStep = stepQueue[nextStepIndex];
      const nextEx = exerciseData[nextStep.exerciseIndex];
      setStepIndex(nextStepIndex);
      setReps(nextEx.targetReps);
      setWeight(nextEx.defaultWeight);
      if (!isCircuit) {
        setRestTimeLeft(currentExercise.restSeconds);
        setIsResting(true);
      }
    }
  };

  const saveAndFinish = (logs: ExerciseLog[]) => {
    const totalVolume = logs.reduce(
      (sum, log) =>
        sum + log.sets.reduce((s, set) => s + set.reps * set.weight, 0),
      0
    );
    const totalSets = logs.reduce((sum, log) => sum + log.sets.length, 0);

    const session: Session = {
      id: generateId(),
      workoutId: workout.id,
      workoutName: workout.name,
      date: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      exerciseLogs: logs,
      totalVolume,
      totalSets,
      notes: milestoneNote.trim() || undefined,
    };
    addSession(session);
    setIsFinished(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleQuit = () => {
    Alert.alert("End Workout", "Your progress will be lost.", [
      { text: "Keep Going", style: "cancel" },
      { text: "End", style: "destructive", onPress: () => router.back() },
    ]);
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  if (isFinished) {
    return (
      <View
        style={[
          styles.container,
          styles.finishContainer,
          { backgroundColor: colors.background, paddingTop: topPadding + 20 },
        ]}
      >
        <View style={[styles.finishIcon, { backgroundColor: colors.primary + "22" }]}>
          <Ionicons name="checkmark-circle" size={72} color={colors.primary} />
        </View>
        <Text style={[styles.finishTitle, { color: colors.foreground }]}>
          Workout Complete
        </Text>
        <Text style={[styles.finishSubtitle, { color: colors.mutedForeground }]}>
          {workout.name}
        </Text>

        <View style={{ width: "100%", marginTop: 16 }}>
          <Text style={[styles.inputLabel, { color: colors.mutedForeground, textAlign: "left", marginBottom: 6 }]}>
            MILESTONE NOTE (OPTIONAL)
          </Text>
          <TextInput
            style={[
              styles.stepValue,
              {
                flex: 0,
                width: "100%",
                height: 52,
                textAlign: "left",
                paddingHorizontal: 14,
                fontSize: 15,
                fontFamily: "Inter_500Medium",
                color: colors.foreground,
                backgroundColor: colors.input,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
            placeholder="e.g. New PR on bench press!"
            placeholderTextColor={colors.mutedForeground}
            value={milestoneNote}
            onChangeText={setMilestoneNote}
          />
        </View>

        <View style={styles.finishStats}>
          {[
            { label: "Duration", value: formatTime(elapsedSeconds) },
            { label: "Exercises", value: allLogs.length.toString() },
            {
              label: "Volume",
              value: `${Math.round(
                allLogs.reduce(
                  (sum, l) =>
                    sum + l.sets.reduce((s, set) => s + set.reps * set.weight, 0),
                  0
                ) / 1000
              )}k kg`,
            },
          ].map((s) => (
            <View
              key={s.label}
              style={[
                styles.finishStat,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.finishStatValue, { color: colors.foreground }]}>
                {s.value}
              </Text>
              <Text style={[styles.finishStatLabel, { color: colors.mutedForeground }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.doneBtn,
            { backgroundColor: colors.primary, marginBottom: bottomPadding + 20 },
          ]}
          onPress={() => router.replace("/(tabs)" as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalSetsInWorkout = exerciseData.reduce((sum, e) => sum + e.targetSets, 0);
  const doneSets =
    allLogs.reduce((sum, l) => sum + l.sets.length, 0) + completedSets.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <TouchableOpacity
          style={[styles.quitBtn, { backgroundColor: colors.secondary }]}
          onPress={handleQuit}
        >
          <Ionicons name="close" size={20} color={colors.foreground} />
        </TouchableOpacity>

        <View style={styles.timerBox}>
          <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.timerText, { color: colors.mutedForeground }]}>
            {formatTime(elapsedSeconds)}
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressWrapper}>
        <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
          {doneSets}/{totalSetsInWorkout} sets
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding + 120 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.exerciseHeader}>
          <Text style={[styles.exerciseMuscle, { color: colors.primary }]}>
            {currentExercise.muscleGroup.toUpperCase()}
          </Text>
          <Text style={[styles.exerciseName, { color: colors.foreground }]}>
            {currentExercise.exerciseName}
          </Text>
          <Text style={[styles.setCounter, { color: colors.mutedForeground }]}>
            Set {completedSets.length + 1} of {currentExercise.targetSets}
          </Text>
        </View>


        {completedSets.length > 0 && (
          <View
            style={[
              styles.prevSetsCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.prevSetsTitle, { color: colors.mutedForeground }]}>
              Previous sets
            </Text>
            {completedSets.map((s, i) => (
              <View key={i} style={styles.prevSetRow}>
                <Text style={[styles.prevSetNum, { color: colors.mutedForeground }]}>
                  {i + 1}
                </Text>
                <Text style={[styles.prevSetValue, { color: colors.foreground }]}>
                  {s.reps} reps
                </Text>
                {s.weight > 0 && (
                  <Text style={[styles.prevSetValue, { color: colors.foreground }]}>
                    {s.weight} {settings.weightUnit}
                  </Text>
                )}
                <Ionicons name="checkmark-circle" size={16} color={colors.success ?? "#30D158"} />
              </View>
            ))}
          </View>
        )}

        <View style={styles.inputSection}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>REPS</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={[styles.stepBtn, { backgroundColor: colors.secondary }]}
                onPress={() => setReps((p) => Math.max(1, p - 1))}
              >
                <Ionicons name="remove" size={22} color={colors.foreground} />
              </TouchableOpacity>
              <TextInput
                style={[
                  styles.stepValue,
                  { color: colors.foreground, backgroundColor: colors.input },
                ]}
                value={reps.toString()}
                onChangeText={(v) => {
                  const n = parseInt(v);
                  if (!isNaN(n) && n > 0) setReps(n);
                }}
                keyboardType="number-pad"
                selectTextOnFocus
              />
              <TouchableOpacity
                style={[styles.stepBtn, { backgroundColor: colors.secondary }]}
                onPress={() => setReps((p) => p + 1)}
              >
                <Ionicons name="add" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>
              WEIGHT ({settings.weightUnit})
            </Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={[styles.stepBtn, { backgroundColor: colors.secondary }]}
                onPress={() => setWeight((p) => Math.max(0, parseFloat((p - 2.5).toFixed(2))))}
              >
                <Ionicons name="remove" size={22} color={colors.foreground} />
              </TouchableOpacity>
              <TextInput
                style={[
                  styles.stepValue,
                  { color: colors.foreground, backgroundColor: colors.input },
                ]}
                value={weight.toString()}
                onChangeText={(v) => {
                  const n = parseFloat(v);
                  if (!isNaN(n) && n >= 0) setWeight(n);
                }}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
              <TouchableOpacity
                style={[styles.stepBtn, { backgroundColor: colors.secondary }]}
                onPress={() => setWeight((p) => parseFloat((p + 2.5).toFixed(2)))}
              >
                <Ionicons name="add" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.exerciseNav}>
          <Text style={[styles.exerciseNavLabel, { color: colors.mutedForeground }]}>
            Step {stepIndex + 1} / {stepQueue.length}
          </Text>
          {stepIndex + 1 < stepQueue.length && (
            <Text style={[styles.nextExercise, { color: colors.mutedForeground }]}>
              Next: {exerciseData[stepQueue[stepIndex + 1].exerciseIndex].exerciseName}
            </Text>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.logBtnContainer,
          {
            backgroundColor: colors.background,
            paddingBottom: bottomPadding + 16,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.logBtn, { backgroundColor: colors.primary }]}
          onPress={handleLogSet}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark" size={22} color="#fff" />
          <Text style={styles.logBtnText}>Log Set</Text>
        </TouchableOpacity>
      </View>

      {isResting && (
        <View style={[styles.restOverlay, { backgroundColor: colors.background + "F5" }]}>
          <View
            style={[
              styles.restCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.restTitle, { color: colors.mutedForeground }]}>
              REST
            </Text>
            <Text style={[styles.restTimer, { color: colors.primary }]}>
              {formatTime(restTimeLeft)}
            </Text>
            <Text style={[styles.restSubtitle, { color: colors.mutedForeground }]}>
              Set {completedSets.length} logged
            </Text>
            <TouchableOpacity
              style={[styles.skipRestBtn, { backgroundColor: colors.secondary }]}
              onPress={() => setIsResting(false)}
            >
              <Text style={[styles.skipRestText, { color: colors.foreground }]}>
                Skip Rest
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  quitBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  timerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  timerText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  progressWrapper: {
    paddingHorizontal: 20,
    gap: 6,
    marginBottom: 8,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, gap: 24 },
  exerciseHeader: { gap: 4 },
  exerciseMuscle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  exerciseName: { fontSize: 30, fontFamily: "Inter_700Bold" },
  setCounter: { fontSize: 15, fontFamily: "Inter_500Medium", marginTop: 4 },
  prevSetsCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  prevSetsTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  prevSetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  prevSetNum: { fontSize: 13, fontFamily: "Inter_400Regular", width: 16 },
  prevSetValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  inputSection: {
    flexDirection: "row",
    gap: 16,
  },
  inputGroup: { flex: 1, gap: 8 },
  inputLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textAlign: "center",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepBtn: {
    width: 44,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stepValue: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  exerciseNav: { gap: 4 },
  exerciseNavLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  nextExercise: { fontSize: 12, fontFamily: "Inter_400Regular" },
  logBtnContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  logBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 16,
  },
  logBtnText: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  restOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  restCard: {
    width: "80%",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
  restTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
  },
  restTimer: { fontSize: 56, fontFamily: "Inter_700Bold" },
  restSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular" },
  skipRestBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  skipRestText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  finishContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  finishIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  finishTitle: { fontSize: 32, fontFamily: "Inter_700Bold" },
  finishSubtitle: { fontSize: 16, fontFamily: "Inter_400Regular" },
  finishStats: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 8,
    width: "100%",
    justifyContent: "center",
  },
  finishStat: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
  },
  finishStatValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  finishStatLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  doneBtn: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  doneBtnText: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
});

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Workout, WorkoutExercise, useWorkout } from "@/context/WorkoutContext";
import { useColors } from "@/hooks/useColors";

const PRESET_CATEGORIES = [
  "Chest & Shoulders",
  "Back & Biceps",
  "Legs",
  "Full Upper",
  "Core",
  "Full Body",
];

interface ExerciseEntry {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  restSeconds: number;
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function Stepper({
  value,
  min,
  step,
  onChange,
}: {
  value: number;
  min: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const colors = useColors();
  return (
    <View style={stepperStyles.row}>
      <TouchableOpacity
        style={[stepperStyles.btn, { backgroundColor: colors.secondary }]}
        onPress={() => onChange(Math.max(min, parseFloat((value - step).toFixed(2))))}
      >
        <Ionicons name="remove" size={18} color={colors.foreground} />
      </TouchableOpacity>
      <Text style={[stepperStyles.value, { color: colors.foreground }]}>
        {value}
      </Text>
      <TouchableOpacity
        style={[stepperStyles.btn, { backgroundColor: colors.secondary }]}
        onPress={() => onChange(parseFloat((value + step).toFixed(2)))}
      >
        <Ionicons name="add" size={18} color={colors.foreground} />
      </TouchableOpacity>
    </View>
  );
}

const stepperStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  btn: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  value: { minWidth: 32, textAlign: "center", fontSize: 16, fontFamily: "Inter_700Bold" },
});

function ExerciseCard({
  entry,
  index,
  onUpdate,
  onRemove,
}: {
  entry: ExerciseEntry;
  index: number;
  onUpdate: (id: string, field: keyof ExerciseEntry, value: string | number) => void;
  onRemove: (id: string) => void;
}) {
  const colors = useColors();
  const nameRef = useRef<TextInput>(null);

  return (
    <View style={[cardStyles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={cardStyles.header}>
        <View style={[cardStyles.num, { backgroundColor: colors.secondary }]}>
          <Text style={[cardStyles.numText, { color: colors.mutedForeground }]}>{index + 1}</Text>
        </View>
        <TextInput
          ref={nameRef}
          style={[cardStyles.nameInput, { color: colors.foreground, borderBottomColor: colors.border }]}
          placeholder="Exercise name"
          placeholderTextColor={colors.mutedForeground}
          value={entry.name}
          onChangeText={(v) => onUpdate(entry.id, "name", v)}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={() => onRemove(entry.id)}>
          <Ionicons name="trash-outline" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <View style={cardStyles.fields}>
        <View style={cardStyles.field}>
          <Text style={[cardStyles.fieldLabel, { color: colors.mutedForeground }]}>SETS</Text>
          <Stepper
            value={entry.sets}
            min={1}
            step={1}
            onChange={(v) => onUpdate(entry.id, "sets", v)}
          />
        </View>
        <View style={cardStyles.field}>
          <Text style={[cardStyles.fieldLabel, { color: colors.mutedForeground }]}>REPS</Text>
          <Stepper
            value={entry.reps}
            min={1}
            step={1}
            onChange={(v) => onUpdate(entry.id, "reps", v)}
          />
        </View>
        <View style={cardStyles.field}>
          <Text style={[cardStyles.fieldLabel, { color: colors.mutedForeground }]}>WEIGHT</Text>
          <Stepper
            value={entry.weight}
            min={0}
            step={2.5}
            onChange={(v) => onUpdate(entry.id, "weight", v)}
          />
        </View>
      </View>

      <View style={cardStyles.restRow}>
        <Text style={[cardStyles.fieldLabel, { color: colors.mutedForeground }]}>REST</Text>
        <View style={cardStyles.restChips}>
          {[30, 45, 60, 90, 120].map((sec) => (
            <TouchableOpacity
              key={sec}
              onPress={() => onUpdate(entry.id, "restSeconds", sec)}
              style={[
                cardStyles.restChip,
                {
                  backgroundColor:
                    entry.restSeconds === sec ? colors.primary : colors.secondary,
                },
              ]}
            >
              <Text
                style={[
                  cardStyles.restChipText,
                  {
                    color:
                      entry.restSeconds === sec
                        ? colors.primaryForeground
                        : colors.mutedForeground,
                  },
                ]}
              >
                {sec}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: { borderRadius: 16, padding: 14, borderWidth: 1, gap: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  num: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  numText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  nameInput: { flex: 1, fontSize: 16, fontFamily: "Inter_600SemiBold", paddingBottom: 4, borderBottomWidth: 1 },
  fields: { flexDirection: "row", justifyContent: "space-between" },
  field: { alignItems: "center", gap: 6 },
  fieldLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  restRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  restChips: { flexDirection: "row", gap: 6, flex: 1 },
  restChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  restChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});

export default function CreateWorkoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addCustomWorkout, customCategories, addCategory, setWorkoutSchedule } = useWorkout();

  const [workoutName, setWorkoutName] = useState("");
  const [category, setCategory] = useState(PRESET_CATEGORIES[0]);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [scheduledDays, setScheduledDays] = useState<number[]>([]);
  const [isAddingFocus, setIsAddingFocus] = useState(false);
  const [newFocusText, setNewFocusText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const newFocusRef = useRef<TextInput>(null);

  const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

  const toggleDay = (day: number) => {
    Haptics.selectionAsync();
    setScheduledDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const allCategories = [...PRESET_CATEGORIES, ...customCategories];

  const handleAddFocus = () => {
    const trimmed = newFocusText.trim();
    if (trimmed && !allCategories.includes(trimmed)) {
      addCategory(trimmed);
      setCategory(trimmed);
    } else if (trimmed && allCategories.includes(trimmed)) {
      setCategory(trimmed);
    }
    setNewFocusText("");
    setIsAddingFocus(false);
    Keyboard.dismiss();
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const addExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExercises((prev) => [
      ...prev,
      { id: generateId(), name: "", sets: 3, reps: 10, weight: 0, restSeconds: 60 },
    ]);
  };

  const updateExercise = (id: string, field: keyof ExerciseEntry, value: string | number) => {
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSave = async () => {
    setErrorMsg("");
    if (!workoutName.trim()) {
      setErrorMsg("Give your workout a name before saving.");
      return;
    }
    if (exercises.length === 0) {
      setErrorMsg("Add at least one exercise before saving.");
      return;
    }
    const unnamed = exercises.find((e) => !e.name.trim());
    if (unnamed) {
      setErrorMsg("All exercises need a name.");
      return;
    }

    const estimatedMinutes = Math.max(
      10,
      Math.round(
        exercises.reduce(
          (sum, e) => sum + e.sets * (45 + e.restSeconds),
          0
        ) / 60
      )
    );

    const workoutExercises: WorkoutExercise[] = exercises.map((e) => ({
      exerciseId: `custom-${generateId()}`,
      targetSets: e.sets,
      targetReps: e.reps,
      defaultWeight: e.weight,
      restSeconds: e.restSeconds,
      customName: e.name.trim(),
      customMuscleGroup: category,
    }));

    const workout: Workout = {
      id: generateId(),
      name: workoutName.trim(),
      description: `Custom ${category.toLowerCase()} workout.`,
      category,
      exercises: workoutExercises,
      estimatedMinutes,
      isCustom: true,
    };

    addCustomWorkout(workout);
    if (scheduledDays.length > 0) {
      setWorkoutSchedule(workout.id, scheduledDays);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navBar, { paddingTop: topPadding + 8 }]}>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: colors.secondary }]}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>New Workout</Text>
        <TouchableOpacity
          style={[
            styles.saveBtn,
            {
              backgroundColor: workoutName.trim() && exercises.length > 0
                ? colors.primary
                : colors.secondary,
            },
          ]}
          onPress={handleSave}
        >
          <Text
            style={[
              styles.saveBtnText,
              {
                color: workoutName.trim() && exercises.length > 0
                  ? colors.primaryForeground
                  : colors.mutedForeground,
              },
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      {errorMsg ? (
        <View style={[styles.errorBanner, { backgroundColor: colors.destructive + "22", borderColor: colors.destructive + "55" }]}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.destructive }]}>{errorMsg}</Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPadding + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.nameCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.nameInput, { color: colors.foreground }]}
            placeholder="Workout name"
            placeholderTextColor={colors.mutedForeground}
            value={workoutName}
            onChangeText={(v) => { setWorkoutName(v); if (errorMsg) setErrorMsg(""); }}
            returnKeyType="done"
            autoFocus
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>FOCUS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {allCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.catChip,
                  {
                    backgroundColor:
                      category === cat ? colors.primary : colors.secondary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.catChipText,
                    {
                      color:
                        category === cat
                          ? colors.primaryForeground
                          : colors.mutedForeground,
                    },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}

            {isAddingFocus ? (
              <View style={[styles.catChip, styles.focusInputChip, { backgroundColor: colors.secondary, borderColor: colors.primary, borderWidth: 1 }]}>
                <TextInput
                  ref={newFocusRef}
                  value={newFocusText}
                  onChangeText={setNewFocusText}
                  placeholder="Focus name…"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.focusInput, { color: colors.foreground }]}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleAddFocus}
                  onBlur={() => {
                    if (!newFocusText.trim()) {
                      setIsAddingFocus(false);
                    }
                  }}
                  maxLength={24}
                />
                <TouchableOpacity onPress={handleAddFocus} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setIsAddingFocus(true);
                  setTimeout(() => newFocusRef.current?.focus(), 50);
                }}
                style={[styles.catChip, { backgroundColor: colors.secondary }]}
              >
                <Ionicons name="add" size={16} color={colors.mutedForeground} />
                <Text style={[styles.catChipText, { color: colors.mutedForeground, marginLeft: 3 }]}>
                  New
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SCHEDULE</Text>
          <View style={[styles.scheduleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.dayRow}>
              {DAY_LABELS.map((label, idx) => {
                const active = scheduledDays.includes(idx);
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
                    <Text style={[styles.dayLabel, { color: active ? "#fff" : colors.mutedForeground }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.scheduleMuted, { color: colors.mutedForeground }]}>
              {scheduledDays.length === 0
                ? "Optional — tap days to schedule this workout"
                : `Scheduled ${scheduledDays.length} day${scheduledDays.length > 1 ? "s" : ""} per week`}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            EXERCISES ({exercises.length})
          </Text>
          <View style={styles.exerciseList}>
            {exercises.map((entry, idx) => (
              <ExerciseCard
                key={entry.id}
                entry={entry}
                index={idx}
                onUpdate={updateExercise}
                onRemove={removeExercise}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            onPress={addExercise}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.addBtnText, { color: colors.primary }]}>Add Exercise</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 24 },
  nameCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
  },
  nameInput: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    paddingVertical: 12,
  },
  section: { gap: 10 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
  },
  categoryRow: { gap: 8, flexDirection: "row" },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  catChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  focusInputChip: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 120,
  },
  focusInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    paddingVertical: 0,
    marginRight: 6,
  },
  exerciseList: { gap: 12 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  scheduleCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
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
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
});

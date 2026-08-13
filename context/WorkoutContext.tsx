import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Exercise {
  id: string;
  name: string;
  category: "chest" | "back" | "legs" | "shoulders" | "arms" | "core";
  muscleGroup: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  defaultWeight: number;
  restSeconds: number;
  customName?: string;
  customMuscleGroup?: string;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  category: string;
  exercises: WorkoutExercise[];
  estimatedMinutes: number;
  isCustom: boolean;
  notes?: string;
}

export interface SetLog {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

export interface Session {
  id: string;
  workoutId: string;
  workoutName: string;
  date: string;
  durationSeconds: number;
  exerciseLogs: ExerciseLog[];
  totalVolume: number;
  totalSets: number;
  notes?: string;
}

export interface Settings {
  weightUnit: "kg" | "lbs";
}

export const EXERCISES: Exercise[] = [
  { id: "bench-press", name: "Bench Press", category: "chest", muscleGroup: "Chest" },
  { id: "incline-db-press", name: "Incline DB Press", category: "chest", muscleGroup: "Upper Chest" },
  { id: "cable-fly", name: "Cable Fly", category: "chest", muscleGroup: "Chest" },
  { id: "dips", name: "Dips", category: "chest", muscleGroup: "Chest & Triceps" },
  { id: "push-ups", name: "Push-ups", category: "chest", muscleGroup: "Chest" },
  { id: "pull-ups", name: "Pull-ups", category: "back", muscleGroup: "Back & Biceps" },
  { id: "bent-over-row", name: "Bent-over Row", category: "back", muscleGroup: "Mid Back" },
  { id: "lat-pulldown", name: "Lat Pulldown", category: "back", muscleGroup: "Lats" },
  { id: "seated-cable-row", name: "Seated Cable Row", category: "back", muscleGroup: "Mid Back" },
  { id: "face-pull", name: "Face Pull", category: "back", muscleGroup: "Rear Delts" },
  { id: "barbell-squat", name: "Barbell Squat", category: "legs", muscleGroup: "Quads & Glutes" },
  { id: "leg-press", name: "Leg Press", category: "legs", muscleGroup: "Quads" },
  { id: "romanian-deadlift", name: "Romanian Deadlift", category: "legs", muscleGroup: "Hamstrings" },
  { id: "leg-curl", name: "Leg Curl", category: "legs", muscleGroup: "Hamstrings" },
  { id: "leg-extension", name: "Leg Extension", category: "legs", muscleGroup: "Quads" },
  { id: "calf-raise", name: "Calf Raise", category: "legs", muscleGroup: "Calves" },
  { id: "overhead-press", name: "Overhead Press", category: "shoulders", muscleGroup: "Shoulders" },
  { id: "lateral-raise", name: "Lateral Raise", category: "shoulders", muscleGroup: "Side Delts" },
  { id: "front-raise", name: "Front Raise", category: "shoulders", muscleGroup: "Front Delts" },
  { id: "barbell-curl", name: "Barbell Curl", category: "arms", muscleGroup: "Biceps" },
  { id: "hammer-curl", name: "Hammer Curl", category: "arms", muscleGroup: "Biceps" },
  { id: "tricep-pushdown", name: "Tricep Pushdown", category: "arms", muscleGroup: "Triceps" },
  { id: "skull-crusher", name: "Skull Crusher", category: "arms", muscleGroup: "Triceps" },
  { id: "crunches", name: "Crunches", category: "core", muscleGroup: "Abs" },
  { id: "russian-twist", name: "Russian Twist", category: "core", muscleGroup: "Obliques" },
  { id: "leg-raise", name: "Leg Raise", category: "core", muscleGroup: "Lower Abs" },
  { id: "bicycle-crunch", name: "Bicycle Crunch", category: "core", muscleGroup: "Abs & Obliques" },
  { id: "mountain-climbers", name: "Mountain Climbers", category: "core", muscleGroup: "Core" },
];

export const PRESET_WORKOUTS: Workout[] = [
  {
    id: "push-day",
    name: "Push Day",
    description: "Chest, shoulders and triceps compound and isolation work.",
    category: "Chest & Shoulders",
    estimatedMinutes: 55,
    isCustom: false,
    exercises: [
      { exerciseId: "bench-press", targetSets: 4, targetReps: 8, defaultWeight: 60, restSeconds: 90 },
      { exerciseId: "incline-db-press", targetSets: 3, targetReps: 10, defaultWeight: 25, restSeconds: 90 },
      { exerciseId: "overhead-press", targetSets: 3, targetReps: 10, defaultWeight: 40, restSeconds: 90 },
      { exerciseId: "lateral-raise", targetSets: 3, targetReps: 15, defaultWeight: 10, restSeconds: 60 },
      { exerciseId: "tricep-pushdown", targetSets: 4, targetReps: 12, defaultWeight: 25, restSeconds: 60 },
    ],
  },
  {
    id: "pull-day",
    name: "Pull Day",
    description: "Back and biceps focused pulling movements.",
    category: "Back & Biceps",
    estimatedMinutes: 50,
    isCustom: false,
    exercises: [
      { exerciseId: "pull-ups", targetSets: 4, targetReps: 6, defaultWeight: 0, restSeconds: 90 },
      { exerciseId: "bent-over-row", targetSets: 4, targetReps: 8, defaultWeight: 60, restSeconds: 90 },
      { exerciseId: "lat-pulldown", targetSets: 3, targetReps: 10, defaultWeight: 55, restSeconds: 75 },
      { exerciseId: "barbell-curl", targetSets: 3, targetReps: 12, defaultWeight: 30, restSeconds: 60 },
      { exerciseId: "hammer-curl", targetSets: 3, targetReps: 12, defaultWeight: 15, restSeconds: 60 },
    ],
  },
  {
    id: "leg-day",
    name: "Leg Day",
    description: "Full lower body strength and hypertrophy.",
    category: "Legs",
    estimatedMinutes: 60,
    isCustom: false,
    exercises: [
      { exerciseId: "barbell-squat", targetSets: 4, targetReps: 8, defaultWeight: 80, restSeconds: 120 },
      { exerciseId: "leg-press", targetSets: 3, targetReps: 10, defaultWeight: 120, restSeconds: 90 },
      { exerciseId: "romanian-deadlift", targetSets: 3, targetReps: 10, defaultWeight: 70, restSeconds: 90 },
      { exerciseId: "leg-curl", targetSets: 3, targetReps: 12, defaultWeight: 40, restSeconds: 60 },
      { exerciseId: "calf-raise", targetSets: 4, targetReps: 15, defaultWeight: 80, restSeconds: 60 },
    ],
  },
  {
    id: "upper-body",
    name: "Upper Body",
    description: "Balanced upper body strength — push and pull in one session.",
    category: "Full Upper",
    estimatedMinutes: 50,
    isCustom: false,
    exercises: [
      { exerciseId: "bench-press", targetSets: 3, targetReps: 8, defaultWeight: 60, restSeconds: 90 },
      { exerciseId: "overhead-press", targetSets: 3, targetReps: 8, defaultWeight: 40, restSeconds: 90 },
      { exerciseId: "pull-ups", targetSets: 3, targetReps: 6, defaultWeight: 0, restSeconds: 90 },
      { exerciseId: "bent-over-row", targetSets: 3, targetReps: 10, defaultWeight: 55, restSeconds: 75 },
      { exerciseId: "dips", targetSets: 3, targetReps: 10, defaultWeight: 0, restSeconds: 75 },
    ],
  },
  {
    id: "core-blast",
    name: "Core Blast",
    description: "High-intensity core work targeting abs, obliques and stability.",
    category: "Core",
    estimatedMinutes: 30,
    isCustom: false,
    exercises: [
      { exerciseId: "crunches", targetSets: 3, targetReps: 25, defaultWeight: 0, restSeconds: 45 },
      { exerciseId: "russian-twist", targetSets: 3, targetReps: 20, defaultWeight: 5, restSeconds: 45 },
      { exerciseId: "leg-raise", targetSets: 3, targetReps: 15, defaultWeight: 0, restSeconds: 45 },
      { exerciseId: "bicycle-crunch", targetSets: 3, targetReps: 20, defaultWeight: 0, restSeconds: 45 },
      { exerciseId: "mountain-climbers", targetSets: 3, targetReps: 30, defaultWeight: 0, restSeconds: 30 },
    ],
  },
  {
    id: "full-body-power",
    name: "Full Body Power",
    description: "Compound movements hitting every major muscle group.",
    category: "Full Body",
    estimatedMinutes: 65,
    isCustom: false,
    exercises: [
      { exerciseId: "barbell-squat", targetSets: 3, targetReps: 8, defaultWeight: 70, restSeconds: 120 },
      { exerciseId: "bench-press", targetSets: 3, targetReps: 8, defaultWeight: 60, restSeconds: 90 },
      { exerciseId: "bent-over-row", targetSets: 3, targetReps: 8, defaultWeight: 60, restSeconds: 90 },
      { exerciseId: "overhead-press", targetSets: 3, targetReps: 10, defaultWeight: 35, restSeconds: 90 },
      { exerciseId: "romanian-deadlift", targetSets: 3, targetReps: 10, defaultWeight: 60, restSeconds: 90 },
    ],
  },
];

const STORAGE_KEYS = {
  sessions: "@fittrack:sessions",
  customWorkouts: "@fittrack:custom-workouts",
  settings: "@fittrack:settings",
  categories: "@fittrack:categories",
  schedule: "@fittrack:schedule",
};

interface WorkoutContextType {
  exercises: Exercise[];
  workouts: Workout[];
  sessions: Session[];
  settings: Settings;
  isLoading: boolean;
  customCategories: string[];
  schedule: Record<string, number[]>;
  addSession: (session: Session) => Promise<void>;
  addCustomWorkout: (workout: Workout) => Promise<void>;
  updateWorkout: (workout: Workout) => Promise<void>;
  updateSessionNotes: (sessionId: string, notes: string) => Promise<void>;
  deleteCustomWorkout: (id: string) => Promise<void>;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;
  setWorkoutSchedule: (workoutId: string, days: number[]) => Promise<void>;
  getWorkoutById: (id: string) => Workout | undefined;
  getExerciseById: (id: string) => Exercise | undefined;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [customWorkouts, setCustomWorkouts] = useState<Workout[]>([]);
  const [settings, setSettings] = useState<Settings>({ weightUnit: "kg" });
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<Record<string, number[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sessionsRaw, customRaw, settingsRaw, categoriesRaw, scheduleRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.sessions),
          AsyncStorage.getItem(STORAGE_KEYS.customWorkouts),
          AsyncStorage.getItem(STORAGE_KEYS.settings),
          AsyncStorage.getItem(STORAGE_KEYS.categories),
          AsyncStorage.getItem(STORAGE_KEYS.schedule),
        ]);
        if (sessionsRaw) setSessions(JSON.parse(sessionsRaw));
        if (customRaw) setCustomWorkouts(JSON.parse(customRaw));
        if (settingsRaw) setSettings(JSON.parse(settingsRaw));
        if (categoriesRaw) setCustomCategories(JSON.parse(categoriesRaw));
        if (scheduleRaw) setSchedule(JSON.parse(scheduleRaw));
      } catch {
        // ignore parse errors
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const addSession = useCallback(async (session: Session) => {
    setSessions((prev) => {
      const updated = [session, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateSessionNotes = useCallback(async (sessionId: string, notes: string) => {
    setSessions((prev) => {
      const updated = prev.map((s) => (s.id === sessionId ? { ...s, notes } : s));
      AsyncStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addCustomWorkout = useCallback(async (workout: Workout) => {
    setCustomWorkouts((prev) => {
      const updated = [...prev, workout];
      AsyncStorage.setItem(STORAGE_KEYS.customWorkouts, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateWorkout = useCallback(async (workout: Workout) => {
    setCustomWorkouts((prev) => {
      const updated = prev.map((w) => (w.id === workout.id ? workout : w));
      AsyncStorage.setItem(STORAGE_KEYS.customWorkouts, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteCustomWorkout = useCallback(async (id: string) => {
    setCustomWorkouts((prev) => {
      const updated = prev.filter((w) => w.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.customWorkouts, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateSettings = useCallback(async (partial: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addCategory = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCustomCategories((prev) => {
      if (prev.includes(trimmed)) return prev;
      const updated = [...prev, trimmed];
      AsyncStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteCategory = useCallback(async (name: string) => {
    setCustomCategories((prev) => {
      const updated = prev.filter((c) => c !== name);
      AsyncStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setWorkoutSchedule = useCallback(async (workoutId: string, days: number[]) => {
    setSchedule((prev) => {
      const updated = { ...prev, [workoutId]: days };
      AsyncStorage.setItem(STORAGE_KEYS.schedule, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const workouts = [...PRESET_WORKOUTS, ...customWorkouts];

  const getWorkoutById = useCallback(
    (id: string) => workouts.find((w) => w.id === id),
    [workouts]
  );

  const getExerciseById = useCallback(
    (id: string) => EXERCISES.find((e) => e.id === id),
    []
  );

  return (
    <WorkoutContext.Provider
      value={{
        exercises: EXERCISES,
        workouts,
        sessions,
        settings,
        isLoading,
        customCategories,
        schedule,
        addSession,
        updateSessionNotes,
        addCustomWorkout,
        updateWorkout,
        deleteCustomWorkout,
        updateSettings,
        addCategory,
        deleteCategory,
        setWorkoutSchedule,
        getWorkoutById,
        getExerciseById,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout must be used within WorkoutProvider");
  return ctx;
}

import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Body from "react-native-body-highlighter";

import { useColors } from "@/hooks/useColors";

type Level = "primary" | "secondary";
type MuscleMap = Partial<Record<string, Level>>;

const EXERCISE_MUSCLES: Record<string, { primary: string[]; secondary: string[] }> = {
  "bench-press":       { primary: ["chest", "ant-delt"],             secondary: ["triceps"] },
  "incline-db-press":  { primary: ["chest", "ant-delt"],             secondary: ["triceps"] },
  "cable-fly":         { primary: ["chest"],                         secondary: ["ant-delt"] },
  "dips":              { primary: ["chest", "triceps"],              secondary: ["ant-delt"] },
  "push-ups":          { primary: ["chest"],                         secondary: ["triceps", "ant-delt"] },
  "pull-ups":          { primary: ["lats", "biceps"],                secondary: ["rhomboids", "rear-delt"] },
  "bent-over-row":     { primary: ["lats", "rhomboids"],             secondary: ["biceps", "lower-back"] },
  "lat-pulldown":      { primary: ["lats"],                          secondary: ["biceps", "rhomboids"] },
  "seated-cable-row":  { primary: ["rhomboids", "lats"],             secondary: ["biceps"] },
  "face-pull":         { primary: ["rear-delt", "traps"],            secondary: ["rhomboids"] },
  "barbell-squat":     { primary: ["quads", "glutes"],               secondary: ["hamstrings", "lower-back", "calves"] },
  "leg-press":         { primary: ["quads", "glutes"],               secondary: ["hamstrings"] },
  "romanian-deadlift": { primary: ["hamstrings", "glutes"],          secondary: ["lower-back", "calves"] },
  "leg-curl":          { primary: ["hamstrings"],                    secondary: ["calves"] },
  "leg-extension":     { primary: ["quads"],                         secondary: [] },
  "calf-raise":        { primary: ["calves"],                        secondary: [] },
  "overhead-press":    { primary: ["ant-delt", "med-delt"],          secondary: ["triceps", "traps"] },
  "lateral-raise":     { primary: ["med-delt"],                      secondary: ["traps"] },
  "front-raise":       { primary: ["ant-delt"],                      secondary: ["med-delt"] },
  "barbell-curl":      { primary: ["biceps"],                        secondary: ["forearms"] },
  "hammer-curl":       { primary: ["biceps", "forearms"],            secondary: [] },
  "tricep-pushdown":   { primary: ["triceps"],                       secondary: ["forearms"] },
  "skull-crusher":     { primary: ["triceps"],                       secondary: [] },
  "crunches":          { primary: ["abs"],                           secondary: [] },
  "russian-twist":     { primary: ["obliques"],                      secondary: ["abs"] },
  "leg-raise":         { primary: ["abs"],                           secondary: ["obliques"] },
  "bicycle-crunch":    { primary: ["abs", "obliques"],               secondary: [] },
  "mountain-climbers": { primary: ["abs"],                           secondary: ["obliques", "quads"] },
};

function buildMap(exerciseIds: string[]): MuscleMap {
  const map: MuscleMap = {};
  for (const id of exerciseIds) {
    const def = EXERCISE_MUSCLES[id];
    if (!def) continue;
    for (const m of def.primary)   map[m] = "primary";
    for (const m of def.secondary) if (!map[m]) map[m] = "secondary";
  }
  return map;
}

const MUSCLE_TO_SLUG: Record<string, string> = {
  chest: "chest",
  "ant-delt": "front-deltoids",
  "med-delt": "front-deltoids",
  "rear-delt": "back-deltoids",
  traps: "trapezius",
  lats: "upper-back",
  rhomboids: "upper-back",
  "lower-back": "lower-back",
  triceps: "triceps",
  biceps: "biceps",
  forearms: "forearm",
  abs: "abs",
  obliques: "obliques",
  quads: "quadriceps",
  hamstrings: "hamstring",
  glutes: "gluteal",
  calves: "calves",
};

function buildSlugData(map: MuscleMap): { slug: string; intensity: number }[] {
  const slugLevel: Record<string, Level> = {};
  for (const [muscleId, level] of Object.entries(map)) {
    const slug = MUSCLE_TO_SLUG[muscleId];
    if (!slug || !level) continue;
    if (level === "primary") {
      slugLevel[slug] = "primary";
    } else if (!slugLevel[slug]) {
      slugLevel[slug] = "secondary";
    }
  }
  return Object.entries(slugLevel).map(([slug, level]) => ({
    slug,
    intensity: level === "primary" ? 1 : 2,
  }));
}

const MUSCLE_LABELS: Record<string, string> = {
  chest: "Chest", "ant-delt": "Front Delts", "med-delt": "Side Delts",
  "rear-delt": "Rear Delts", traps: "Traps", lats: "Lats",
  rhomboids: "Rhomboids", triceps: "Triceps", biceps: "Biceps",
  forearms: "Forearms", abs: "Abs", obliques: "Obliques",
  "lower-back": "Lower Back", quads: "Quads", hamstrings: "Hamstrings",
  glutes: "Glutes", calves: "Calves",
};

interface Props { exerciseIds: string[] }

export function MuscleDiagram({ exerciseIds }: Props) {
  const colors = useColors();
  const map = useMemo(() => buildMap(exerciseIds), [exerciseIds]);
  const slugData = useMemo(() => buildSlugData(map), [map]);

  const primaryMuscles   = Object.entries(map).filter(([, v]) => v === "primary").map(([k]) => k);
  const secondaryMuscles = Object.entries(map).filter(([, v]) => v === "secondary").map(([k]) => k);

  if (!primaryMuscles.length && !secondaryMuscles.length) return null;

  const PRIMARY   = colors.primary;
  const SECONDARY = "#8B5A3C";
  const REST_FILL = "#3a3a3d";

  return (
    <View style={styles.container}>
      <View style={styles.views}>
        <View style={styles.viewCol}>
          <Body
            data={slugData as any}
            colors={[PRIMARY, SECONDARY]}
            defaultFill={REST_FILL}
            border="#0a0a0a"
            scale={1.05}
            side="front"
            gender="male"
          />
          <Text style={[styles.label, { color: colors.mutedForeground }]}>FRONT</Text>
        </View>
        <View style={styles.viewCol}>
          <Body
            data={slugData as any}
            colors={[PRIMARY, SECONDARY]}
            defaultFill={REST_FILL}
            border="#0a0a0a"
            scale={1.05}
            side="back"
            gender="male"
          />
          <Text style={[styles.label, { color: colors.mutedForeground }]}>BACK</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {primaryMuscles.length > 0 && (
          <View style={styles.legendGroup}>
            <Text style={[styles.legendTitle, { color: colors.mutedForeground }]}>PRIMARY</Text>
            <View style={styles.pills}>
              {primaryMuscles.map((m) => (
                <View key={m} style={[styles.pill, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "55" }]}>
                  <Text style={[styles.pillText, { color: colors.primary }]}>{MUSCLE_LABELS[m] ?? m}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        {secondaryMuscles.length > 0 && (
          <View style={styles.legendGroup}>
            <Text style={[styles.legendTitle, { color: colors.mutedForeground }]}>SECONDARY</Text>
            <View style={styles.pills}>
              {secondaryMuscles.map((m) => (
                <View key={m} style={[styles.pill, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Text style={[styles.pillText, { color: colors.mutedForeground }]}>{MUSCLE_LABELS[m] ?? m}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  views:     { flexDirection: "row", justifyContent: "center", gap: 24 },
  viewCol:   { alignItems: "center", gap: 8 },
  label:     { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2 },
  legend:    { gap: 12 },
  legendGroup: { gap: 6 },
  legendTitle: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1.1 },
  pills:     { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pill:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  pillText:  { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});

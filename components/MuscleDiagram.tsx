import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, ClipPath, Defs, G, Path } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

// ─── Muscle activation map ────────────────────────────────────────────────────
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

// ─── Athletic body silhouette paths (100 × 234 viewBox) ─────────────────────
//
// Design intent: classic gym-poster figure
//   • Broad shoulders (x 18–82), very narrow waist (x 36–64), hip flare (x 30–70)
//   • Lean arms, tapered legs, small head
//   • All muscle zones are clipped to the body so minor overflows are harmless

// HEAD – kept small relative to wide shoulders (athletic proportion)
const HEAD_CX = 50;
const HEAD_CY = 9;
const HEAD_R  = 7.5;

const NECK = `M44,15 C44,18 44,21 45,24 L55,24 C56,21 56,18 56,15 C56,13 44,13 44,15 Z`;

// LEFT ARM  (outer ≈ x3–5, inner ≈ x20)
const LEFT_ARM = `
  M20,26
  C14,22 6,25 3,33
  C1,41 1,54 2,66
  C2,74 4,80 6,84
  C7,87 8,90 7,94
  C5,102 4,112 4,122
  C4,128 6,133 10,135
  C14,137 18,135 19,130
  C20,124 20,116 19,108
  C19,98 18,88 18,80
  C18,68 18,54 19,42
  C19,34 20,29 20,26
  Z
`;

// RIGHT ARM (mirror of left)
const RIGHT_ARM = `
  M80,26
  C86,22 94,25 97,33
  C99,41 99,54 98,66
  C98,74 96,80 94,84
  C93,87 92,90 93,94
  C95,102 96,112 96,122
  C96,128 94,133 90,135
  C86,137 82,135 81,130
  C80,124 80,116 81,108
  C81,98 82,88 82,80
  C82,68 82,54 81,42
  C81,34 80,29 80,26
  Z
`;

// TORSO  – strong V-taper: shoulders 60 wide → waist 28 wide → hips 40 wide
const TORSO = `
  M20,26
  C20,20 28,15 36,14
  C40,13 45,13 50,13
  C55,13 60,13 64,14
  C72,15 80,20 80,26
  C80,38 79,52 76,64
  C74,76 70,86 65,96
  C67,104 67,112 65,118
  C60,121 55,122 50,122
  C45,122 40,121 35,118
  C33,112 33,104 35,96
  C30,86 26,76 24,64
  C21,52 20,38 20,26
  Z
`;

// LEFT LEG  (outer ≈ x30, inner ≈ x46)
const LEFT_LEG = `
  M35,118
  C32,128 29,142 28,156
  C27,168 27,180 28,190
  C28,198 27,206 26,212
  C25,218 25,224 27,229
  C29,233 34,235 39,234
  C43,233 45,230 45,225
  C46,219 45,212 45,205
  C45,196 45,186 45,176
  C46,160 47,142 46,126
  C46,120 45,117 42,116
  C40,115 37,116 35,118
  Z
`;

// RIGHT LEG  (inner ≈ x54, outer ≈ x70)
const RIGHT_LEG = `
  M65,118
  C68,128 71,142 72,156
  C73,168 73,180 72,190
  C72,198 73,206 74,212
  C75,218 75,224 73,229
  C71,233 66,235 61,234
  C57,233 55,230 55,225
  C54,219 55,212 55,205
  C55,196 55,186 55,176
  C54,160 53,142 54,126
  C54,120 55,117 58,116
  C60,115 63,116 65,118
  Z
`;

// ─── Front muscle paths ───────────────────────────────────────────────────────
const F: Record<string, string> = {

  // Anterior / medial deltoid – rounded shoulder cap
  "ant-delt-L": `M20,24 C14,21 6,26 3,36 C1,46 3,58 10,62 C16,64 21,60 21,52 C22,44 22,34 20,24 Z`,
  "ant-delt-R": `M80,24 C86,21 94,26 97,36 C99,46 97,58 90,62 C84,64 79,60 79,52 C78,44 78,34 80,24 Z`,

  // Pectoralis major – large fan filling the chest
  "chest-L": `M48,20 C40,22 30,32 24,46 C20,58 24,70 32,76 C38,80 46,78 50,70 C52,60 52,44 48,20 Z`,
  "chest-R": `M52,20 C60,22 70,32 76,46 C80,58 76,70 68,76 C62,80 54,78 50,70 C48,60 48,44 52,20 Z`,

  // Biceps brachii – front of upper arm
  "biceps-L": `M4,62 C1,72 1,86 3,96 C6,102 12,104 18,102 C20,96 20,84 19,72 C18,62 12,60 4,62 Z`,
  "biceps-R": `M96,62 C99,72 99,86 97,96 C94,102 88,104 82,102 C80,96 80,84 81,72 C82,62 88,60 96,62 Z`,

  // Forearms – lower arm
  "forearms-L": `M3,100 C1,110 1,122 2,128 C4,132 9,134 16,132 C19,128 20,118 20,108 C19,100 14,98 3,100 Z`,
  "forearms-R": `M97,100 C99,110 99,122 98,128 C96,132 91,134 84,132 C81,128 80,118 80,108 C81,100 86,98 97,100 Z`,

  // Rectus abdominis – 6-pack (within narrow waist x 36–64)
  "abs-L1": `M37,58 C35,61 35,67 37,71 C39,73 45,73 47,71 C49,67 49,61 47,58 C45,56 39,56 37,58 Z`,
  "abs-R1": `M63,58 C65,61 65,67 63,71 C61,73 55,73 53,71 C51,67 51,61 53,58 C55,56 61,56 63,58 Z`,
  "abs-L2": `M37,73 C35,76 35,82 37,86 C39,88 45,88 47,86 C49,82 49,76 47,73 C45,71 39,71 37,73 Z`,
  "abs-R2": `M63,73 C65,76 65,82 63,86 C61,88 55,88 53,86 C51,82 51,76 53,73 C55,71 61,71 63,73 Z`,
  "abs-L3": `M37,88 C35,91 35,99 37,103 C39,107 45,107 47,103 C49,99 49,91 47,88 C45,86 39,86 37,88 Z`,
  "abs-R3": `M63,88 C65,91 65,99 63,103 C61,107 55,107 53,103 C51,99 51,91 53,88 C55,86 61,86 63,88 Z`,

  // External oblique – sides of torso
  "obliques-L": `M22,58 C20,70 20,82 22,94 C23,102 27,108 31,112 C33,108 33,96 32,84 C31,70 28,60 25,54 Z`,
  "obliques-R": `M78,58 C80,70 80,82 78,94 C77,102 73,108 69,112 C67,108 67,96 68,84 C69,70 72,60 75,54 Z`,

  // Quadriceps – large front thigh (outer x30, inner x46)
  "quads-L": `M30,118 C27,134 25,154 25,170 C25,178 27,184 31,186 C35,186 39,184 42,178 C45,168 46,152 46,136 C46,124 44,119 40,117 C37,116 33,116 30,118 Z`,
  "quads-R": `M70,118 C73,134 75,154 75,170 C75,178 73,184 69,186 C65,186 61,184 58,178 C55,168 54,152 54,136 C54,124 56,119 60,117 C63,116 67,116 70,118 Z`,

  // Tibialis anterior – front of shin
  "calves-L": `M25,182 C23,194 23,208 25,218 C27,223 31,225 35,224 C39,223 42,220 43,215 C44,207 44,197 44,188 C42,183 38,181 34,182 Z`,
  "calves-R": `M75,182 C77,194 77,208 75,218 C73,223 69,225 65,224 C61,223 58,220 57,215 C56,207 56,197 56,188 C58,183 62,181 66,182 Z`,
};

// ─── Back muscle paths ────────────────────────────────────────────────────────
const B: Record<string, string> = {

  // Trapezius – large upper-back diamond
  "traps": `M36,24 C28,30 22,40 20,50 C20,60 26,66 36,70 C42,72 50,72 58,70 C68,66 80,60 80,50 C78,40 72,30 64,24 C58,20 42,20 36,24 Z`,

  // Posterior deltoid – back of shoulder
  "rear-delt-L": `M20,24 C14,21 6,26 3,38 C1,50 5,62 12,64 C18,66 22,62 22,54 C22,44 22,34 20,24 Z`,
  "rear-delt-R": `M80,24 C86,21 94,26 97,38 C99,50 95,62 88,64 C82,66 78,62 78,54 C78,44 78,34 80,24 Z`,

  // Triceps – horseshoe on back of upper arm
  "triceps-L": `M4,62 C1,72 1,86 3,98 C6,104 12,106 18,104 C20,98 20,86 19,74 C18,64 12,60 4,62 Z`,
  "triceps-R": `M96,62 C99,72 99,86 97,98 C94,104 88,106 82,104 C80,98 80,86 81,74 C82,64 88,60 96,62 Z`,

  // Forearms
  "forearms-L": `M3,102 C1,112 1,124 2,130 C4,134 9,136 16,134 C19,130 20,120 20,110 C19,102 14,100 3,102 Z`,
  "forearms-R": `M97,102 C99,112 99,124 98,130 C96,134 91,136 84,134 C81,130 80,120 80,110 C81,102 86,100 97,102 Z`,

  // Latissimus dorsi – large wing/fan shapes
  "lats-L": `M20,58 C13,70 11,84 11,100 C11,114 14,122 19,128 C24,132 31,131 35,124 C30,112 27,98 27,82 C27,70 26,62 24,54 Z`,
  "lats-R": `M80,58 C87,70 89,84 89,100 C89,114 86,122 81,128 C76,132 69,131 65,124 C70,112 73,98 73,82 C73,70 74,62 76,54 Z`,

  // Rhomboids – between shoulder blades
  "rhomboids": `M33,52 C32,60 32,70 34,78 C38,82 50,84 62,82 C66,74 66,62 66,52 C62,48 50,46 38,48 Z`,

  // Erector spinae – two slim columns either side of spine
  "lower-back-L": `M40,80 C38,90 37,102 39,112 C41,118 46,120 49,118 C51,114 51,102 50,90 C49,80 47,76 43,76 Z`,
  "lower-back-R": `M60,80 C62,90 63,102 61,112 C59,118 54,120 51,118 C49,114 49,102 50,90 C51,80 53,76 57,76 Z`,

  // Gluteus maximus
  "glutes-L": `M30,118 C25,126 23,136 25,148 C27,158 33,162 40,160 C46,158 48,150 48,140 C47,130 44,122 40,118 C37,116 33,116 30,118 Z`,
  "glutes-R": `M70,118 C75,126 77,136 75,148 C73,158 67,162 60,160 C54,158 52,150 52,140 C53,130 56,122 60,118 C63,116 67,116 70,118 Z`,

  // Hamstrings – back of thigh
  "hamstrings-L": `M25,158 C23,172 23,186 24,198 C26,206 31,210 36,210 C41,210 45,206 46,196 C46,184 46,170 44,160 C40,154 30,154 25,158 Z`,
  "hamstrings-R": `M75,158 C77,172 77,186 76,198 C74,206 69,210 64,210 C59,210 55,206 54,196 C54,184 54,170 56,160 C60,154 70,154 75,158 Z`,

  // Gastrocnemius (calves) – back of lower leg
  "calves-L": `M24,202 C22,214 22,224 25,230 C27,233 32,233 37,232 C41,231 44,228 44,224 C44,214 44,206 44,204 C42,200 38,198 34,200 Z`,
  "calves-R": `M76,202 C78,214 78,224 75,230 C73,233 68,233 63,232 C59,231 56,228 56,224 C56,214 56,206 56,204 C58,200 62,198 66,200 Z`,
};

// ─── Muscle ID → zone keys ────────────────────────────────────────────────────
const FRONT_ZONES: Record<string, string[]> = {
  "chest":     ["chest-L",  "chest-R"],
  "ant-delt":  ["ant-delt-L","ant-delt-R"],
  "med-delt":  ["ant-delt-L","ant-delt-R"],
  "biceps":    ["biceps-L", "biceps-R"],
  "forearms":  ["forearms-L","forearms-R"],
  "abs":       ["abs-L1","abs-L2","abs-L3","abs-R1","abs-R2","abs-R3"],
  "obliques":  ["obliques-L","obliques-R"],
  "quads":     ["quads-L",  "quads-R"],
  "calves":    ["calves-L", "calves-R"],
};

const BACK_ZONES: Record<string, string[]> = {
  "traps":      ["traps"],
  "rear-delt":  ["rear-delt-L","rear-delt-R"],
  "med-delt":   ["rear-delt-L","rear-delt-R"],
  "lats":       ["lats-L",    "lats-R"],
  "rhomboids":  ["rhomboids"],
  "lower-back": ["lower-back-L","lower-back-R"],
  "triceps":    ["triceps-L", "triceps-R"],
  "forearms":   ["forearms-L","forearms-R"],
  "glutes":     ["glutes-L",  "glutes-R"],
  "hamstrings": ["hamstrings-L","hamstrings-R"],
  "calves":     ["calves-L",  "calves-R"],
};

// ─── Visual constants ─────────────────────────────────────────────────────────
const OUTLINE_COLOR = "#4ADE80";
const OUTLINE_WIDTH = 1.4;

// ─── BodyView ─────────────────────────────────────────────────────────────────
interface BodyProps {
  map: MuscleMap;
  primary: string;
  secondary: string;
  inactive: string;
  silhouette: string;
  view: "front" | "back";
  uid: string;
}

function BodyView({ map, primary, secondary, inactive, silhouette, view, uid }: BodyProps) {
  const zones       = view === "front" ? FRONT_ZONES : BACK_ZONES;
  const musclePaths = view === "front" ? F : B;

  // Build zone → colour
  const zoneColor: Record<string, string> = {};
  for (const [muscleId, level] of Object.entries(map)) {
    const keys = zones[muscleId] ?? [];
    for (const k of keys) {
      if (level === "primary")                    zoneColor[k] = primary;
      else if (level === "secondary" && !zoneColor[k]) zoneColor[k] = secondary;
    }
  }

  const allZoneKeys = Array.from(new Set(Object.values(zones).flat()));
  const clipId = `bclip-${view}-${uid}`;

  return (
    <Svg viewBox="0 0 100 234" width="100%" height="100%">
      <Defs>
        <ClipPath id={clipId}>
          <Circle cx={HEAD_CX} cy={HEAD_CY} r={HEAD_R} />
          <Path d={NECK} />
          <Path d={LEFT_ARM} />
          <Path d={RIGHT_ARM} />
          <Path d={TORSO} />
          <Path d={LEFT_LEG} />
          <Path d={RIGHT_LEG} />
        </ClipPath>
      </Defs>

      {/* Dark body fill */}
      <G>
        <Circle cx={HEAD_CX} cy={HEAD_CY} r={HEAD_R} fill={silhouette} />
        <Path d={NECK}      fill={silhouette} />
        <Path d={LEFT_ARM}  fill={silhouette} />
        <Path d={RIGHT_ARM} fill={silhouette} />
        <Path d={TORSO}     fill={silhouette} />
        <Path d={LEFT_LEG}  fill={silhouette} />
        <Path d={RIGHT_LEG} fill={silhouette} />
      </G>

      {/* Muscle overlays clipped to body */}
      <G clipPath={`url(#${clipId})`}>
        {allZoneKeys.map((key) => {
          const d = musclePaths[key];
          if (!d) return null;
          return <Path key={key} d={d} fill={zoneColor[key] ?? inactive} />;
        })}
      </G>

      {/* Green outline on top */}
      <G>
        <Circle cx={HEAD_CX} cy={HEAD_CY} r={HEAD_R} fill="none" stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
        <Path d={NECK}      fill="none" stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
        <Path d={LEFT_ARM}  fill="none" stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
        <Path d={RIGHT_ARM} fill="none" stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
        <Path d={TORSO}     fill="none" stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
        <Path d={LEFT_LEG}  fill="none" stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
        <Path d={RIGHT_LEG} fill="none" stroke={OUTLINE_COLOR} strokeWidth={OUTLINE_WIDTH} />
      </G>
    </Svg>
  );
}

// ─── Legend labels ────────────────────────────────────────────────────────────
const MUSCLE_LABELS: Record<string, string> = {
  chest: "Chest", "ant-delt": "Front Delts", "med-delt": "Side Delts",
  "rear-delt": "Rear Delts", traps: "Traps", lats: "Lats",
  rhomboids: "Rhomboids", triceps: "Triceps", biceps: "Biceps",
  forearms: "Forearms", abs: "Abs", obliques: "Obliques",
  "lower-back": "Lower Back", quads: "Quads", hamstrings: "Hamstrings",
  glutes: "Glutes", calves: "Calves",
};

// ─── Public component ─────────────────────────────────────────────────────────
interface Props { exerciseIds: string[] }

export function MuscleDiagram({ exerciseIds }: Props) {
  const colors = useColors();
  const map = useMemo(() => buildMap(exerciseIds), [exerciseIds]);

  const primaryMuscles   = Object.entries(map).filter(([, v]) => v === "primary").map(([k]) => k);
  const secondaryMuscles = Object.entries(map).filter(([, v]) => v === "secondary").map(([k]) => k);

  if (!primaryMuscles.length && !secondaryMuscles.length) return null;

  const PRIMARY    = colors.primary;
  const SECONDARY  = colors.primary + "77";
  const INACTIVE   = "#252528";
  const SILHOUETTE = "#1A1A1D";

  const uid = exerciseIds.join("").replace(/[^a-z0-9]/g, "").slice(0, 16);

  const bodyProps = { map, primary: PRIMARY, secondary: SECONDARY, inactive: INACTIVE, silhouette: SILHOUETTE };

  return (
    <View style={styles.container}>
      <View style={styles.views}>
        <View style={styles.viewCol}>
          <View style={styles.svgWrap}>
            <BodyView {...bodyProps} view="front" uid={uid + "f"} />
          </View>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>FRONT</Text>
        </View>
        <View style={styles.viewCol}>
          <View style={styles.svgWrap}>
            <BodyView {...bodyProps} view="back" uid={uid + "b"} />
          </View>
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
  svgWrap:   { width: 108, height: 253 },
  label:     { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2 },
  legend:    { gap: 12 },
  legendGroup: { gap: 6 },
  legendTitle: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1.1 },
  pills:     { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pill:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  pillText:  { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});

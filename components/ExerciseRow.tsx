import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface ExerciseRowProps {
  index: number;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weight?: number;
  restSeconds: number;
  weightUnit?: "kg" | "lbs";
}

export function ExerciseRow({
  index,
  name,
  muscleGroup,
  sets,
  reps,
  weight,
  restSeconds,
  weightUnit = "kg",
}: ExerciseRowProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={[styles.number, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.numberText, { color: colors.mutedForeground }]}>{index + 1}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]}>{name}</Text>
        <Text style={[styles.muscle, { color: colors.mutedForeground }]}>{muscleGroup}</Text>
      </View>
      <View style={styles.meta}>
        <Text style={[styles.setsReps, { color: colors.foreground }]}>
          {sets} × {reps}
          {weight != null && weight > 0 ? (
            <Text style={[styles.weight, { color: colors.mutedForeground }]}>
              {" "}
              {weight}
              {weightUnit}
            </Text>
          ) : null}
        </Text>
        <Text style={[styles.rest, { color: colors.mutedForeground }]}>
          {restSeconds}s rest
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  number: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  muscle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  meta: {
    alignItems: "flex-end",
    gap: 2,
  },
  setsReps: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  weight: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  rest: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});

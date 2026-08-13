import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Workout } from "@/context/WorkoutContext";
import { useColors } from "@/hooks/useColors";

interface WorkoutCardProps {
  workout: Workout;
  onPress: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

const CATEGORY_COLORS: Record<string, [string, string]> = {
  "Chest & Shoulders": ["#FF6B2B", "#FF8C00"],
  "Back & Biceps": ["#007AFF", "#0056CC"],
  Legs: ["#30D158", "#22A847"],
  "Full Upper": ["#BF5AF2", "#9B42D4"],
  Core: ["#FF9500", "#E8850A"],
  "Full Body": ["#FF3B30", "#CC2E25"],
};

export function WorkoutCard({ workout, onPress, onDelete, compact = false }: WorkoutCardProps) {
  const colors = useColors();
  const gradient = CATEGORY_COLORS[workout.category] ?? ["#FF6B2B", "#FF8C00"];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleDelete = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete?.();
  };

  const totalSets = workout.exercises.reduce((sum, e) => sum + e.targetSets, 0);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.75}
    >
      <LinearGradient
        colors={[gradient[0] + "22", gradient[0] + "05"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: gradient[0] + "22" }]}>
          <Text style={[styles.badgeText, { color: gradient[0] }]}>{workout.category}</Text>
        </View>
        <View style={styles.topRight}>
          <Text style={[styles.time, { color: colors.mutedForeground }]}>
            {workout.estimatedMinutes} min
          </Text>
          {onDelete && (
            <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="trash-outline" size={16} color={colors.destructive} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
        {workout.name}
      </Text>
      {!compact && (
        <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
          {workout.description}
        </Text>
      )}
      <View style={styles.stats}>
        <Text style={[styles.statText, { color: colors.mutedForeground }]}>
          {workout.exercises.length} exercises
        </Text>
        <View style={[styles.dot, { backgroundColor: colors.border }]} />
        <Text style={[styles.statText, { color: colors.mutedForeground }]}>
          {totalSets} sets
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    overflow: "hidden",
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  time: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  name: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  description: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
  },
});

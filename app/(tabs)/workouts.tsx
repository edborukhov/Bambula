import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WorkoutCard } from "@/components/WorkoutCard";
import { Workout, useWorkout } from "@/context/WorkoutContext";
import { useColors } from "@/hooks/useColors";

const PRESET_FILTERS = ["Chest & Shoulders", "Back & Biceps", "Legs", "Full Upper", "Core", "Full Body"];

export default function WorkoutsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { workouts, customCategories, deleteCustomWorkout } = useWorkout();
  const filters = ["All", ...PRESET_FILTERS, ...customCategories];
  const [activeFilter, setActiveFilter] = useState("All");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteCustomWorkout(pendingDeleteId);
    setPendingDeleteId(null);
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const filtered: Workout[] =
    activeFilter === "All"
      ? workouts
      : workouts.filter((w) => w.category === activeFilter);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Workouts</Text>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/create-workout" as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createBtnText}>Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBar}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  activeFilter === f ? colors.primary : colors.secondary,
              },
            ]}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    activeFilter === f ? colors.primaryForeground : colors.secondaryForeground,
                },
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <WorkoutCard
            workout={item}
            onPress={() => {
              if (pendingDeleteId) { setPendingDeleteId(null); return; }
              router.push(`/workout/${item.id}` as any);
            }}
            onDelete={item.isCustom ? () => setPendingDeleteId(item.id) : undefined}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="barbell-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No workouts in this category
            </Text>
          </View>
        )}
      />

      {pendingDeleteId && (
        <View style={[styles.confirmBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="warning-outline" size={20} color={colors.destructive} />
          <Text style={[styles.confirmText, { color: colors.foreground }]}>Delete this workout?</Text>
          <View style={styles.confirmBtns}>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.secondary }]}
              onPress={() => setPendingDeleteId(null)}
            >
              <Text style={[styles.confirmBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.destructive }]}
              onPress={confirmDelete}
            >
              <Text style={[styles.confirmBtnText, { color: "#fff" }]}>Delete</Text>
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
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  createBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff", marginLeft: 5 },
  filterBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_600SemiBold",
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  confirmBar: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  confirmText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  confirmBtns: {
    flexDirection: "row",
    gap: 8,
  },
  confirmBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  confirmBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});

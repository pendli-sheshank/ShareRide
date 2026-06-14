import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { Vehicle } from "../../types/database";
import { colors, spacing, fontSizes, borderRadius } from "../../constants/theme";

export default function VehiclesScreen() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [makeModel, setMakeModel] = useState("");
  const [color, setColor] = useState("");
  const [plateNo, setPlateNo] = useState("");
  const [seats, setSeats] = useState("4");
  const [loading, setLoading] = useState(false);

  const fetchVehicles = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("vehicles")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setVehicles(data as Vehicle[]);
  }, [user]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  async function addVehicle() {
    if (!makeModel.trim() || !color.trim() || !plateNo.trim()) {
      Alert.alert("Required", "Please fill in all vehicle details.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("vehicles").insert({
      owner_id: user?.id,
      make_model: makeModel.trim(),
      color: color.trim(),
      plate_no: plateNo.trim().toUpperCase(),
      seats: parseInt(seats) || 4,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setModalVisible(false);
    setMakeModel("");
    setColor("");
    setPlateNo("");
    setSeats("4");
    fetchVehicles();
  }

  async function deleteVehicle(id: string) {
    Alert.alert("Remove Vehicle", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await supabase.from("vehicles").delete().eq("id", id);
          fetchVehicles();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Ionicons name="car-sport" size={28} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.make_model}</Text>
              <Text style={styles.cardSub}>
                {item.color} · {item.plate_no} · {item.seats} seats
              </Text>
            </View>
            <TouchableOpacity onPress={() => deleteVehicle(item.id)}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No vehicles added</Text>
            <Text style={styles.emptyText}>
              Add a vehicle to start offering rides
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Vehicle</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Make & Model</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Toyota Camry 2020"
              placeholderTextColor={colors.textLight}
              value={makeModel}
              onChangeText={setMakeModel}
            />

            <Text style={styles.label}>Color</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. White"
              placeholderTextColor={colors.textLight}
              value={color}
              onChangeText={setColor}
            />

            <Text style={styles.label}>License Plate</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. ABC 1234"
              placeholderTextColor={colors.textLight}
              value={plateNo}
              onChangeText={setPlateNo}
              autoCapitalize="characters"
            />

            <Text style={styles.label}>Passenger Seats</Text>
            <TextInput
              style={styles.input}
              placeholder="4"
              placeholderTextColor={colors.textLight}
              value={seats}
              onChangeText={setSeats}
              keyboardType="number-pad"
              maxLength={1}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={addVehicle}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Adding..." : "Add Vehicle"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.text,
  },
  cardSub: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  fab: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modal: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  modalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
    color: colors.text,
  },
  form: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSizes.md,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: "600",
  },
});

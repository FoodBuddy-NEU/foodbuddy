import { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import restaurants from "@/lib/restaurants.json";

type Restaurant = {
  id: string;
  name: string;
  distanceMiles: number;
  priceLevel: 1 | 2 | 3 | 4;
  tags: string[];
  discount: null | { percent: number; appliesTo: string };
  menus: { id: string; name: string; price: number }[];
};

type SortKey = "distanceMiles" | "priceLevel" | "discount";
type SortOrder = "asc" | "desc";

export default function RestaurantList() {
  const data = restaurants as Restaurant[];

  // ---- UI state ----
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("distanceMiles");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Filters panel state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minDistance, setMinDistance] = useState<string>("");
  const [maxDistance, setMaxDistance] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  // ---- Derived: unique tags from JSON ----
  const allTags = useMemo(() => {
    const s = new Set<string>();
    data.forEach((r) => r.tags?.forEach((t) => s.add(t)));
    return Array.from(s).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [data]);

  const parseNum = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };
  const parseIntClamp = (v: string) => {
    const n = parseInt(v, 10);
    if (!Number.isFinite(n)) return null;
    return Math.min(4, Math.max(1, n));
  };

  // ---- Filter + sort ----
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hasTagFilter = selectedTags.size > 0;

    const minD = parseNum(minDistance);
    const maxD = parseNum(maxDistance);
    const minP = parseIntClamp(minPrice);
    const maxP = parseIntClamp(maxPrice);

    const byNameTagsAndRanges = data.filter((r) => {
      const nameMatch = !q || r.name.toLowerCase().includes(q);
      const tagMatch = !hasTagFilter || r.tags?.some((t) => selectedTags.has(t));

      const distMatch =
        (minD == null || r.distanceMiles >= minD) &&
        (maxD == null || r.distanceMiles <= maxD);

      const priceMatch =
        (minP == null || r.priceLevel >= minP) &&
        (maxP == null || r.priceLevel <= maxP);

      return nameMatch && tagMatch && distMatch && priceMatch;
    });

    const toNumber = (r: Restaurant, key: SortKey) => {
      if (key === "distanceMiles") return r.distanceMiles ?? Number.POSITIVE_INFINITY;
      if (key === "priceLevel") return r.priceLevel ?? Number.POSITIVE_INFINITY;
      if (key === "discount") return r.discount?.percent ?? 0;
      return 0;
    };

    const sorted = [...byNameTagsAndRanges].sort((a, b) => {
      const av = toNumber(a, sortKey);
      const bv = toNumber(b, sortKey);
      return sortOrder === "asc" ? av - bv : bv - av;
    });

    return sorted;
  }, [data, query, selectedTags, sortKey, sortOrder, minDistance, maxDistance, minPrice, maxPrice]);

  // ---- Helpers ----
  const formatDiscount = (r: Restaurant) =>
    r.discount ? `${r.discount.percent}% off ${r.discount.appliesTo}` : "No discount";

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const SortButton = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? "#111" : "#ccc",
        backgroundColor: active ? "#111" : "#fff",
        marginRight: 8,
      }}
    >
      <Text style={{ color: active ? "#fff" : "#111", fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );

  const Pill = ({
    text,
    selected,
    onPress,
  }: {
    text: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: selected ? "#111" : "#ccc",
        backgroundColor: selected ? "#111" : "#fff",
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ color: selected ? "#fff" : "#111" }}>{text}</Text>
    </Pressable>
  );

  const clearFilters = () => {
    setSelectedTags(new Set());
    setMinDistance("");
    setMaxDistance("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1 }}
    >
      <View style={{ padding: 16, flex: 1 }}>
        {/* Search input */}
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 8 }}>Find restaurants</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name…"
          placeholderTextColor="#999"
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            backgroundColor: "#fff",
            marginBottom: 10,
          }}
          returnKeyType="search"
        />

        {/* Toggle Filters panel */}
        <Pressable
          onPress={() => setFiltersOpen((o) => !o)}
          style={{
            alignSelf: "flex-start",
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: "#fff",
            marginBottom: filtersOpen ? 10 : 12,
          }}
        >
          <Text style={{ fontWeight: "600" }}>{filtersOpen ? "Hide filters" : "Show filters"}</Text>
        </Pressable>

        {/* Filters Panel */}
        {filtersOpen && (
          <View
            style={{
              borderWidth: 1,
              borderColor: "#e5e5e5",
              backgroundColor: "#fafafa",
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
            }}
          >
            {/* Tag chips */}
            {allTags.length ? (
              <>
                <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 6 }}>
                  Filter by tags
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 2 }}
                >
                  {allTags.map((t) => (
                    <Pill
                      key={t}
                      text={t}
                      selected={selectedTags.has(t)}
                      onPress={() => toggleTag(t)}
                    />
                  ))}
                  {selectedTags.size > 0 && (
                    <Pill text="Clear tags" selected={false} onPress={() => setSelectedTags(new Set())} />
                  )}
                </ScrollView>
              </>
            ) : null}

            {/* Distance / Price inputs */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600", marginBottom: 6 }}>Min distance (mi)</Text>
                <TextInput
                  value={minDistance}
                  onChangeText={setMinDistance}
                  placeholder="e.g. 0.5"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                  style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    backgroundColor: "#fff",
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600", marginBottom: 6 }}>Max distance (mi)</Text>
                <TextInput
                  value={maxDistance}
                  onChangeText={setMaxDistance}
                  placeholder="e.g. 3"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                  style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    backgroundColor: "#fff",
                  }}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600", marginBottom: 6 }}>Min price (1–4)</Text>
                <TextInput
                  value={minPrice}
                  onChangeText={setMinPrice}
                  placeholder="1"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    backgroundColor: "#fff",
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600", marginBottom: 6 }}>Max price (1–4)</Text>
                <TextInput
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  placeholder="4"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    backgroundColor: "#fff",
                  }}
                />
              </View>
            </View>

            {/* Apply / Clear */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <Pressable
                onPress={() => {
                  // No-op: values are already bound; just close
                  setFiltersOpen(false);
                }}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: "#111",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Apply</Text>
              </Pressable>
              <Pressable
                onPress={clearFilters}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  backgroundColor: "#fff",
                }}
              >
                <Text style={{ fontWeight: "700" }}>Clear</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Sorting */}
        <View style={{ marginTop: 2 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 6 }}>Sort</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <SortButton
              label={`Distance ${sortKey === "distanceMiles" ? (sortOrder === "asc" ? "↑" : "↓") : ""}`}
              active={sortKey === "distanceMiles"}
              onPress={() => {
                setSortKey("distanceMiles");
                setSortOrder((prev) =>
                  sortKey === "distanceMiles" ? (prev === "asc" ? "desc" : "asc") : "asc"
                );
              }}
            />
            <SortButton
              label={`Price ${sortKey === "priceLevel" ? (sortOrder === "asc" ? "↑" : "↓") : ""}`}
              active={sortKey === "priceLevel"}
              onPress={() => {
                setSortKey("priceLevel");
                setSortOrder((prev) =>
                  sortKey === "priceLevel" ? (prev === "asc" ? "desc" : "asc") : "asc"
                );
              }}
            />
            <SortButton
              label={`Discount ${sortKey === "discount" ? (sortOrder === "asc" ? "↑" : "↓") : ""}`}
              active={sortKey === "discount"}
              onPress={() => {
                setSortKey("discount");
                setSortOrder((prev) =>
                  sortKey === "discount" ? (prev === "asc" ? "desc" : "asc") : "asc"
                );
              }}
            />
            <Pressable
              onPress={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "#ccc",
                backgroundColor: "#fff",
                marginRight: 8,
              }}
            >
              <Text>{sortOrder === "asc" ? "Asc ↑" : "Desc ↓"}</Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Results */}
        <Text style={{ marginTop: 12, color: "#666" }}>
          Showing {filtered.length} {filtered.length === 1 ? "result" : "results"}
        </Text>

        <FlatList
          style={{ marginTop: 8 }}
          data={filtered}
          keyExtractor={(r) => r.id}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <Link href={`/restaurant/${item.id}`} asChild>
              <Pressable
                style={{
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#000",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.name}</Text>
                <Text style={{ color: "#666", marginTop: 2 }}>{`${item.distanceMiles.toFixed(1)} mi`}</Text>
                <Text style={{ marginTop: 4 }}>{formatDiscount(item)}</Text>
              </Pressable>
            </Link>
          )}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

import { View, Text, FlatList, Pressable } from "react-native";
import { Link } from "expo-router";
import { MOCK_RESTAURANTS } from "../lib/mock";

export default function Home() {
  const data = MOCK_RESTAURANTS;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "600", marginBottom: 12 }}>Restaurants & deals</Text>
      <FlatList
        data={data}
        keyExtractor={(r) => r.id}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <Link href={`/restaurant/${item.id}`} asChild>
            <Pressable style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#000", borderRadius: 12, padding: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.name}</Text>
              <Text style={{ color: "#666", marginTop: 2 }}>
                {`${item.foodTypes?.length ? item.foodTypes.join(", ") : "N/A"} • ${item.priceRange ?? "N/A"} • ⭐ ${item.rating ?? "-"}`}
              </Text>
              {!!item.deals?.length && (
                <Text style={{ marginTop: 4 }}>{`${item.deals.map(d => d.title).join(", ")}`}</Text>
              )}
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

import { useLocalSearchParams } from "expo-router";
import { View, Text, FlatList } from "react-native";
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

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const data = (restaurants as Restaurant[]).find((r) => r.id === id);

  if (!data) {
    return (
      <View style={{ padding: 16 }}>
        <Text>Not found</Text>
      </View>
    );
  }

  const priceToDollarSigns = (level: number) => "$".repeat(Math.max(1, Math.min(4, level)));

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>{data.name}</Text>

      <Text style={{ color: "#666" }}>
        {`${data.distanceMiles.toFixed(1)} mi • ${priceToDollarSigns(data.priceLevel)}`}
      </Text>

      {/* Tags */}
      {data.tags?.length ? (
        <Text style={{ marginTop: 4 }}>{data.tags.join(" • ")}</Text>
      ) : null}

      {/* Discount */}
      <Text style={{ fontSize: 16, fontWeight: "600", marginTop: 12 }}>Discount</Text>
      <Text style={{ color: "#333" }}>
        {data.discount ? `${data.discount.percent}% off ${data.discount.appliesTo}` : "No discount"}
      </Text>

      {/* Menu */}
      <Text style={{ fontSize: 16, fontWeight: "600", marginTop: 12 }}>Menu</Text>
      {data.menus?.length ? (
        <FlatList
          data={data.menus}
          keyExtractor={(i) => i.id}
          ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderWidth: 1,
                borderColor: "#eee",
                borderRadius: 10,
                padding: 10,
              }}
            >
              <Text>{item.name}</Text>
              <Text>${item.price.toFixed(2)}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={{ color: "#666" }}>No menu items</Text>
      )}
    </View>
  );
}

import { useLocalSearchParams, Link } from "expo-router";
import { View, Text, FlatList } from "react-native";
import { MOCK_RESTAURANTS } from "../../lib/mock";

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const data = MOCK_RESTAURANTS.find((r) => r.id === id);

  if (!data)
    return (
      <View style={{ padding: 16 }}>
        <Text>Not found</Text>
      </View>
    );

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>{data.name}</Text>
      <Text style={{ color: "#666" }}>
        {`${data.foodTypes?.length ? data.foodTypes.join(", ") : "N/A"} • ${data.priceRange ?? "N/A"} • ⭐ ${data.rating ?? "-"}`}
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", marginTop: 8 }}>
        Deals
      </Text>
      {data.deals?.length ? data.deals.map(d => (
  <Link key={d.id} href={{ pathname: '/deal/[id]', params: { id: d.id } }}>
          <View style={{ borderWidth: 1, borderColor: "#eee", borderRadius: 10, padding: 10, marginTop: 6 }}>
            <Text style={{ fontWeight: "600" }}>{d.title}</Text>
            {d.description ? <Text>{d.description}</Text> : null}
            {(d.validFrom || d.validTo) ? (
              <Text style={{ color: "#666", marginTop: 2 }}>
                {`${d.validFrom ? ` ${d.validFrom}` : ""}${d.validFrom && d.validTo ? " – " : d.validTo ? " until " : ""}${d.validTo ?? ""}`}
              </Text>
            ) : null}
          </View>
        </Link>
      )) : <Text style={{ color: "#666" }}>There is no deal avaliable at the moment</Text>}

      <Text style={{ fontSize: 16, fontWeight: "600", marginTop: 12 }}>
        Menu
      </Text>
      {data.menus?.map((m) => (
        <View key={m.id} style={{ marginTop: 8 }}>
          <Text style={{ fontWeight: "600" }}>{m.title}</Text>
          <FlatList
            data={m.items}
            keyExtractor={(i) => i.id}
            ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text>
                  {item.name}
                </Text>
                <Text>${item.price.toFixed(2)}</Text>
              </View>
            )}
          />
        </View>
      ))}

      {/* Reviews section */}
      <Text style={{ fontSize: 16, fontWeight: "600", marginTop: 12 }}>Reviews</Text>
      {data.reviews?.length ? (
        data.reviews.map((rev, idx) => (
          <View
            key={`${rev.userName}-${idx}`}
            style={{ borderWidth: 1, borderColor: "#eee", borderRadius: 10, padding: 10, marginTop: 6 }}
          >
            <Text style={{ fontWeight: "600" }}>{rev.userName}</Text>
            <Text style={{ color: "#666" }}>{`⭐ ${rev.rating}`}</Text>
            <Text style={{ marginTop: 4 }}>{rev.comment}</Text>
          </View>
        ))
      ) : (
        <Text style={{ color: "#666" }}>No reviews</Text>
      )}
    </View>
  );
}

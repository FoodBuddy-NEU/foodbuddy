import * as React from 'react';
import { useLocalSearchParams, Link } from "expo-router";
import { View, Text, Button, ScrollView } from "react-native";
import { MOCK_RESTAURANTS } from "../../lib/mock";
import { useState } from "react";

export default function DealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // find deal across restaurants
  let deal: any = null;
  let parent: any = null;
  for (const r of MOCK_RESTAURANTS) {
    const d = r.deals?.find((x: any) => x.id === id);
    if (d) {
      deal = d;
      parent = r;
      break;
    }
  }

  const [showCode, setShowCode] = useState(false);

  if (!deal)
    return (
      <View style={{ padding: 16 }}>
        <Text>Deal not found</Text>
      </View>
    );

  const isExpired = deal.status === 'expired' || (deal.validTo && new Date(deal.validTo) < new Date());

  return (
    <ScrollView style={{ padding: 16 }} contentContainerStyle={{ gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>{deal.title}</Text>
      {parent ? <Text style={{ color: '#666' }}>{`From: ${parent.name}`}</Text> : null}

      {deal.studentOnly ? (
        <View style={{ backgroundColor: '#eef6ff', padding: 6, borderRadius: 6, marginTop: 8 }}>
          <Text style={{ color: '#003a8c' }}>Verified students only</Text>
        </View>
      ) : null}

      <Text style={{ marginTop: 8, fontWeight: '600' }}>Details</Text>
      {deal.description ? <Text>{deal.description}</Text> : null}
      {deal.finePrint ? <Text style={{ color: '#666', marginTop: 6 }}>{deal.finePrint}</Text> : null}

      <View style={{ marginTop: 8 }}>
        <Text style={{ fontWeight: '600' }}>Validity</Text>
        <Text style={{ color: '#666' }}>{`${deal.validFrom ?? 'N/A'}${deal.validFrom && deal.validTo ? ' – ' : ''}${deal.validTo ?? ''}`}</Text>
        <Text style={{ color: isExpired ? 'red' : '#666', marginTop: 4 }}>{isExpired ? 'Expired' : (deal.status ?? 'active')}</Text>
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={{ fontWeight: '600' }}>Availability</Text>
        {deal.availability ? (
          <View>
            <Text style={{ color: '#666' }}>{`Dine-in: ${deal.availability.dineIn ? 'Yes' : 'No'}`}</Text>
            <Text style={{ color: '#666' }}>{`Takeout: ${deal.availability.takeout ? 'Yes' : 'No'}`}</Text>
            <Text style={{ color: '#666' }}>{`Delivery: ${deal.availability.delivery ? 'Yes' : 'No'}`}</Text>
            {deal.availability.daysOfWeek ? <Text style={{ color: '#666' }}>{`Days: ${deal.availability.daysOfWeek.join(', ')}`}</Text> : null}
            {deal.availability.timeRange ? <Text style={{ color: '#666' }}>{`Time: ${deal.availability.timeRange.start} – ${deal.availability.timeRange.end}`}</Text> : null}
          </View>
        ) : <Text style={{ color: '#666' }}>No specific availability restrictions</Text>}
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={{ fontWeight: '600' }}>Limits</Text>
        {deal.minPurchase ? <Text style={{ color: '#666' }}>{`Minimum purchase: $${deal.minPurchase.toFixed(2)}`}</Text> : <Text style={{ color: '#666' }}>No minimum purchase</Text>}
        {deal.perCustomerLimit ? <Text style={{ color: '#666' }}>{`Per-customer limit: ${deal.perCustomerLimit}`}</Text> : null}
        {deal.singleUse ? <Text style={{ color: '#666' }}>Single-use code</Text> : null}
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: '600' }}>Redemption</Text>
        <Text style={{ color: '#666' }}>{`Method: ${deal.redemptionMethod ?? 'none'}`}</Text>
        {deal.redemptionMethod === 'code' && !showCode ? (
          <Button title="Show Code" onPress={() => setShowCode(true)} />
        ) : null}
        {deal.redemptionMethod === 'code' && showCode ? (
          <View style={{ marginTop: 8, padding: 12, backgroundColor: '#000', borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18, textAlign: 'center' }}>{deal.redemptionCode ?? '—'}</Text>
          </View>
        ) : null}
      </View>

      <View style={{ marginTop: 16 }}>
        <Link href={{ pathname: '/restaurant/[id]', params: { id: parent?.id } }} style={{ marginBottom: 8 }}>
          <Text style={{ color: '#0066cc' }}>Back to {parent?.name}</Text>
        </Link>
      </View>
    </ScrollView>
  );
}

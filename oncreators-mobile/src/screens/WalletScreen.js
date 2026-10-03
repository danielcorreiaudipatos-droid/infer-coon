import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useSelector } from 'react-redux'

export default function WalletScreen() {
  const { balance } = useSelector(state => state.wallet || { balance: 0 })

  return (
    <ScrollView style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>R$ {balance?.toFixed(2) || '0.00'}</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Deposit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      <View style={styles.transaction}>
        <Text style={styles.txType}>Deposit</Text>
        <Text style={styles.txAmount}>+R$ 100.00</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  balanceCard: { backgroundColor: '#004E89', padding: 24, borderRadius: 12, marginBottom: 16 },
  balanceLabel: { fontSize: 14, color: '#fff', opacity: 0.9, marginBottom: 8 },
  balanceAmount: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionButton: { flex: 1, backgroundColor: '#FF6B35', padding: 12, borderRadius: 8 },
  actionText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  transaction: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  txType: { fontWeight: 'bold' },
  txAmount: { color: '#2ECC71', fontWeight: 'bold' },
})

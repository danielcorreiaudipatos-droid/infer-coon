import React, { useState } from 'react';

interface Cosmetic {
  id: string;
  name: string;
  price: number;
  icon: string;
  owned: boolean;
  category: 'skin' | 'effect' | 'theme';
}

export default function CosmeticsShop({ walletBalance }: { walletBalance: number }) {
  const [cosmetics] = useState<Cosmetic[]>([
    { id: 's1', name: 'Skin Ninja', price: 4.99, icon: '🥷', owned: true, category: 'skin' },
    { id: 's2', name: 'Skin Gold', price: 4.99, icon: '👑', owned: false, category: 'skin' },
    { id: 's3', name: 'Cyberpunk', price: 9.99, icon: '🤖', owned: false, category: 'skin' },
    { id: 'e1', name: 'Glow Effect', price: 2.99, icon: '✨', owned: true, category: 'effect' },
    { id: 'e2', name: 'Fire Effect', price: 2.99, icon: '🔥', owned: false, category: 'effect' },
    { id: 't1', name: 'Dark Theme', price: 1.99, icon: '🌙', owned: true, category: 'theme' },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold text-white mb-8">🛍️ Cosmetics Shop</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cosmetics.map(item => (
          <div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center hover:border-purple-500 transition">
            <div className="text-4xl mb-3">{item.icon}</div>
            <h3 className="text-white font-semibold text-sm mb-2">{item.name}</h3>
            
            {item.owned ? (
              <div className="bg-green-600 text-white text-xs font-bold py-2 rounded-lg">✓ Owned</div>
            ) : (
              <>
                <p className="text-gray-400 text-sm mb-2">R$ {item.price.toFixed(2)}</p>
                <button 
                  disabled={walletBalance < item.price}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold py-2 rounded-lg hover:scale-105 disabled:opacity-50 transition"
                >
                  Comprar
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const packages = [
  {
    priceId: 'price_1TVWF5PHeKMimTR5zpaSwrYd',
    name: 'Starter',
    price: 5,
    credits: 10,
    description: '10 verificări',
    color: 'border-gray-600',
  },
  {
    priceId: 'price_1TVWGDPHeKMimTR5xFX33SSa',
    name: 'Basic',
    price: 9,
    credits: 25,
    description: '25 verificări',
    color: 'border-blue-500',
    popular: true,
  },
  {
    priceId: 'price_1TVWHEPHeKMimTR5BYrGSQ1i',
    name: 'Pro',
    price: 19,
    credits: 60,
    description: '60 verificări',
    color: 'border-purple-500',
  },
  {
    priceId: 'price_1TVWIUPHeKMimTR5uDkxpnil',
    name: 'Expert',
    price: 49,
    credits: 200,
    description: '200 verificări',
    color: 'border-yellow-500',
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handlePurchase = async (priceId: string) => {
    setLoading(priceId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: 'test-user',
          userEmail: 'test@test.com',
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">
          Alege pachetul tău
        </h1>
        <p className="text-gray-400 text-center mb-12">
          Verifică orice mesaj suspect în secunde
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.priceId}
              className={`relative rounded-2xl border-2 ${pkg.color} bg-gray-900 p-6 flex flex-col`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Popular
                </span>
              )}
              <h2 className="text-xl font-bold mb-1">{pkg.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>
              <p className="text-4xl font-bold mb-6">
                €{pkg.price}
                <span className="text-sm text-gray-400 font-normal"> / one-time</span>
              </p>
              <ul className="text-sm text-gray-300 mb-6 space-y-2 flex-1">
                <li>✅ {pkg.credits} verificări</li>
                <li>✅ Rezultate instant</li>
                <li>✅ Istoric analize</li>
                <li>✅ Fără abonament</li>
              </ul>
              <button
                onClick={() => handlePurchase(pkg.priceId)}
                disabled={loading === pkg.priceId}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold disabled:opacity-50"
              >
                {loading === pkg.priceId ? 'Se încarcă...' : 'Cumpără acum'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

"use client";

import { useRegistration } from "@/lib/registration-context";

export function Step7Rates() {
  const { formData, updateForm } = useRegistration();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Rate Card</h2>
        <p className="text-gray-500 mt-1">
          Set your training rates. These are visible to Edstellar admins only
          and help us match you with appropriate opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Day Rate (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              $
            </span>
            <input
              type="number"
              min={0}
              step={50}
              value={formData.dayRateUsd}
              onChange={(e) =>
                updateForm({
                  dayRateUsd:
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                })
              }
              className="w-full pl-7 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="e.g. 1500"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Full-day (8 hours)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hourly Rate (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              $
            </span>
            <input
              type="number"
              min={0}
              step={10}
              value={formData.hourlyRateUsd}
              onChange={(e) =>
                updateForm({
                  hourlyRateUsd:
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                })
              }
              className="w-full pl-7 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="e.g. 200"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rate Notes
        </label>
        <textarea
          value={formData.rateNotes}
          onChange={(e) => updateForm({ rateNotes: e.target.value })}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
          placeholder="Any additional notes about your rates (e.g. travel surcharges, volume discounts, currency preferences)..."
        />
      </div>
    </div>
  );
}

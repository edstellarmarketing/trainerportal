"use client";

import { useRegistration } from "@/lib/registration-context";
import type { AvailabilitySlot } from "@/lib/registration-types";
import { useState } from "react";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// Get date string for N days from today
function futureDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const today = futureDate(0);
const maxDate = futureDate(90);

export function Step6Availability() {
  const { formData, updateForm } = useRegistration();
  const [newSlot, setNewSlot] = useState<Omit<AvailabilitySlot, "id">>({
    date: "",
    startTime: "09:00",
    endTime: "17:00",
    format: "virtual",
  });

  function addSlot() {
    if (!newSlot.date) return;
    const slot: AvailabilitySlot = { ...newSlot, id: generateId() };
    updateForm({
      availabilitySlots: [...formData.availabilitySlots, slot].sort(
        (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
      ),
    });
    setNewSlot({ date: "", startTime: "09:00", endTime: "17:00", format: "virtual" });
  }

  function removeSlot(id: string) {
    updateForm({
      availabilitySlots: formData.availabilitySlots.filter((s) => s.id !== id),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Availability</h2>
        <p className="text-gray-500 mt-1">
          Add your available time slots for the next 90 days.
        </p>
      </div>

      {/* Add slot form */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Add a slot</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              min={today}
              max={maxDate}
              value={newSlot.date}
              onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start</label>
            <input
              type="time"
              value={newSlot.startTime}
              onChange={(e) =>
                setNewSlot({ ...newSlot, startTime: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End</label>
            <input
              type="time"
              value={newSlot.endTime}
              onChange={(e) =>
                setNewSlot({ ...newSlot, endTime: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Format</label>
            <select
              value={newSlot.format}
              onChange={(e) =>
                setNewSlot({
                  ...newSlot,
                  format: e.target.value as AvailabilitySlot["format"],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="virtual">Virtual</option>
              <option value="in-person">In-Person</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={addSlot}
          disabled={!newSlot.date}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Add Slot
        </button>
      </div>

      {/* Slot list */}
      {formData.availabilitySlots.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-400 text-sm">
            No availability slots added yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            {formData.availabilitySlots.length} slot(s) added
          </p>
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
            {formData.availabilitySlots.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 hover:bg-gray-50 gap-2"
              >
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                  <span className="font-medium text-gray-900">
                    {new Date(slot.date + "T00:00:00").toLocaleDateString(
                      "en-US",
                      { weekday: "short", month: "short", day: "numeric" }
                    )}
                  </span>
                  <span className="text-gray-500">
                    {slot.startTime} - {slot.endTime}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium
                      ${slot.format === "virtual" ? "bg-purple-100 text-purple-700" : slot.format === "in-person" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
                    `}
                  >
                    {slot.format}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeSlot(slot.id)}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

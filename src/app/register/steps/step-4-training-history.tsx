"use client";

import { useRegistration } from "@/lib/registration-context";
import { DELIVERY_FORMAT_OPTIONS } from "@/lib/registration-types";
import { useState } from "react";

export function Step4TrainingHistory() {
  const { formData, updateForm } = useRegistration();
  const [topicInput, setTopicInput] = useState("");

  function addTopic() {
    const topic = topicInput.trim();
    if (!topic || formData.topicsTrained.includes(topic)) return;
    updateForm({ topicsTrained: [...formData.topicsTrained, topic] });
    setTopicInput("");
  }

  function removeTopic(topic: string) {
    updateForm({
      topicsTrained: formData.topicsTrained.filter((t) => t !== topic),
    });
  }

  function toggleFormat(format: string) {
    const current = formData.deliveryFormats;
    if (current.includes(format)) {
      updateForm({
        deliveryFormats: current.filter((f) => f !== format),
      });
    } else {
      updateForm({ deliveryFormats: [...current, format] });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Training History</h2>
        <p className="text-gray-500 mt-1">
          Tell us about the training sessions you have delivered.
        </p>
      </div>

      {/* Topics */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Topics Trained
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTopic();
              }
            }}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="Type a topic and press Enter"
          />
          <button
            type="button"
            onClick={addTopic}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            Add
          </button>
        </div>
        {formData.topicsTrained.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.topicsTrained.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                {topic}
                <button
                  type="button"
                  onClick={() => removeTopic(topic)}
                  className="hover:text-blue-900"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Total Sessions Delivered
        </label>
        <input
          type="number"
          min={0}
          value={formData.totalSessionsDelivered}
          onChange={(e) =>
            updateForm({
              totalSessionsDelivered:
                e.target.value === "" ? "" : parseInt(e.target.value),
            })
          }
          className="w-full max-w-xs px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          placeholder="e.g. 150"
        />
      </div>

      {/* Group Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Group Size
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            min={1}
            value={formData.preferredGroupSizeMin}
            onChange={(e) =>
              updateForm({
                preferredGroupSizeMin:
                  e.target.value === "" ? "" : parseInt(e.target.value),
              })
            }
            className="w-24 sm:w-28 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="Min"
          />
          <span className="text-gray-400">to</span>
          <input
            type="number"
            min={1}
            value={formData.preferredGroupSizeMax}
            onChange={(e) =>
              updateForm({
                preferredGroupSizeMax:
                  e.target.value === "" ? "" : parseInt(e.target.value),
              })
            }
            className="w-28 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="Max"
          />
          <span className="text-sm text-gray-400">participants</span>
        </div>
      </div>

      {/* Delivery Formats */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Delivery Formats <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {DELIVERY_FORMAT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleFormat(option.value)}
              className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition
                ${formData.deliveryFormats.includes(option.value) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-300"}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

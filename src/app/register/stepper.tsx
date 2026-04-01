"use client";

import { STEP_LABELS } from "@/lib/registration-types";
import { useRegistration } from "@/lib/registration-context";

export function Stepper() {
  const { currentStep, setCurrentStep } = useRegistration();

  return (
    <div className="w-full">
      {/* Mobile: compact */}
      <div className="sm:hidden flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep + 1} of {STEP_LABELS.length}
        </span>
        <span className="text-sm text-gray-500">
          {STEP_LABELS[currentStep]}
        </span>
      </div>

      {/* Desktop: full stepper */}
      <nav className="hidden sm:block" aria-label="Registration progress">
        <ol className="flex items-center w-full">
          {STEP_LABELS.map((label, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <li
                key={label}
                className={`flex items-center ${index < STEP_LABELS.length - 1 ? "flex-1" : ""}`}
              >
                <button
                  onClick={() => {
                    if (index <= currentStep) setCurrentStep(index);
                  }}
                  disabled={index > currentStep}
                  className={`flex items-center gap-2 text-sm font-medium whitespace-nowrap
                    ${isCurrent ? "text-blue-600" : isCompleted ? "text-green-600 hover:text-green-700" : "text-gray-400"}
                    disabled:cursor-not-allowed
                  `}
                >
                  <span
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold border-2 shrink-0
                      ${isCurrent ? "border-blue-600 bg-blue-600 text-white" : isCompleted ? "border-green-600 bg-green-600 text-white" : "border-gray-300 text-gray-400"}
                    `}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="hidden lg:inline">{label}</span>
                </button>
                {index < STEP_LABELS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${isCompleted ? "bg-green-600" : "bg-gray-200"}`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-1 mt-2 sm:mt-4 rounded-full">
        <div
          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
          style={{
            width: `${((currentStep + 1) / STEP_LABELS.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

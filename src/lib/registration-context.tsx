"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  INITIAL_FORM_DATA,
  type RegistrationFormData,
} from "./registration-types";

const STORAGE_KEY = "trainer-registration-draft";

interface RegistrationContextType {
  formData: RegistrationFormData;
  updateForm: (updates: Partial<RegistrationFormData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  resetForm: () => void;
  isLoaded: boolean;
}

const RegistrationContext = createContext<RegistrationContextType | null>(null);

// Serialize form data for localStorage (strip File objects)
function serializeForStorage(data: RegistrationFormData) {
  return JSON.stringify(data, (key, value) => {
    if (value instanceof File) return null;
    return value;
  });
}

export function RegistrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [formData, setFormData] =
    useState<RegistrationFormData>(INITIAL_FORM_DATA);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData({ ...INITIAL_FORM_DATA, ...parsed.formData });
        setCurrentStep(parsed.currentStep || 0);
      }
    } catch {
      // ignore parse errors
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          formData: JSON.parse(serializeForStorage(formData)),
          currentStep,
        })
      );
    } catch {
      // ignore storage errors
    }
  }, [formData, currentStep, isLoaded]);

  const updateForm = useCallback(
    (updates: Partial<RegistrationFormData>) => {
      setFormData((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(0);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <RegistrationContext.Provider
      value={{
        formData,
        updateForm,
        currentStep,
        setCurrentStep,
        resetForm,
        isLoaded,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error(
      "useRegistration must be used within a RegistrationProvider"
    );
  }
  return context;
}

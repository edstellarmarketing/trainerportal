export interface RegistrationFormData {
  // Step 1: Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  locationCity: string;
  locationCountry: string;
  linkedinUrl: string;
  bio: string;
  headshot: File | null;
  headshotPreview: string;

  // Step 2: Domain Selection
  primaryDomains: string[]; // domain IDs
  secondaryDomains: string[]; // domain IDs

  // Step 3: Experience & Certifications
  yearsOfExperience: number | "";
  certifications: CertificationEntry[];

  // Step 4: Training History
  topicsTrained: string[];
  totalSessionsDelivered: number | "";
  preferredGroupSizeMin: number | "";
  preferredGroupSizeMax: number | "";
  deliveryFormats: string[];

  // Step 5: Sample Content
  sampleOutline: File | null;
  sampleOutlinePreview: string;
  sampleSlides: File | null;
  sampleSlidesPreview: string;
  sampleVideoUrl: string;

  // Step 6: Availability
  availabilitySlots: AvailabilitySlot[];

  // Step 7: Rate Card
  dayRateUsd: number | "";
  hourlyRateUsd: number | "";
  rateNotes: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
  document: File | null;
  documentPreview: string;
}

export interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  format: "in-person" | "virtual" | "hybrid";
}

export const INITIAL_FORM_DATA: RegistrationFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  locationCity: "",
  locationCountry: "",
  linkedinUrl: "",
  bio: "",
  headshot: null,
  headshotPreview: "",

  primaryDomains: [],
  secondaryDomains: [],

  yearsOfExperience: "",
  certifications: [],

  topicsTrained: [],
  totalSessionsDelivered: "",
  preferredGroupSizeMin: "",
  preferredGroupSizeMax: "",
  deliveryFormats: [],

  sampleOutline: null,
  sampleOutlinePreview: "",
  sampleSlides: null,
  sampleSlidesPreview: "",
  sampleVideoUrl: "",

  availabilitySlots: [],

  dayRateUsd: "",
  hourlyRateUsd: "",
  rateNotes: "",
};

export const STEP_LABELS = [
  "Basic Info",
  "Domains",
  "Experience",
  "Training History",
  "Sample Content",
  "Availability",
  "Rate Card",
  "Review & Submit",
];

export const DELIVERY_FORMAT_OPTIONS = [
  { value: "in-person", label: "In-Person" },
  { value: "virtual", label: "Virtual" },
  { value: "hybrid", label: "Hybrid" },
];

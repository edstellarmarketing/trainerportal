"use client";

import { useRegistration } from "@/lib/registration-context";
import { useRef } from "react";

export function Step5Content() {
  const { formData, updateForm } = useRegistration();
  const outlineRef = useRef<HTMLInputElement>(null);
  const slidesRef = useRef<HTMLInputElement>(null);

  function handleFile(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "outline" | "slides"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "outline") {
      updateForm({ sampleOutline: file, sampleOutlinePreview: file.name });
    } else {
      updateForm({ sampleSlides: file, sampleSlidesPreview: file.name });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Sample Content</h2>
        <p className="text-gray-500 mt-1">
          Upload samples of your training materials. This helps us evaluate
          your content quality.
        </p>
      </div>

      {/* Outline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sample Training Outline
        </label>
        <div
          onClick={() => outlineRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
        >
          {formData.sampleOutlinePreview ? (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-gray-700">
                {formData.sampleOutlinePreview}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateForm({
                    sampleOutline: null,
                    sampleOutlinePreview: "",
                  });
                }}
                className="text-red-500 hover:text-red-600 text-xs ml-2"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <svg
                className="w-8 h-8 text-gray-400 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-gray-500">
                Click to upload training outline
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, DOC, DOCX. Max 10MB.
              </p>
            </>
          )}
        </div>
        <input
          ref={outlineRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => handleFile(e, "outline")}
          className="hidden"
        />
      </div>

      {/* Slides */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sample Slides / Presentation
        </label>
        <div
          onClick={() => slidesRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
        >
          {formData.sampleSlidesPreview ? (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-gray-700">
                {formData.sampleSlidesPreview}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateForm({
                    sampleSlides: null,
                    sampleSlidesPreview: "",
                  });
                }}
                className="text-red-500 hover:text-red-600 text-xs ml-2"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <svg
                className="w-8 h-8 text-gray-400 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-gray-500">
                Click to upload presentation
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, PPT, PPTX. Max 25MB.
              </p>
            </>
          )}
        </div>
        <input
          ref={slidesRef}
          type="file"
          accept=".pdf,.ppt,.pptx"
          onChange={(e) => handleFile(e, "slides")}
          className="hidden"
        />
      </div>

      {/* Video URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sample Video URL
        </label>
        <input
          type="url"
          value={formData.sampleVideoUrl}
          onChange={(e) => updateForm({ sampleVideoUrl: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          placeholder="https://youtube.com/watch?v=... or Vimeo/Loom link"
        />
        <p className="text-xs text-gray-400 mt-1">
          YouTube, Vimeo, or Loom link to a training session recording.
        </p>
      </div>
    </div>
  );
}

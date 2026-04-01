"use client";

import { useRegistration } from "@/lib/registration-context";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface Domain {
  id: string;
  name: string;
  category: string;
}

export function Step2Domains() {
  const { formData, updateForm } = useRegistration();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchDomains() {
      const supabase = createClient();
      const { data } = await supabase
        .from("domains")
        .select("id, name, category")
        .eq("is_active", true)
        .order("display_order");
      setDomains(data || []);
      setLoading(false);
    }
    fetchDomains();
  }, []);

  const grouped = domains.reduce<Record<string, Domain[]>>((acc, d) => {
    const cat = d.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(d);
    return acc;
  }, {});

  const filtered = search
    ? Object.fromEntries(
        Object.entries(grouped)
          .map(([cat, doms]) => [
            cat,
            doms.filter((d) =>
              d.name.toLowerCase().includes(search.toLowerCase())
            ),
          ])
          .filter(([, doms]) => (doms as Domain[]).length > 0)
      )
    : grouped;

  function toggleDomain(id: string, type: "primary" | "secondary") {
    const key = type === "primary" ? "primaryDomains" : "secondaryDomains";
    const otherKey = type === "primary" ? "secondaryDomains" : "primaryDomains";
    const current = formData[key];
    const other = formData[otherKey];

    if (current.includes(id)) {
      updateForm({ [key]: current.filter((d) => d !== id) });
    } else {
      // Remove from the other list if present
      if (other.includes(id)) {
        updateForm({
          [otherKey]: other.filter((d) => d !== id),
          [key]: [...current, id],
        });
      } else {
        updateForm({ [key]: [...current, id] });
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Domain Selection
        </h2>
        <p className="text-gray-500 mt-1">
          Select your training domains. Choose at least one primary domain.
        </p>
      </div>

      <div className="flex gap-4 text-sm">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600" />
          Primary ({formData.primaryDomains.length})
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-400" />
          Secondary ({formData.secondaryDomains.length})
        </span>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search domains..."
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
      />

      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {Object.entries(filtered).map(([category, categoryDomains]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {(categoryDomains as Domain[]).map((domain) => {
                const isPrimary = formData.primaryDomains.includes(domain.id);
                const isSecondary = formData.secondaryDomains.includes(
                  domain.id
                );

                return (
                  <div key={domain.id} className="group relative">
                    <button
                      type="button"
                      onClick={() =>
                        toggleDomain(
                          domain.id,
                          isPrimary ? "primary" : isSecondary ? "secondary" : "primary"
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition
                        ${isPrimary ? "bg-blue-600 text-white border-blue-600" : isSecondary ? "bg-gray-200 text-gray-700 border-gray-300" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}
                      `}
                    >
                      {domain.name}
                    </button>
                    {(isPrimary || isSecondary) && (
                      <button
                        type="button"
                        onClick={() =>
                          toggleDomain(
                            domain.id,
                            isPrimary ? "secondary" : "primary"
                          )
                        }
                        className="absolute -top-1 -right-1 w-5 h-5 bg-white border border-gray-300 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-gray-50"
                        title={
                          isPrimary
                            ? "Move to secondary"
                            : "Move to primary"
                        }
                      >
                        {isPrimary ? "S" : "P"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";

const links = [
  {
    title: "Trainer Registration",
    description: "Register as a trainer — upload resume, auto-fill profile",
    href: "/register",
    color: "bg-blue-600",
  },
  {
    title: "Trainer Login",
    description: "Sign in with magic link (for approved trainers)",
    href: "/login/trainer",
    color: "bg-purple-600",
  },
  {
    title: "Admin Login",
    description: "Sign in with email & password (admin access)",
    href: "/login/admin",
    color: "bg-gray-800",
  },
  {
    title: "Admin Dashboard",
    description: "Manage trainers — view, approve, reject (requires login)",
    href: "/admin",
    color: "bg-indigo-600",
  },
  {
    title: "Health Check",
    description: "Verify Supabase connection and all 9 tables",
    href: "/api/health",
    color: "bg-green-600",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">
            Edstellar Trainer Portal
          </h1>
          <p className="text-gray-500 mt-2">
            Internal testing — all pages linked below
          </p>
        </div>

        <div className="space-y-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition group"
            >
              <div
                className={`w-10 h-10 ${link.color} rounded-lg flex items-center justify-center shrink-0`}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {link.title}
                </h2>
                <p className="text-sm text-gray-500">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

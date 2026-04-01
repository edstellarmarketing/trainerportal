import { RegistrationProvider } from "@/lib/registration-context";

export const metadata = {
  title: "Trainer Registration | Edstellar",
  description: "Register as a trainer on the Edstellar platform",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RegistrationProvider>{children}</RegistrationProvider>;
}

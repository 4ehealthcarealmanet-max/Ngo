"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PREMIUM_TAB, PREMIUM_TABS_WRAPPER } from "../lib/ui";

const tabs = [
  { label: "Inventory", href: "/admin/blood-bank/inventory" },
  { label: "Donors", href: "/admin/blood-bank/donors" },
  { label: "Logs", href: "/admin/blood-bank/logs" },
  { label: "Tracking", href: "/admin/blood-bank/tracking" },
] as const;

export default function BloodBankTabs() {
  const pathname = usePathname();

  return (
    <div className={PREMIUM_TABS_WRAPPER}>
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={[
              PREMIUM_TAB,
              active
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm",
            ].join(" ")}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

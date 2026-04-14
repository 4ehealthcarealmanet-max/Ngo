import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-[#F8FAFC]">
      {/* Ye layout global navbar/footer ko skip karega */}
      {children}
    </section>
  );
}
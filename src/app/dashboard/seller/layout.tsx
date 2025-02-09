import { ReactNode } from "react";

export default function SellerDashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  )
}
import dynamic from "next/dynamic";

const Admin = dynamic(() => import("../components/Admin"), { ssr: false });

export default function AdminPage() {
  return (
    <Admin />
  );
}

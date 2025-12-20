import QuickNavAdmin from "@/components/admin/QuickNavAdmin";
import ContactAdmin from "@/components/admin/sections/ContactAdmin";

export default function RightColumnAdmin() {
  return (
    <div className="col-span-full lg:col-span-5 xl:col-span-4 lg:col-start-8 xl:col-start-9 self-start">
      <QuickNavAdmin />
      <ContactAdmin />
    </div>
  );
}

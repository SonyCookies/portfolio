import QuickNavAdmin from "@/components/QuickNavAdmin";
import Contact from "@/components/sections/Contact";

export default function RightColumnAdmin() {
  return (
    <div className="col-span-full lg:col-span-5 xl:col-span-4 lg:col-start-8 xl:col-start-9 self-start">
      <QuickNavAdmin />
      <Contact />
    </div>
  );
}

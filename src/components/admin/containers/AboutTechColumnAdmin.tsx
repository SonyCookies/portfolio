import AboutAdmin from "@/components/admin/sections/AboutAdmin";
import TechStackAdmin from "@/components/admin/sections/TechStackAdmin";

export default function AboutTechColumnAdmin() {
  return (
    <div className="col-span-full lg:col-span-7 xl:col-span-8">
      <AboutAdmin />
      <TechStackAdmin />
    </div>
  );
}

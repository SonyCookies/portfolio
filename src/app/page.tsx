import Hero from "@/components/sections/Hero";
import AboutTechColumn from "@/components/containers/AboutTechColumn";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import BeyondCoding from "@/components/sections/BeyondCoding";
import Certifications from "@/components/sections/Certifications";
import Testimonials from "@/components/sections/Testimonials";
import Network from "@/components/sections/Network";
import RightColumn from "@/components/containers/RightColumn";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Hero />
        <RightColumn />
        <Experience />
        <AboutTechColumn />
        <Projects />
        <BeyondCoding />
        <Certifications />
        <Testimonials />
        <Network />
      </div>
    </div>
  );
}

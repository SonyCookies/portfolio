import Hero from "../components/Hero";
import AboutTechColumn from "../components/AboutTechColumn";
import Experience from "../components/Experience";
import Projects from "../components/Projects";
import BeyondCoding from "../components/BeyondCoding";
import Certifications from "../components/Certifications";
import Testimonials from "../components/Testimonials";
import RightColumn from "../components/RightColumn";

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
      </div>
    </div>
  );
}

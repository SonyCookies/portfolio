import About from "./About";
import TechStack from "./TechStack";

export default function AboutTechColumn() {
  return (
    <div className="col-span-full lg:col-span-7 xl:col-span-8">
      <About />
      <TechStack />
    </div>
  );
}

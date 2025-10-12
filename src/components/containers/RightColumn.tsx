import QuickNav from "./QuickNav";
import Contact from "./Contact";

export default function RightColumn() {
  return (
    <div className="col-span-full lg:col-span-5 xl:col-span-4 lg:col-start-8 xl:col-start-9 self-start">
      <QuickNav />
      <Contact />
    </div>
  );
}

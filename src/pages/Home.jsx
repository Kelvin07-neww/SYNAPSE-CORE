import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../sections/Hero.jsx";
import Services from "../sections/Services.jsx";
import Technologies from "../sections/Technologies.jsx";
import Pricing from "../sections/Pricing.jsx";
import Portfolio from "../sections/Portfolio.jsx";
import Process from "../sections/Process.jsx";
import WhyChooseUs from "../sections/WhyChooseUs.jsx";
import StudentSection from "../sections/StudentSection.jsx";
import BusinessSection from "../sections/BusinessSection.jsx";
import Testimonials from "../sections/Testimonials.jsx";
import FAQ from "../sections/FAQ.jsx";
import Contact from "../sections/Contact.jsx";

export default function Home() {
  const { state } = useLocation();

  useEffect(() => {
    const id = state?.scrollTo;
    if (!id) return undefined;
    const timer = setTimeout(() => {
      if (id === "home") window.scrollTo({ top: 0, behavior: "smooth" });
      else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 80);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <>
      <Hero />
      <Services />
      <Technologies />
      <WhyChooseUs />
      <BusinessSection />
      <Pricing />
      <Portfolio />
      <StudentSection />
      <Process />
      <Testimonials />
      <FAQ />
      <Contact />
    </>
  );
}

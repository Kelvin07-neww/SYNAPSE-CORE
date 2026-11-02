import { motion } from "framer-motion";
import SectionHeading from "../components/SectionHeading.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import { services } from "../data/services.js";
import { stagger } from "../lib/animations.js";

export default function Services() {
  return (
    <section id="services" className="scroll-mt-24 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Services" title="Solusi Software untuk Berbagai Kebutuhan" description="Dari ide, desain arsitektur, coding, sampai deployment — semua ditangani dalam satu tim." />
        <motion.div variants={stagger()} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => <ServiceCard key={s.title} service={s} />)}
        </motion.div>
      </div>
    </section>
  );
}

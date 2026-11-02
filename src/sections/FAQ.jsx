import { useState } from "react";
import SectionHeading from "../components/SectionHeading.jsx";
import FAQItem from "../components/FAQItem.jsx";
import { faqs } from "../data/faq.js";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <section id="faq" className="scroll-mt-24 px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Pertanyaan yang Sering Diajukan" />
        <div className="flex flex-col gap-3">
          {faqs.map((f, i) => (
            <FAQItem key={f.q} id={i} question={f.q} answer={f.a} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

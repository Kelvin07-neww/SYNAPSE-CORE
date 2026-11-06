import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import GlassCard from "../components/GlassCard.jsx";
import { budgets, platformOptions, projectTypes } from "../data/contact.js";
import { buildBriefMessage, buildWhatsAppUrl } from "../lib/whatsapp.js";

const initialForm = { name: "", email: "", whatsapp: "", project: projectTypes[0], platform: platformOptions[0], budget: budgets[0], deadline: "", description: "" };
const inputClass = "w-full rounded-lg border border-white/10 bg-ink-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/60";

function Field({ label, id, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">{label}</label>
      {children}
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const update = (e) => {
    setSent(false);
    setError("");
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const message = buildBriefMessage(form);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true); setError("");
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSent(`Brief berhasil dikirim dengan nomor pesanan ${data.order.id}. Admin akan menghubungi Anda.`);
      setForm(initialForm);
    } catch (requestError) { setError(requestError.message || "Brief gagal dikirim. Silakan coba lagi."); }
    finally { setSending(false); }
  };

  return (
    <section id="contact" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="Contact" title="Ceritakan Project Anda" description="Isi brief singkat. Kami balas dengan estimasi biaya, teknologi, dan timeline." />
        <GlassCard className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            <Field label="Nama" id="name"><input id="name" name="name" required value={form.name} onChange={update} className={inputClass} autoComplete="name" /></Field>
            <Field label="Email" id="email"><input id="email" name="email" type="email" required value={form.email} onChange={update} className={inputClass} autoComplete="email" /></Field>
            <Field label="WhatsApp" id="whatsapp"><input id="whatsapp" name="whatsapp" type="tel" value={form.whatsapp} onChange={update} placeholder="08xxxxxxxxxx" className={inputClass} autoComplete="tel" /></Field>
            <Field label="Jenis Project" id="project">
              <select id="project" name="project" value={form.project} onChange={update} className={inputClass}>{projectTypes.map((o) => <option key={o}>{o}</option>)}</select>
            </Field>
            <Field label="Platform" id="platform">
              <select id="platform" name="platform" value={form.platform} onChange={update} className={inputClass}>{platformOptions.map((o) => <option key={o}>{o}</option>)}</select>
            </Field>
            <Field label="Budget" id="budget">
              <select id="budget" name="budget" value={form.budget} onChange={update} className={inputClass}>{budgets.map((o) => <option key={o}>{o}</option>)}</select>
            </Field>
            <Field label="Deadline" id="deadline"><input id="deadline" name="deadline" type="date" value={form.deadline} onChange={update} className={`${inputClass} [color-scheme:dark]`} /></Field>
            <div className="sm:col-span-2">
              <Field label="Deskripsi Project" id="description">
                <textarea id="description" name="description" required rows={5} value={form.description} onChange={update} className={inputClass} placeholder="Ceritakan tujuan, fitur utama, dan referensi yang Anda punya." />
              </Field>
            </div>
            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
              <button type="submit" disabled={sending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(59,130,246,0.35)] transition hover:brightness-110 active:scale-95 disabled:opacity-60 sm:w-auto">
                <Send size={16} aria-hidden="true" /> {sending ? "Mengirim..." : "Kirim Project Brief"}
              </button>
              <a href={buildWhatsAppUrl(message)} target="_blank" rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10 sm:w-auto">
                <MessageCircle size={16} aria-hidden="true" /> Chat via WhatsApp
              </a>
            </div>
            {sent && <p role="status" className="text-sm text-cyan-300 sm:col-span-2">{sent}</p>}
            {error && <p role="alert" className="text-sm text-red-300 sm:col-span-2">{error}</p>}
          </form>
        </GlassCard>
      </div>
    </section>
  );
}

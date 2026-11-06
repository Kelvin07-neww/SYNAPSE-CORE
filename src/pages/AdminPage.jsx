import { useMemo, useState } from "react";
import { Bot, CheckCircle2, FileUp, KeyRound, RefreshCw, Search, XCircle } from "lucide-react";
import { rupiah } from "../lib/format.js";
import qrisImage from "../images/qris.png";

const statusStyle = {
  baru: "bg-blue-400/15 text-blue-200", menunggu_bukti_pembayaran: "bg-amber-400/15 text-amber-200",
  menunggu_verifikasi_pembayaran: "bg-orange-400/15 text-orange-200", siap_dikerjakan: "bg-emerald-400/15 text-emerald-200",
  belum_dikerjakan: "bg-slate-400/15 text-slate-200", sedang_dikerjakan: "bg-violet-400/15 text-violet-200",
  selesai: "bg-emerald-400/15 text-emerald-200", menunggu_pelunasan: "bg-amber-400/15 text-amber-200",
};
const paymentTypeLabel = { DP: "DP", FINAL: "Pelunasan", FULL: "Lunas" };
const inputClass = "rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60 disabled:cursor-not-allowed disabled:opacity-50";

function InvoicePanel({ order, form, onChange, onSubmit }) {
  const total = order.payments.find((payment) => payment.totalAmount)?.totalAmount || 0;
  const hasPending = order.payments.some((payment) => payment.status === "PENDING");
  const locked = order.status === "selesai";
  const summary = total > 0 && <p className="text-sm text-slate-300">Total project {rupiah(total)} · Dibayar {rupiah(order.paidAmount)} · Sisa <span className={order.paidAmount >= total ? "text-emerald-200" : "text-amber-200"}>{rupiah(Math.max(total - order.paidAmount, 0))}</span></p>;
  if (hasPending) return <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">{summary}<p className="mt-1 text-xs text-amber-200">Tagihan {paymentTypeLabel[order.payment?.paymentType]} {rupiah(order.payment?.amount || 0)} menunggu pembayaran/verifikasi bukti.</p></div>;
  if (total > 0 && order.paidAmount >= total) return <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">{summary}<p className="mt-1 text-xs text-emerald-200">Pesanan sudah lunas.</p></div>;
  if (order.paidAmount > 0) return <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4"><div>{summary}<p className="mt-1 text-xs text-slate-400">DP sudah diterima. Tagih pelunasan sebelum project diselesaikan.</p></div><button onClick={() => onSubmit("FINAL")} disabled={locked} className={`${buttonClass} bg-cyan-400 text-slate-950`}>Tagih pelunasan {rupiah(total - order.paidAmount)}</button></div>;
  const type = form.paymentType || "DP";
  const percent = Number(form.dpPercent || 50);
  const amount = Number(form.amount || 0);
  const due = type === "DP" ? Math.round(amount * percent / 100) : amount;
  return <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4"><p className="text-sm font-medium text-cyan-100">Buat Tagihan QRIS</p>
    <div className="mt-3 grid gap-2 sm:grid-cols-[auto_minmax(0,170px)_auto_1fr_auto]">
      <select disabled={locked} value={type} onChange={(event) => onChange("paymentType", event.target.value)} className={inputClass}><option value="DP">DP (uang muka)</option><option value="FULL">Bayar lunas</option></select>
      <input type="number" min="1000" step="1000" disabled={locked} value={form.amount || ""} onChange={(event) => onChange("amount", event.target.value)} placeholder="Total harga project" className={inputClass} />
      {type === "DP" ? <select disabled={locked} value={percent} onChange={(event) => onChange("dpPercent", event.target.value)} className={inputClass}>{[30, 40, 50, 60, 70].map((value) => <option key={value} value={value}>DP {value}%</option>)}</select> : <span />}
      <input disabled={locked} value={form.description || ""} onChange={(event) => onChange("description", event.target.value)} placeholder={`${type === "DP" ? "DP" : "Tagihan"} pesanan ${order.id}`} className={inputClass} />
      <button onClick={() => onSubmit(type)} disabled={!amount || locked} className={`${buttonClass} bg-cyan-400 text-slate-950`}>Buat QRIS</button>
    </div>
    <p className="mt-2 text-xs text-slate-400">{locked ? "Pesanan selesai dikunci. Klik Buka kembali di bagian status pekerjaan sebelum membuat tagihan." : amount ? `Customer membayar ${rupiah(due)} sekarang${type === "DP" ? `; sisa ${rupiah(amount - due)} ditagih sebagai pelunasan.` : "."} Project dikerjakan setelah bukti disetujui.` : "Isi total harga project. Customer dapat mengirim bukti langsung melalui WhatsApp."}</p>
  </div>;
}
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [invoiceForms, setInvoiceForms] = useState({});
  const auth = { Authorization: `Bearer ${key}` };

  const recap = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => order.status === "belum_dikerjakan" || order.status === "baru").length,
    inProgress: orders.filter((order) => order.status === "sedang_dikerjakan").length,
    completed: orders.filter((order) => order.status === "selesai").length,
  }), [orders]);
  const visibleOrders = useMemo(() => orders.filter((order) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "belum_dikerjakan") return order.status === "baru" || order.status === "belum_dikerjakan";
    return order.status === statusFilter;
  }).filter((order) => `${order.id} ${order.customer.name} ${order.customer.phone} ${order.customer.email} ${order.brief?.project || ""}`.toLowerCase().includes(search.toLowerCase().trim())), [orders, statusFilter, search]);

  async function loadOrders() {
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/admin/dashboard", { headers: auth });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setOrders(data.orders);
      setLeads(data.leads || []);
      setMetrics(data.metrics || null);
      setLastUpdated(new Date());
    } catch (error) { setMessage(error.message || "Gagal memuat rekap."); }
    finally { setLoading(false); }
  }

  async function uploadProof(event, order) {
    const file = event.target.files?.[0];
    if (!file) return;
    const form = new FormData(); form.append("proof", file);
    if (order.payment?.id) form.append("paymentId", order.payment.id);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/payment-proof`, { method: "POST", headers: auth, body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage(`Bukti pembayaran untuk ${order.id} berhasil diunggah.`); await loadOrders();
    } catch (error) { setMessage(error.message || "Unggah bukti gagal."); }
    event.target.value = "";
  }

  async function review(proofId, approved) {
    try {
      const response = await fetch(`/api/admin/payment-proofs/${proofId}/review`, { method: "POST", headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify({ approved }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage(approved ? `Pembayaran disetujui; status pesanan: ${(data.proof.orderStatus || "tidak berubah").replaceAll("_", " ")}.` : "Bukti ditolak; pesanan menunggu bukti baru."); await loadOrders();
    } catch (error) { setMessage(error.message || "Gagal memperbarui bukti."); }
  }

  async function updateStatus(orderId, status) {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, { method: "PATCH", headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage(`Status ${orderId} diperbarui menjadi ${status.replaceAll("_", " ")}.`); await loadOrders();
    } catch (error) { setMessage(error.message || "Gagal memperbarui status."); }
  }

  async function reopenOrder(orderId) {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/reopen`, { method: "POST", headers: auth });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage(`Pesanan ${orderId} dibuka kembali dan berstatus sedang dikerjakan.`); await loadOrders();
    } catch (error) { setMessage(error.message || "Gagal membuka kembali pesanan."); }
  }

  function updateInvoiceForm(orderId, field, value) {
    setInvoiceForms((forms) => ({ ...forms, [orderId]: { ...forms[orderId], [field]: value } }));
  }

  async function createInvoice(order, paymentType) {
    const form = invoiceForms[order.id] || {};
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/invoice`, {
        method: "POST", headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ paymentType, totalAmount: Number(form.amount), dpPercent: Number(form.dpPercent || 50), description: form.description }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage(`Tagihan ${paymentTypeLabel[data.payment.paymentType]} ${order.id} berhasil dibuat. Nominal: ${rupiah(data.payment.amount)}.${data.notified ? " QRIS telah dikirim ke WhatsApp customer." : " Pesan/gambar QRIS belum terkirim, tetapi tagihan tetap tersimpan. Periksa nomor customer dan koneksi bot."}`);
      setInvoiceForms((forms) => ({ ...forms, [order.id]: {} }));
      await loadOrders();
    } catch (error) { setMessage(error.message || "Gagal membuat tagihan."); }
  }

  return <section className="min-h-screen px-4 py-24 sm:px-6 sm:py-28"><div className="mx-auto max-w-6xl">
    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Admin</p>
    <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Rekap Pesanan</h1>
      <p className="mt-3 text-slate-400">Kelola pesanan, pembayaran, dan lead konsultasi dari chatbot.</p>
      <div className="mt-8 flex max-w-xl flex-col gap-3 rounded-xl border border-white/10 bg-ink-950/70 p-3 sm:flex-row sm:items-center sm:gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-2"><KeyRound className="shrink-0 text-cyan-300" size={18} />
      <input value={key} onChange={(event) => setKey(event.target.value)} type="password" placeholder="ADMIN_API_KEY" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none" /></div>
      <button onClick={loadOrders} disabled={!key || loading} className={`${buttonClass} w-full bg-cyan-400 text-slate-950 sm:w-auto`}><RefreshCw className={loading ? "animate-spin" : ""} size={15} /> Refresh Pesanan</button>
    </div>
    {lastUpdated && <p className="mt-3 text-xs text-slate-500">Terakhir diperbarui: {lastUpdated.toLocaleTimeString("id-ID")}</p>}
    {message && <p role="status" className="mt-4 text-sm text-cyan-200">{message}</p>}
      {(orders.length > 0 || leads.length > 0) && <>
       <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[["Total pesanan", metrics?.totalOrders ?? recap.total, "text-white"], ["Belum dikerjakan", metrics?.newOrders ?? recap.pending, "text-slate-200"], ["Sedang dikerjakan", metrics?.inProgress ?? recap.inProgress, "text-violet-200"], ["Selesai", metrics?.completed ?? recap.completed, "text-emerald-200"], ["Lead chatbot", metrics?.chatbotLeads ?? leads.length, "text-cyan-200"], ["Pembayaran diterima", rupiah(metrics?.paidRevenue || 0), "text-emerald-200"]].map(([label, value, color]) => <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-5"><p className="text-sm text-slate-400">{label}</p><p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p></div>)}</div>
       <div className="mt-8 flex flex-wrap items-center gap-2"><span className="mr-1 text-sm text-slate-400">Filter:</span>{[["all", "Semua"], ["belum_dikerjakan", "Belum dikerjakan"], ["sedang_dikerjakan", "Sedang dikerjakan"], ["selesai", "Selesai"]].map(([value, label]) => <button key={value} onClick={() => setStatusFilter(value)} className={`${buttonClass} ${statusFilter === value ? "bg-cyan-400 text-slate-950" : "border border-white/10 bg-white/5 text-slate-300"}`}>{label}</button>)}</div>
       <label className="mt-4 flex max-w-xl items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-300"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari ID, nama, WhatsApp, email, atau project" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500" /></label>
       <section className="mt-6 flex flex-col gap-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5 sm:flex-row sm:items-center"><img src={qrisImage} alt="QRIS Synapse Core" className="h-40 w-40 rounded-lg bg-white object-contain p-1" /><div><h2 className="font-display text-lg font-semibold text-white">Pembayaran QRIS Manual</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">Customer membayar sesuai nominal tagihan dengan QRIS ini, lalu mengirim bukti pembayaran. Status pembayaran tetap menunggu sampai bukti diverifikasi admin.</p><p className="mt-3 text-xs text-cyan-200">QRIS statis aktif · Verifikasi pembayaran dilakukan manual.</p></div></section>
      <p className="mt-4 text-sm text-slate-500">Menampilkan {visibleOrders.length} dari {orders.length} pesanan.</p>
      <div className="mt-4 grid gap-5">{visibleOrders.map((order) => {
        const latestProof = order.proofs[0];
        return <article key={order.id} className="rounded-2xl border border-white/10 bg-ink-950/70 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row"><div className="min-w-0"><p className="flex flex-wrap items-center gap-2 font-semibold text-white"><span className="break-all">{order.id}</span> <span className={`rounded-full px-2 py-1 text-xs ${statusStyle[order.status] || "bg-white/10 text-slate-300"}`}>{order.status.replaceAll("_", " ")}</span></p><p className="mt-2 break-words text-sm text-slate-400">{order.customer.name || "-"} · {order.customer.phone || "-"}</p><p className="mt-1 break-words text-sm text-slate-500">{order.brief?.project || order.estimate?.platform || "Pesanan"} · {new Date(order.createdAt).toLocaleString("id-ID")}</p></div><div className="shrink-0 text-sm text-slate-300">{order.payment ? <><p>{rupiah(order.payment.amount)}</p><p className="text-xs text-slate-500">{paymentTypeLabel[order.payment.paymentType]} · {order.payment.status}</p></> : <p className="text-slate-500">Belum ada tagihan</p>}</div></div>
           {order.brief && <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm"><p className="font-medium text-slate-200">Detail pesanan</p><p className="mt-2 text-slate-400">Platform: {order.brief.platform} · Budget: {order.brief.budget} · Deadline: {order.brief.deadline}</p><p className="mt-2 whitespace-pre-wrap leading-relaxed text-slate-300">{order.brief.description}</p></div>}
           <InvoicePanel order={order} form={invoiceForms[order.id] || {}} onChange={(field, value) => updateInvoiceForm(order.id, field, value)} onSubmit={(paymentType) => createInvoice(order, paymentType)} />
           <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">{order.payment?.provider === "manual-qris" && <a href={`/api/payments/${order.payment.id}/qris`} target="_blank" rel="noreferrer" className={`${buttonClass} border border-cyan-400/40 text-cyan-200`}>Lihat QRIS</a>}<label className={`${buttonClass} cursor-pointer border border-cyan-400/40 text-cyan-200`}><FileUp size={15} /> Unggah bukti<input onChange={(event) => uploadProof(event, order)} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" /></label>
            {latestProof && <><span className="text-xs text-slate-400">{latestProof.originalName} — {latestProof.status}</span><button onClick={() => review(latestProof.id, true)} disabled={latestProof.status === "ACCEPTED"} className={`${buttonClass} bg-emerald-400/15 text-emerald-200`}><CheckCircle2 size={15} /> Setujui</button><button onClick={() => review(latestProof.id, false)} disabled={latestProof.status === "REJECTED"} className={`${buttonClass} bg-red-400/15 text-red-200`}><XCircle size={15} /> Tolak</button></>}</div>
          <div className="mt-3 flex flex-wrap items-center gap-2"><label className="text-xs text-slate-400" htmlFor={`status-${order.id}`}>Status pekerjaan</label><select id={`status-${order.id}`} disabled={order.status === "selesai"} value={["baru", "belum_dikerjakan", "sedang_dikerjakan", "selesai"].includes(order.status) ? order.status : "baru"} onChange={(event) => updateStatus(order.id, event.target.value)} className="rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50"><option value="baru">Baru</option><option value="belum_dikerjakan">Belum dikerjakan</option><option value="sedang_dikerjakan">Sedang dikerjakan</option><option value="selesai">Selesai</option></select>{order.status === "selesai" && <button onClick={() => reopenOrder(order.id)} className={`${buttonClass} border border-amber-400/40 text-amber-200`}>Buka kembali</button>}</div>
       </article>;
       })}{visibleOrders.length === 0 && <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-400">Tidak ada pesanan pada status ini.</p>}</div>
       <section className="mt-10"><div className="flex items-center gap-2"><Bot className="text-cyan-300" size={20} /><h2 className="font-display text-xl font-semibold text-white">Lead Chatbot & CRM</h2></div><p className="mt-2 text-sm text-slate-400">Kebutuhan terakhir dan paket yang diminati dari percakapan bot.</p><div className="mt-4 grid gap-4 md:grid-cols-2">{leads.map((lead) => <article key={lead.phone} className="rounded-xl border border-white/10 bg-white/5 p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-white">{lead.name || "Customer"}</p><p className="mt-1 text-sm text-slate-400">{lead.phone}</p></div>{lead.selectedPlan && <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-xs text-cyan-200">{lead.selectedPlan}</span>}</div><p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Kebutuhan terakhir</p><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{lead.needs.at(-1) || "Belum ada kebutuhan yang dicatat."}</p><p className="mt-4 text-xs text-slate-500">Diperbarui {new Date(lead.updatedAt).toLocaleString("id-ID")}</p></article>)}{leads.length === 0 && <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-400 md:col-span-2">Belum ada lead dari chatbot.</p>}</div></section>
     </>}
  </div></section>;
}

import { Globe, Smartphone, Monitor, Network, Server, Brain, Code2, Wrench } from "lucide-react";

export const services = [
  { title: "Web Development", description: "Company profile, landing page, dashboard admin, dan platform e-commerce yang cepat dan responsif.", icon: Globe, technologies: ["React", "Next.js", "Tailwind"] },
  { title: "Mobile Development", description: "Aplikasi Android dan iOS dengan UI intuitif, performa gesit, dan dukungan offline.", icon: Smartphone, technologies: ["Flutter", "React Native", "Kotlin"] },
  { title: "Desktop Application", description: "Aplikasi desktop untuk operasional internal, kasir offline, dan otomasi pekerjaan.", icon: Monitor, technologies: ["Electron", "JavaFX", "C#"] },
  { title: "Sistem Informasi", description: "Sistem akademik, inventaris, HRIS, hingga ERP yang terintegrasi dengan alur kerja Anda.", icon: Network, technologies: ["ERP", "CRM", "POS"] },
  { title: "Backend & API", description: "REST API, autentikasi, desain database, dan layer caching yang siap menangani banyak pengguna.", icon: Server, technologies: ["Node.js", "Go", "Laravel"] },
  { title: "AI & Machine Learning", description: "Integrasi LLM, model prediksi, klasifikasi dokumen/gambar, dan sistem rekomendasi.", icon: Brain, technologies: ["Python", "PyTorch", "OpenAI"] },
  { title: "Custom Software", description: "Perangkat lunak modular yang dirancang mengikuti model operasional unik organisasi Anda.", icon: Code2, technologies: ["Clean Arch", "Scalable", "Modular"] },
  { title: "Maintenance", description: "Perbaikan bug, optimasi performa, audit keamanan, deployment, dan pemantauan berkelanjutan.", icon: Wrench, technologies: ["DevOps", "CI/CD", "Security"] },
];

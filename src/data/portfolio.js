import { ShoppingCart, Smartphone, Monitor, Building2, GraduationCap, Brain, BarChart3, Calendar } from "lucide-react";

export const portfolioCategories = ["All", "Web", "Mobile", "Desktop", "Business", "Academic", "AI"];

// Contoh data — ganti dengan project asli Anda.
export const projects = [
  { id: 1, title: "Toko Online UMKM", description: "E-commerce dengan katalog, keranjang, dan pembayaran online.", categories: ["Web", "Business"], technologies: ["React", "Laravel", "MySQL"], status: "Live", icon: ShoppingCart, gradient: "from-purple-600/40 to-blue-600/30" },
  { id: 2, title: "Aplikasi Kasir Mobile", description: "POS Android dengan mode offline dan laporan harian.", categories: ["Mobile", "Business"], technologies: ["Flutter", "SQLite"], status: "Live", icon: Smartphone, gradient: "from-blue-600/40 to-cyan-500/30" },
  { id: 3, title: "Inventory Desktop", description: "Manajemen stok gudang multi-OS untuk operasional internal.", categories: ["Desktop", "Business"], technologies: ["Electron", "PostgreSQL"], status: "Delivered", icon: Monitor, gradient: "from-indigo-600/40 to-purple-600/30" },
  { id: 4, title: "Sistem Akademik Kampus", description: "Jadwal, nilai, dan presensi dengan peran dosen dan mahasiswa.", categories: ["Web", "Academic"], technologies: ["Spring Boot", "MySQL"], status: "Delivered", icon: Building2, gradient: "from-cyan-500/40 to-blue-600/30" },
  { id: 5, title: "Prototype Skripsi Presensi", description: "Prototype fungsional dengan dokumentasi dan diagram alur.", categories: ["Academic", "Mobile"], technologies: ["Kotlin", "REST API"], status: "Prototype", icon: GraduationCap, gradient: "from-pink-500/30 to-purple-600/30" },
  { id: 6, title: "Klasifikasi Dokumen AI", description: "Sistem klasifikasi dokumen otomatis berbasis machine learning.", categories: ["AI", "Web"], technologies: ["Python", "FastAPI", "PyTorch"], status: "Live", icon: Brain, gradient: "from-purple-600/40 to-pink-500/30" },
  { id: 7, title: "Dashboard Penjualan", description: "Dashboard analitik dengan grafik dan ekspor laporan.", categories: ["Web", "Business"], technologies: ["Next.js", "PostgreSQL"], status: "Live", icon: BarChart3, gradient: "from-blue-600/40 to-indigo-600/30" },
  { id: 8, title: "Sistem Booking Klinik", description: "Reservasi online, notifikasi pengingat, dan rekam kunjungan.", categories: ["Web", "Mobile", "Business"], technologies: ["React", "Node.js", "MongoDB"], status: "Delivered", icon: Calendar, gradient: "from-cyan-500/40 to-purple-600/30" },
];

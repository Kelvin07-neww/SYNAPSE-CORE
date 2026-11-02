import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Background from "./components/Background.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import PricingPage from "./pages/PricingPage.jsx";
import PortfolioPage from "./pages/PortfolioPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";

function ScrollToTop() {
  const { pathname, state } = useLocation();
  useEffect(() => {
    if (!state?.scrollTo) window.scrollTo(0, 0);
  }, [pathname, state]);
  return null;
}

export default function App() {
  return (
    <>
      <Background />
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

import { useLocation, useNavigate } from "react-router-dom";

// Smooth scroll jika sedang di Home, jika tidak pindah ke Home lalu scroll.
export default function useSectionNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (id) => {
    if (pathname === "/") {
      if (id === "home") window.scrollTo({ top: 0, behavior: "smooth" });
      else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { state: { scrollTo: id } });
    }
  };
}

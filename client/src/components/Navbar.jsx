import React from "react";
import favicon from "../assets/favicon.png";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const OWNER_EMAIL = "reservemyescape@gmail.com"; // 🔑 owner email

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotel", path: "/rooms" },
    { name: "Experience", path: "/feedback" },
    { name: "About", path: "/about" },
  ];

  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const { openSignIn } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();

  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const isOwner = user?.primaryEmailAddress?.emailAddress === OWNER_EMAIL;

  // ✅ Only redirect to /owner when on home page — allows back to site to work
  React.useEffect(() => {
    if (isOwner && location.pathname === '/') {
      navigate("/owner");
    }
  }, [isOwner, location.pathname]);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showWhiteNavbar = isScrolled || !isHomePage;

  return (
    <nav
      className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${
        showWhiteNavbar
          ? "bg-black shadow-md text-white backdrop-blur-lg py-3 md:py-0"
          : " py-4 md:py-6"
      }`}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <img
          src={favicon}
          alt="Hotel Icon"
          className="h-20 w-20 object-contain"
        />
        <span
          className={`text-3xl font-serif ${
            showWhiteNavbar ? "text-white" : "text-white"
          }`}
        >
          <u>RESERVE MY ESCAPE</u>
        </span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-4 lg:gap-8">
        {navLinks.map((link, i) => (
          <Link
            key={i}
            to={link.path}
            className={`group flex flex-col gap-0.5 ${
              showWhiteNavbar ? "text-white" : "text-white"
            }`}
          >
            {link.name}
            <div
              className={`${
                showWhiteNavbar ? "bg-gray-700" : "bg-black"
              } h-0.5 w-0 group-hover:w-full transition-all duration-300`}
            />
          </Link>
        ))}

        <Link to="/dashboard">
          <button
            className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer ${
              showWhiteNavbar ? "text-white" : "text-white"
            }`}
          >
            Dashboard
          </button>
        </Link>
      </div>

      {/* Desktop Right */}
      <div className="hidden md:flex items-center gap-4">
        <svg
          className={`h-6 w-6 transition-all duration-500 ${
            showWhiteNavbar ? "text-white" : "text-white"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        {user ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <button
            onClick={openSignIn}
            className={`px-8 py-2.5 rounded-full ml-4 transition-all duration-500 ${
              showWhiteNavbar
                ? "text-black bg-white"
                : "bg-white text-black"
            }`}
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3 md:hidden">
        <svg
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`h-6 w-6 cursor-pointer ${
            showWhiteNavbar ? "text-white" : "text-white"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="absolute top-4 right-4"
          onClick={() => setIsMenuOpen(false)}
        >
          ✕
        </button>

        {navLinks.map((link, i) => (
          <Link key={i} to={link.path} onClick={() => setIsMenuOpen(false)}>
            {link.name}
          </Link>
        ))}

        {user ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <button
            onClick={openSignIn}
            className="bg-black text-white px-8 py-2.5 rounded-full"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
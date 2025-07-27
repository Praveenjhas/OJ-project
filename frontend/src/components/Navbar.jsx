import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Problems", path: "/problems" },
    { label: "Discussion", path: "/discussion" },
    { label: "Ranks", path: "/ranks" },
    { label: "Contests", path: "/contests" },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-purple-700 text-white shadow-md px-6 md:px-12 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-2 text-white">
        <div className="bg-white text-blue-700 rounded-full p-1 text-xl font-extrabold">
          C
        </div>
        <span className="text-xl md:text-2xl font-bold tracking-wide">
          odeZone
        </span>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center space-x-8 font-medium text-white">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="hover:bg-white hover:text-blue-700 px-3 py-2 rounded-md transition duration-300"
          >
            {item.label}
          </Link>
        ))}
        <Link
          to="/login"
          className="bg-white text-blue-700 font-semibold px-4 py-2 rounded-md hover:shadow-md transition duration-300"
        >
          Sign in
        </Link>
      </div>

      {/* Mobile Hamburger */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="focus:outline-none text-white"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg z-50 py-4 px-6 md:hidden flex flex-col space-y-3 text-blue-700 font-medium">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="hover:text-purple-600"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/login"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center px-4 py-2 rounded-md"
          >
            Sign in
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

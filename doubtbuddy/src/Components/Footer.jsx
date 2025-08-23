import React from "react";
import { FaInstagram, FaTwitter, FaLinkedin, FaFacebook,FaCheckCircle } from "react-icons/fa";

function Footer() {
  return (
     <footer className="bg-blue-800 text-white py-10 mt-4 shadow">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* About / Features Section */}
        <div>
          <h2 className="text-xl font-semibold mb-3">About DoubtApp</h2>
          <p className="text-sm text-gray-200 leading-relaxed mb-4">
            DoubtApp connects students with verified teachers to solve queries instantly.
          </p>
          <ul className="space-y-2 text-sm">
            {[
              "Ask Doubts in Real-Time",
              "Verified Teachers",
              "Instant Notifications",
              "Easy to Use Interface",
            ].map((feature, i) => (
              <li key={i} className="flex items-center space-x-2">
                <FaCheckCircle className="text-green-400" size={14} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Advertisement Space */}
        <div className="flex justify-center items-center border border-dashed border-gray-300 rounded-lg h-32 w-full text-gray-300 hover:border-gray-400 transition">
          <span className="text-sm">Ad Space (Your Ad Here)</span>
        </div>

        {/* Social Links */}
        <div className="flex flex-col items-center md:items-end">
          <h2 className="text-xl font-semibold mb-3">Follow Us</h2>
          <div className="flex space-x-5">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <FaInstagram size={24} className="hover:text-pink-400 transition" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <FaTwitter size={24} className="hover:text-blue-400 transition" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              <FaLinkedin size={24} className="hover:text-blue-300 transition" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <FaFacebook size={24} className="hover:text-blue-500 transition" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} DoubtApp. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;

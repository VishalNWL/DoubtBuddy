import React from "react";
import { FaInstagram, FaTwitter, FaLinkedin, FaFacebook } from "react-icons/fa";

function Footer() {
  return (
    <footer className="w-full bg-blue-800 text-white py-6 mt-4 shadow-lg">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        {/* About / Features Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">About DoubtApp</h2>
          <p className="text-sm leading-relaxed">
            DoubtApp helps students connect with teachers to solve queries instantly. 
            <br />
            ✦ Ask Doubts in Real-Time <br />
            ✦ Verified Teachers <br />
            ✦ Instant Notifications <br />
            ✦ Easy to Use Interface
          </p>
        </div>

        {/* Advertisement Space */}
        <div className="flex justify-center items-center border border-dashed border-white rounded-lg h-28 w-full">
          <span className="text-sm text-gray-300">Ad Space (Your Ad Here)</span>
        </div>

        {/* Social Links */}
        <div className="flex flex-col items-center md:items-end">
          <h2 className="text-lg font-semibold mb-2">Follow Us</h2>
          <div className="flex space-x-4">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <FaInstagram size={24} className="hover:text-pink-500 transition" />
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
      <div className="mt-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} DoubtApp. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;

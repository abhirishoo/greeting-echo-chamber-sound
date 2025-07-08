
import React from "react";
import { useNavigate } from "react-router-dom";
import CircularText from "./CircularText";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full bg-white py-8 relative">
      <div className="section-container">
        <div className="flex flex-col items-center space-y-6">
          {/* Decorative circular text - fixed position, minimal and non-distracting */}
            <div className="absolute top-6 right-24 hidden lg:block opacity-40 z-50">
              <CircularText
                text="SWISHVIEW*GROWTH*TOOLS*"
                spinDuration={45}
                className="text-gray-500"
              />
            </div>


          <p className="text-center text-gray-600 text-sm font-display">
            Create. Upload. Go Viral! ❤
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <button
              onClick={() => navigate("/privacy-policy")}
              className="text-orange-500 hover:underline transition-colors font-display"
            >
              Privacy Policy
            </button>
            
            <button
              onClick={() => navigate("/terms-conditions")}
              className="text-orange-500 hover:underline transition-colors font-display"
            >
              Terms & Conditions
            </button>
            
            <button
              onClick={() => navigate("/refund-policy")}
              className="text-orange-500 hover:underline transition-colors font-display"
            >
              Cancellation & Refund
            </button>
            
            <button
              onClick={() => navigate("/shipping-policy")}
              className="text-orange-500 hover:underline transition-colors font-display"
            >
              Shipping & Delivery
            </button>
            
            <button
              onClick={() => navigate("/contact")}
              className="text-orange-500 hover:underline transition-colors font-display"
            >
              Contact Us
            </button>
            
            <button
              onClick={() => window.open("https://www.instagram.com/swish_view/", "_blank")}
              className="text-orange-500 hover:underline transition-colors font-display"
            >
              Socials
            </button>
          </div>

          {/* Copyright line */}
          <div className="text-center text-xs text-gray-500 font-display pt-4 border-t border-gray-200 w-full">
            © SwishView 2025
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

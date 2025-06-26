
import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full bg-white py-8">
      <div className="section-container">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-center text-gray-600 text-sm">
            Create. Upload. Go Viral! ❤
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <button
              onClick={() => navigate("/privacy-policy")}
              className="text-orange-500 hover:underline transition-colors"
            >
              Privacy Policy
            </button>
            
            <button
              onClick={() => navigate("/terms-conditions")}
              className="text-orange-500 hover:underline transition-colors"
            >
              Terms & Conditions
            </button>
            
            <button
              onClick={() => navigate("/refund-policy")}
              className="text-orange-500 hover:underline transition-colors"
            >
              Cancellation & Refund
            </button>
            
            <button
              onClick={() => navigate("/shipping-policy")}
              className="text-orange-500 hover:underline transition-colors"
            >
              Shipping & Delivery
            </button>
            
            <button
              onClick={() => navigate("/contact")}
              className="text-orange-500 hover:underline transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

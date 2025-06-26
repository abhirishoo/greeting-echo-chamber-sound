
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                SwishView is committed to protecting your privacy. We collect basic information like
                your name, email address, and YouTube channel details to provide our services. This
                data helps us deliver personalized support and improve your experience on our
                platform.
              </p>
              <p>
                We do not sell your data to third parties. All personal data is stored securely and used
                only for purposes related to your service. By using SwishView, you consent to this
                data usage.
              </p>
              <p>
                Contact:{" "}
                <a href="mailto:support@swishview.com" className="text-orange-500 hover:underline">
                  support@swishview.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

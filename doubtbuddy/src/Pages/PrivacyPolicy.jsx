import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        
        <h1 className="text-3xl font-bold text-purple-700 mb-6">
          Privacy Policy
        </h1>

        <p className="text-gray-600 mb-6">
          Your privacy is important to us. This Privacy Policy explains how we
          collect, use, and protect your information when you use our platform.
        </p>

        {/* Data Collection */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            1. Information We Collect
          </h2>
          <p className="text-gray-600">
            We collect basic information such as name, email, class, batch, and
            uploaded content (questions, answers, images, and videos).
          </p>
        </section>

        {/* Usage */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>To provide doubt-solving services.</li>
            <li>To track academic performance.</li>
            <li>To improve platform functionality.</li>
            <li>To ensure secure authentication and authorization.</li>
          </ul>
        </section>

        {/* Security */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            3. Data Security
          </h2>
          <p className="text-gray-600">
            We implement industry-standard security measures including JWT
            authentication and encrypted storage to protect your data.
          </p>
        </section>

        {/* Sharing */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            4. Data Sharing
          </h2>
          <p className="text-gray-600">
            We do not sell or share personal data with third parties except
            when required by law or school administration.
          </p>
        </section>

        {/* Rights */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            5. User Rights
          </h2>
          <p className="text-gray-600">
            Users may request data correction or deletion by contacting the
            school administrator.
          </p>
        </section>

        <div className="mt-8 p-5 bg-purple-50 rounded-lg">
          <p className="text-gray-700">
            Last Updated: {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
import React from "react";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">
          Help & Support
        </h1>

        <p className="text-gray-600 mb-8">
          Welcome to our Doubt Solving Platform. This page will guide you on
          how to use the platform effectively.
        </p>

        {/* Section 1 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            👩‍🎓 For Students
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Log in using your registered school credentials.</li>
            <li>Go to “Ask Doubt” and provide a clear title and description.</li>
            <li>You may upload images to explain your doubt better.</li>
            <li>Track the status of your question (Answered / Pending).</li>
            <li>Download your performance report from your profile page.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            👨‍🏫 For Teachers
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>Access assigned classes and batches.</li>
            <li>View student doubts filtered by subject.</li>
            <li>Provide answers in text, image, or video format.</li>
            <li>Monitor your answered question statistics.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            ⚙️ Technical Issues
          </h2>
          <p className="text-gray-600">
            If you experience login problems, upload failures, or performance
            issues, please contact your school administrator or email our
            support team.
          </p>
        </section>

        {/* Contact */}
        <div className="mt-10 p-5 bg-indigo-50 rounded-lg">
          <h3 className="font-semibold text-indigo-700 mb-2">
            Need Further Assistance?
          </h3>
          <p className="text-gray-700">
            Email us at: <span className="font-medium">support@yourplatform.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
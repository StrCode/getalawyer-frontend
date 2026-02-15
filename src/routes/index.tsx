import { createFileRoute, Link } from "@tanstack/react-router";
import { SEOHead } from "@/components/seo/SEOHead";
import { generateHomePageSEO } from "@/utils/seo";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const seoMetadata = generateHomePageSEO();

  return (
    <>
      <SEOHead metadata={seoMetadata} />
      <div className="bg-muted bg-gradient-to-b to-gray-50 min-h-screen">
        {/* <ComponentExample /> */}
        <div className="mx-auto px-4 py-16 max-w-6xl">
          <h1 className="mb-4 font-bold text-5xl text-center">
            Connect with Legal Professionals
          </h1>
          <p className="mb-12 text-gray-600 text-xl text-center">
            Whether you need legal help or provide legal services
          </p>

          <div className="gap-8 grid md:grid-cols-2 mx-auto max-w-4xl">
            {/* Client Card */}
            <div className="bg-white shadow-lg p-8 rounded-lg">
              <h2 className="mb-4 font-bold text-2xl">For Clients</h2>
              <p className="mb-6 text-gray-600">
                Find experienced lawyers for your legal needs
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-gray-700">
                  <span className="mr-2 text-green-600">✓</span>
                  Browse qualified lawyers
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="mr-2 text-green-600">✓</span>
                  Get free consultations
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="mr-2 text-green-600">✓</span>
                  Secure messaging
                </li>
              </ul>
              <Link
                to="/register"
                search={{ type: "client" }}
                className="block bg-blue-600 hover:bg-blue-700 py-3 rounded-lg w-full text-white text-center transition"
              >
                Sign Up as Client
              </Link>
            </div>

            {/* Lawyer Card */}
            <div className="bg-white shadow-lg p-8 rounded-lg">
              <h2 className="mb-4 font-bold text-2xl">For Lawyers</h2>
              <p className="mb-6 text-gray-600">
                Grow your practice and reach more clients
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-gray-700">
                  <span className="mr-2 text-green-600">✓</span>
                  Build your profile
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="mr-2 text-green-600">✓</span>
                  Manage cases efficiently
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="mr-2 text-green-600">✓</span>
                  Get client leads
                </li>
              </ul>

              <Link
                to="/register"
                search={{ type: "lawyer" }}
                className="block bg-blue-600 hover:bg-blue-700 py-3 rounded-lg w-full text-white text-center transition"
              >
                Sign Up as Lawyer
              </Link>
            </div>
          </div>

          {/* Already have an account */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

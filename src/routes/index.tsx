import { Link, createFileRoute } from "@tanstack/react-router";
import { ComponentExample } from "@/components/component-example";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b bg-muted to-gray-50">
      {/* <ComponentExample /> */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-4">
          Connect with Legal Professionals
        </h1>
        <p className="text-xl text-center text-gray-600 mb-12">
          Whether you need legal help or provide legal services
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Client Card */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">For Clients</h2>
            <p className="text-gray-600 mb-6">
              Find experienced lawyers for your legal needs
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-gray-700">
                <span className="text-green-600 mr-2">✓</span>
                Browse qualified lawyers
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-600 mr-2">✓</span>
                Get free consultations
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-600 mr-2">✓</span>
                Secure messaging
              </li>
            </ul>
            <Link
              to="/register"
              search={{ type: "client" }}
              className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Sign Up as Client
            </Link>
          </div>

          {/* Lawyer Card */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">For Lawyers</h2>
            <p className="text-gray-600 mb-6">
              Grow your practice and reach more clients
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-gray-700">
                <span className="text-green-600 mr-2">✓</span>
                Build your profile
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-600 mr-2">✓</span>
                Manage cases efficiently
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-600 mr-2">✓</span>
                Get client leads
              </li>
            </ul>

            <Link
              to="/register"
              search={{ type: "lawyer" }}
              className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Sign Up as Lawyer
            </Link>
          </div>
        </div>

        {/* Already have an account */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

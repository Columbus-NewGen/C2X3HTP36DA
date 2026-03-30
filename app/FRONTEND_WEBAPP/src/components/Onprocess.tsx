import { useNavigate } from "react-router-dom";

export default function OnprocessPage() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-white ">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
          🚧 On process
        </div>

        <h1 className="mt-4 text-3xl font-bold  text-gray-900">
          Coming Soon
        </h1>

        <p className="mt-3 text-base text-gray-600">
          This feature is under development. Please check back later.
        </p>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => nav(-1)}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Go back
          </button>

          <button
            onClick={() => nav("/app")}
            className="rounded-xl bg-lime-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-lime-600"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="mt-10 text-xs text-gray-400">
          GymMate CMS • Feature placeholder
        </div>
      </div>
    </div>
  );
}

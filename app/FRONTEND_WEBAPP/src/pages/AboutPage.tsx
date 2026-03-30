import { Github, Mail, Globe, ArrowUpRight } from "lucide-react";

/** Project info, stack, copyright, external links - moved from Footer per spec */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">About GymMate</h1>
      <p className="text-gray-600 mb-8">
        เพื่อนรู้ใจเรื่องฟิตเนส — แพลตฟอร์มที่ผสาน Gamification + Personalized
        Workout (ACSM) เพื่อช่วยให้คุณออกกำลังกายต่อเนื่องได้จริง
      </p>

      <section className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold text-gray-900">Project Info</h2>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
          <div className="text-sm font-bold text-gray-900">
            CMU • Computer Engineering
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Prototype for internal gym usage — Web CMS + Mobile App
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="text-sm font-bold text-gray-900">Stack & Modules</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {["Web CMS", "Mobile App", "Floorplan Editor", "Gamification", "Workout Planner"].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700"
                >
                  {t}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <a
          href="mailto:someone@example.com"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          <Mail className="h-4 w-4" />
          Contact
        </a>
        <a
          href="https://project.cpe.eng.cmu.ac.th/students/projectManage/984"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Globe className="h-4 w-4" />
          Project Page <ArrowUpRight className="h-4 w-4" />
        </a>
        <a
          href="https://github.com/orgs/GYM-MATE-492/repositories"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          <Github className="h-4 w-4" />
          GitHub
        </a>
      </div>

      <p className="mt-10 text-xs text-gray-500">
        © {new Date().getFullYear()} GymMate Project. All rights reserved.
      </p>
    </div>
  );
}

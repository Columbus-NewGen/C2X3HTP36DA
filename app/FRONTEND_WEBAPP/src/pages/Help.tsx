import React, { useState } from "react";
import {
  Book,
  MessageCircle,
  Zap,
  Shield,
  User,
  Weight,
  Map,
  Activity,
  Users,
  Layout,
  AlertCircle,
  CheckCircle2,
  Calendar,
  PlayCircle,
  Trophy,
  Settings,
  HelpCircle,
} from "lucide-react";

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  steps: {
    title: string;
    desc: string;
    icon?: React.ReactNode;
  }[];
  tips?: string[];
}

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState("trainee");

  const traineeGuides: GuideSection[] = [
    {
      id: "start",
      title: "การเริ่มต้นใช้งาน & ระบบ Gamification",
      icon: <Zap className="h-5 w-5" />,
      description: "ทำความรู้จักกับเลเวล, XP และขั้นตอนการตั้งค่าบัญชี",
      steps: [
        {
          title: "เลเวลและ XP",
          desc: "ทุกครั้งที่คุณบันทึกเซสชั่นการฝึก คุณจะได้รับ XP เพื่อเลื่อนระดับ (เช่น Silver, Gold, Platinum) และเข้าสู่ขั้นตอน 'Evolution' ที่สูงขึ้น",
          icon: <Trophy size={16} />,
        },
        {
          title: "ข้อมูลร่างกาย",
          desc: "อัปเดตน้ำหนักและเป้าหมายในหน้าโปรไฟล์ ระบบจะนำไปคำนวณ 'Muscle Balance' เพื่อบอกว่าคุณเน้นกล้ามเนื้อส่วนไหนมากเกินไป",
          icon: <Activity size={16} />,
        },
        {
          title: "สถานะการเป็นสมาชิก",
          desc: "ตรวจสอบวันหมดอายุและเทรนเนอร์ที่ดูแลคุณได้จากหน้าโปรไฟล์ เพื่อไม่ให้พลาดการติดตามผล",
          icon: <User size={16} />,
        },
      ],
      tips: [
        "รักษาระดับ 'Discipline Score' ให้สูงอยู่เสมอด้วยการมาตามตาราง เพื่อรับโบนัส XP พิเศษ",
      ],
    },
    {
      id: "workout",
      title: "การออกกำลังกายแบบ Personalized (ACSM Standard)",
      icon: <Weight className="h-5 w-5" />,
      description: "ขั้นตอนการใช้แอปในขณะที่อยู่ในยิมตามมาตรฐานการฝึก",
      steps: [
        {
          title: "เช็คตารางวันนี้ (Today)",
          desc: "ดูรายการท่าฝึกที่เทรนเนอร์จัดไว้ให้ (Assignment) ซึ่งออกแบบตามมาตรฐาน ACSM เพื่อความปลอดภัยและเห็นผลที่สุด",
          icon: <Calendar size={16} />,
        },
        {
          title: "บันทึกผลการฝึกแบบ Real-time",
          desc: "บันทึกจำนวนครั้ง (Reps) และน้ำหนักที่ยกได้ในแต่ละเซตทันที ระบบจะเก็บสถิติเพื่อคำนวณ PR (Personal Record)",
          icon: <CheckCircle2 size={16} />,
        },
        {
          title: "การใช้ Floorplan",
          desc: "หากหาเครื่องเล่นไม่เจอ สามารถเปิดแผนผังยิมเพื่อดูตำแหน่งที่ตั้งของเครื่องจักรได้ทันที",
          icon: <Map size={16} />,
        },
        {
          title: "แจ้งเครื่องเสีย",
          desc: "หากเครื่องเล่นชำรุด สามารถกด Report ในหน้ารายละเอียดเครื่องเพื่อแจ้งแอดมินยิมได้โดยตรง",
          icon: <AlertCircle size={16} />,
        },
      ],
    },
  ];

  const trainerGuides: GuideSection[] = [
    {
      id: "manage",
      title: "การจัดการสมาชิก & การจัดแผนฝึก (Training Management)",
      icon: <Users className="h-5 w-5" />,
      description: "เครื่องมือวิเคราะห์และดูแลสมาชิกแบบมืออาชีพ",
      steps: [
        {
          title: "Trainer Dashboard",
          desc: "ติดตามสถานะสมาชิกภายใต้การดูแลของคุณ ดูว่าใครขาดการซ้อม หรือใครที่ใกล้จะบรรลุเป้าหมาย",
          icon: <Layout size={16} />,
        },
        {
          title: "Assign & Personalize",
          desc: "สร้างโปรแกรมการฝึกที่เหมาะสมกับความต้องการเฉพาะบุคคล และส่งตรงไปยังหน้า 'Today' ของสมาชิก",
          icon: <Calendar size={16} />,
        },
        {
          title: "วิเคราะห์ Muscle Stats",
          desc: "ดูสถิติแยกตามกลุ่มกล้ามเนื้อของสมาชิก เพื่อปรับแผนการฝึกให้มีความสมดุลและปลอดภัย",
          icon: <Activity size={16} />,
        },
      ],
    },
  ];

  const adminGuides: GuideSection[] = [
    {
      id: "gym",
      title: "การจัดการระบบแบบศูนย์รวม (System Administration)",
      icon: <Shield className="h-5 w-5" />,
      description: "ครอบคลุมการจัดการคน เครื่องจักร และผังยิม",
      steps: [
        {
          title: "User & Role Management",
          desc: "จัดการสิทธิ์การเข้าถึงระบบ ตั้งแต่ Admin, Trainer ไปจนถึง Member ทั่วไป",
          icon: <Users size={16} />,
        },
        {
          title: "Machine Registry",
          desc: "เพิ่มเครื่องเล่นใหม่ลงในระบบ และอัปเดตสถานะการซ่อมบำรุงเพื่อให้สมาชิกทราบแบบ Real-time",
          icon: <Settings size={16} />,
        },
        {
          title: "Interactive Floorplan Editor",
          desc: "ปรับแต่งแผนผังยิม ลากวางตำแหน่งเครื่องจักรให้ตรงกับความจริง เพื่อความสะดวกในการใช้งานของทุกคน",
          icon: <Map size={16} />,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 pt-16 pb-12 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-500 text-white shadow-xl shadow-lime-500/20 mb-6">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900  mb-4">
            ศูนย์ช่วยเหลือ{" "}
            <span className="text-lime-600">คู่มือผู้ใช้งาน</span>
          </h1>
          <p className="text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            คู่มือการใช้งาน GYMMATE สำหรับสมาชิก (Trainee), เทรนเนอร์ (Trainer)
            และแอดมิน (Admin)
            รวมทุกอย่างที่คุณต้องรู้เพื่อเริ่มใช้งานได้อย่างมืออาชีพ
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* ── Role Selector ── */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {[
            {
              id: "trainee",
              label: "สำหรับสมาชิก",
              icon: <User size={16} key="user-icon" />,
            },
            {
              id: "trainer",
              label: "สำหรับเทรนเนอร์",
              icon: <Users size={16} key="users-icon" />,
            },
            {
              id: "admin",
              label: "สำหรับผู้จัดการยิม",
              icon: <Shield size={16} key="shield-icon" />,
            },
          ].map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveTab(role.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === role.id
                ? "bg-gray-900 text-white shadow-lg"
                : "bg-white text-gray-400 hover:text-gray-900 border border-gray-100"
                }`}
            >
              {role.icon}
              {role.label}
            </button>
          ))}
        </div>

        {/* ── Guide Content ── */}
        <div className="space-y-16">
          {(activeTab === "trainee"
            ? traineeGuides
            : activeTab === "trainer"
              ? trainerGuides
              : adminGuides
          ).map((section) => (
            <section
              key={section.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-lime-600">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                  <p className="text-sm text-gray-400 font-medium">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.steps.map((step, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-lime-200 transition-colors group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-lime-50 group-hover:text-lime-600 mb-4 transition-colors">
                      {step.icon}
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              {section.tips && (
                <div className="mt-8 p-6 rounded-3xl bg-lime-50 border border-lime-100 flex gap-4">
                  <Zap className="h-6 w-6 text-lime-500 shrink-0" />
                  <div>
                    <h5 className="font-bold text-lime-900 mb-1">
                      เคล็ดลับ (Tips)
                    </h5>
                    <ul className="list-disc list-inside space-y-1">
                      {section.tips.map((tip, tIdx) => (
                        <li key={tIdx} className="text-sm text-lime-800/80">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* ── Troubleshooting ── */}
        <div className="mt-24 p-12 rounded-[3.5rem] bg-gray-900 relative overflow-hidden text-center sm:text-left">
          <div className="absolute top-0 right-0 w-80 h-80 bg-lime-500/10 blur-[120px] -mr-40 -mt-40" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-xl font-bold text-white mb-4">
                พบบัญหากับเครื่องจักรในยิม?
              </h2>
              <p className="text-gray-400 leading-relaxed">
                หากคุณพบว่าเครื่องเล่นในยิมชำรุด หรือข้อมูลในหน้า Floorplan
                ไม่ถูกต้อง คุณสามารถกดแจ้งปัญหาที่ปุ่ม 'Report Machine'
                ในหน้ารายละเอียดของเครื่องนั้นๆ ได้ทันที
                เพื่อให้เจ้าหน้าที่ยิมเข้ามาดำเนินการแก้ไข
              </p>
            </div>
            <button className="shrink-0 h-14 px-8 rounded-2xl bg-lime-500 text-bold font-bold hover:bg-lime-400 transition-all flex items-center gap-2">
              <AlertCircle size={20} /> แจ้งปัญหาตอนนี้
            </button>
          </div>
        </div>

        {/* ── Video Guide (Dummy) ── */}
        <div className="mt-20 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            ยังไม่แน่ใจ? ดูวิดีโอคู่มือการใช้งาน
          </h3>
          <div className="max-w-3xl mx-auto aspect-video rounded-[3rem] bg-black/5 flex items-center justify-center border-4 border-white shadow-xl group cursor-pointer overflow-hidden relative">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 grayscale group-hover:scale-110 group-hover:opacity-60 transition-all"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48')",
              }}
            />
            <div className="h-20 w-20 rounded-full bg-white text-lime-500 shadow-2xl flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
              <PlayCircle size={40} fill="currentColor" stroke="none" />
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-10">
              <span className="text-white font-bold text-sm drop-shadow-md">
                GYMMATE User Guide (v1.2)
              </span>
              <span className="text-white/60 text-xs font-bold">4:20 MIN</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contact Footer ── */}
      <section className="mt-24 py-12 px-6 text-center border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-8">
          ยังต้องการข้อมูลเพิ่มเติม?
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-lime-600 transition-colors">
            <MessageCircle size={18} /> พูดคุยกับทีมงาน (Line @gymmate)
          </button>
          <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-lime-600 transition-colors">
            <Book size={18} /> คู่มือเชิงเทคนิค (Technical Docs)
          </button>
        </div>
      </section>
    </div>
  );
}

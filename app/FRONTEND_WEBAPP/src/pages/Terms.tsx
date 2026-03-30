import { FileText, Shield, User, Zap, AlertCircle } from "lucide-react";

export default function TermsPage() {
    const currentYear = new Date().getFullYear() + 543;

    return (
        <div className="min-h-screen bg-white pb-20 pt-20">
            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="mb-12 border-b border-gray-100 pb-8">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-500 text-white shadow-lg mb-6">
                        <FileText size={24} />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-4">
                        ข้อกำหนดการใช้งาน <span className="text-lime-600">(Terms of Service)</span>
                    </h1>
                    <p className="text-gray-500 font-medium">อัปเดตล่าสุด: มีนาคม {currentYear}</p>
                </div>

                <div className="space-y-12">
                    {/* Section 1: Agreement */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">1</div>
                            การยอมรับข้อตกลง
                        </h2>
                        <p className="text-gray-600 leading-relaxed italic">
                            "ยินดีต้อนรับสู่ GYMMATE - Your Fitness Buddy"
                        </p>
                        <p className="text-gray-600 leading-relaxed mt-4">
                            การเข้าใช้แพลตฟอร์ม GYMMATE (หน้าเว็บและระบบจัดการ)
                            หมายความว่าคุณตกลงที่จะผูกพันตามข้อกำหนดเหล่านี้
                            หากคุณไม่เห็นด้วยกับข้อกำหนดใดๆ เราขออภัยและขอให้คุณหยุดการใช้งานระบบทันที
                        </p>
                    </section>

                    {/* Section 2: User Responsibilities */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">2</div>
                            ความรับผิดชอบของผู้ใช้
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100">
                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-lime-600 mb-4 shadow-sm">
                                    <User size={20} />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">ข้อมูลบัญชี</h4>
                                <p className="text-sm text-gray-500">
                                    คุณมีหน้าที่รักษาความลับของชื่อผู้ใช้และรหัสผ่าน (seed admin/trainer/user)
                                    และรับผิดชอบต่อกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของคุณ
                                </p>
                            </div>
                            <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100">
                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-lime-600 mb-4 shadow-sm">
                                    <Zap size={20} />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">การใช้งานอย่างปลอดภัย</h4>
                                <p className="text-sm text-gray-500">
                                    การฝึกตามโปรแกรมที่ได้รับจากเทรนเนอร์หรือระบบ (ACSM Standard)
                                    ควรทำตามศักยภาพของร่างกายตนเอง
                                    ยิมและผู้พัฒนาแอปไม่รับผิดชอบต่อการบาดเจ็บที่เกิดจากการยกน้ำหนักเกินตัวหรือผิดท่า
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Gamification & Fair Play */}
                    <section className="p-8 rounded-[2.5rem] bg-lime-50 border border-lime-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-200/50 blur-3xl -mr-16 -mt-16" />
                        <h2 className="text-2xl font-bold text-lime-900 mb-6 flex items-center gap-3 relative z-10">
                            <Shield className="text-lime-600" /> ระบบ Gamification & Fair Play
                        </h2>
                        <ul className="space-y-4 relative z-10 text-lime-800/80 text-sm font-medium">
                            <li className="flex gap-3">
                                <div className="h-2 w-2 rounded-full bg-lime-500 mt-1.5 shrink-0" />
                                <span>ห้ามใช้โปรแกรมอัตโนมัติหรือการดัดแปลงข้อมูลเพื่อปั๊ม XP หรือคะแนนระเบียบวินัย (Discipline Score)</span>
                            </li>
                            <li className="flex gap-3">
                                <div className="h-2 w-2 rounded-full bg-lime-500 mt-1.5 shrink-0" />
                                <span>การเลื่อนระดับ (Evolution) และการรับเหรียญรางวัลเป็นรางวัลสำหรับความพยายามที่แท้จริง</span>
                            </li>
                            <li className="flex gap-3">
                                <div className="h-2 w-2 rounded-full bg-lime-500 mt-1.5 shrink-0" />
                                <span>กรณีพบการทุจริต ข้อมูลสถิติและลำดับใน Leaderboard อาจถูกรีเซ็ตโดยแอดมิน</span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 4: Equipment & Facility */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">3</div>
                            การใช้อุปกรณ์และสถานที่
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            สมาชิกควรตรวจสอบสถานะของเครื่องจักรในหน้า <strong>"Floorplan"</strong> หรือ
                            <strong> "Machines"</strong> ก่อนการเริ่มยก หากพบเครื่องที่มีป้าย
                            <span className="text-rose-500 font-bold italic"> "In Repair"</span>
                            ห้ามใช้งานโดยเด็ดขาดเพื่อความปลอดภัยของคุณเอง
                        </p>
                        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex gap-4">
                            <AlertCircle size={20} className="text-rose-500 shrink-0" />
                            <p className="text-xs text-rose-800 font-medium">
                                การทำลายทรัพย์สินของยิมหรือการจงใจทำให้เครื่องจักรเสียหายผ่านการใช้งานที่ผิดประเภท
                                อาจส่งผลให้ถูกระงับสมาชิกภาพและชดใช้ค่าเสียหายตามดุลยพินิจของแอดมินยิม
                            </p>
                        </div>
                    </section>

                    {/* Section 5: Termination */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">4</div>
                            การยกเลิกการใช้งาน
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            เราขอสงวนสิทธิ์ในการระงับหรือยกเลิกการเข้าถึงบัญชีของคุณได้ทันที
                            โดยไม่ต้องแจ้งให้ทราบล่วงหน้า
                            หากคุณละเมิดข้อกำหนดและเงื่อนไขเหล่านี้อย่างร้ายแรง
                        </p>
                    </section>
                </div>

                {/* Footer info */}
                <div className="mt-20 pt-12 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-400 font-medium">
                        มีคำถามเกี่ยวกับข้อกำหนด? ติดต่อเราได้ที่ห้อง Admin (CPE Chiang Mai University)
                    </p>
                </div>
            </div>
        </div>
    );
}

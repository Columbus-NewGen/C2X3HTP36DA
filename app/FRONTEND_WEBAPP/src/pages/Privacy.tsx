export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-12 bg-white min-h-screen">
      <div className="border-b border-gray-100 pb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-2">
          นโยบายความเป็นส่วนตัว <span className="text-lime-600">(Privacy Policy)</span>
        </h1>
        <p className="text-gray-400 font-medium">คุ้มครองข้อมูลของคุณเพื่อประสบการณ์ฟิตเนสที่ดีที่สุด</p>
      </div>

      <div className="grid grid-cols-1 gap-10">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="h-8 w-1 bg-lime-500 rounded-full" />
            ข้อมูลประเภทใดที่เราจัดเก็บ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">ข้อมูลยืนยันตัวตน</h4>
              <p className="text-sm text-gray-500">อีเมล (Email), ชื่อที่ใช้ในระบบ (Profile Name) และรูปภาพโปรไฟล์ของคุณ</p>
            </div>
            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">ข้อมูลสุขภาพและการออกกำลังกาย</h4>
              <p className="text-sm text-gray-500">บันทึกน้ำหนักตัว (Weight Logs), สถิติรายท่า (PR), จำนวนครั้งและน้ำหนักที่ยก (Sets/Reps) และดัชนี Muscle Balance</p>
            </div>
            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">ข้อมูลความก้าวหน้า (Gamification)</h4>
              <p className="text-sm text-gray-500">ประวัติการได้รับ XP, ระดับเลเวล (Silver, Gold, etc.) และขั้นตอนการวิวัฒนาการ (Evolution States)</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="h-8 w-1 bg-lime-500 rounded-full" />
            เรานำข้อมูลไปใช้อย่างไร?
          </h2>
          <ul className="list-none space-y-3 text-gray-600">
            <li className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-lime-500 mt-2 shrink-0" />
              <span>ใช้เพื่อวิเคราะห์สมรรถภาพทางกายและแสดงผลความคืบหน้าในรูปแบบกราฟ</span>
            </li>
            <li className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-lime-500 mt-2 shrink-0" />
              <span>ใช้เพื่อให้เทรนเนอร์ที่คุณเลือกสามารถออกแบบโปรแกรมการฝึกที่ปลอดภัยและเหมาะสม (Personalized Course)</span>
            </li>
            <li className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-lime-500 mt-2 shrink-0" />
              <span>ใช้เพื่อคำนวณอันดับใน Leaderboard และการปลดล็อกความสำเร็จต่างๆ</span>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="h-8 w-1 bg-lime-500 rounded-full" />
            การแชร์ข้อมูลและความปลอดภัย
          </h2>
          <p className="text-gray-600 leading-relaxed">
            ระบบ GYMMATE จะเปิดเผยข้อมูลการฝึกของคุณ **เฉพาะกับเทรนเนอร์ที่ดูแลคุณและแอดมินยิมเท่านั้น**
            เพื่อใช้ในการปรับปรุงบริการ เราจะไม่ขายข้อมูลส่วนบุคคลของคุณให้กับบุคคลที่สามภายใต้เงื่อนไขใดๆ
            ข้อมูลทั้งหมดถูกจัดเก็บอย่างปลอดภัยด้วยมาตรฐานการเข้ารหัสล่าสุด
          </p>
        </section>

        <section className="p-8 rounded-[2.5rem] bg-gray-900 text-white">
          <h2 className="text-xl font-bold mb-4">สิทธิในข้อมูลของคุณ</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            คุณมีสิทธิ์ในการเข้าถึง แก้ไข หรือร้องขอให้ลบข้อมูลส่วนบุคคลของคุณออกจากระบบได้ตลอดเวลา
            โดยการติดต่อผ่านแอดมินที่ห้อง CPE Chiang Mai University หรือติดต่อผ่าน Line @gymmate
          </p>
        </section>
      </div>
    </div>
  );
}

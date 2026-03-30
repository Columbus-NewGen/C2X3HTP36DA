import React from "react";
import { Outlet } from "react-router-dom";
// outlet เอาไว้ใช้สำหรับแยกส่วนของ layout กับ content ออกจากกัน
// โดยที่ outlet จะเป็นตัวแทนของ content ที่จะถูกแทรกเข้ามาใน layout นั้น ๆ

export default function StandaloneLayout(): React.ReactElement {
  return (
    <div className="min-h-dvh bg-white text-bold flex flex-col">
      <main className="flex-1 min-h-0 p-6">
        <Outlet />
      </main>
    </div>
  );
}

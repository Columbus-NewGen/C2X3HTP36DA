# Types Documentation

## มาตรฐานการจัดการ Types สำหรับ GYMMate WebApp

เอกสารนี้อธิบายมาตรฐานและแนวทางการจัดการ TypeScript types ในโปรเจค GYMMate เพื่อให้ AI Agent และนักพัฒนาใช้งานได้อย่างถูกต้อง

---

## 📁 โครงสร้างไฟล์ Types

### Core Types (ไฟล์หลักที่ใช้บ่อย)

1. **`common.types.ts`** - Types ที่ใช้ร่วมกันทุก module

   - `MachineStatus`: `"ACTIVE" | "MAINTENANCE"`
   - `Role`: `"root" | "admin" | "trainer" | "user"`

2. **`auth.types.ts`** - Types สำหรับ Authentication และ User Management

   - `User`: ข้อมูลผู้ใช้
   - `LoginRequest`, `LoginResponse`: ระบบล็อกอิน
   - `RegisterRequest`, `RegisterResponse`: ระบบสมัครสมาชิก
   - `AuthState`, `AuthContextValue`: State และ Context สำหรับ Auth

3. **`equipment.types.ts`** - Types สำหรับ Equipment และ Machine

   - `Equipment`: อุปกรณ์ในโรงยิม
   - `Machine`: เครื่องจักรที่อยู่ใน floorplan
   - `CreateMachineRequest`, `UpdateMachineRequest`: Request types สำหรับ Machine
   - `UpdateStatusRequest`: อัปเดตสถานะ

4. **`floorplan.types.ts`** - Types สำหรับ Floorplan (รวม API types และ Frontend types)

   - **API Types:**
     - `Floorplan`: ข้อมูล floorplan
     - `Wall`: กำแพงใน floorplan
     - `CreateFloorplanRequest`, `UpdateFloorplanRequest`: Request types สำหรับ Floorplan
     - `CreateWallRequest`, `UpdateWallRequest`: Request types สำหรับ Wall
   - **Frontend Types:**
     - `FloorSettings`: การตั้งค่า floorplan editor
     - `MachineFormData`, `WallFormData`: Form data สำหรับ editor
     - `HistoryAction`: สำหรับ undo/redo
     - `PanOffset`, `DragOffset`: สำหรับ canvas interactions
     - `SelectedItem`, `HoveredItem`: สำหรับ selection state
     - `FloorplanFilters`: สำหรับ filtering
     - `StatusColorConfig`: สำหรับ UI styling
     - `StatItem`: สำหรับแสดงสถิติ

5. **`program.types.ts`** - Types สำหรับ Training Programs
   - `Program`: โปรแกรมการออกกำลังกาย

### Barrel File (สำหรับ backward compatibility)

- **`api.types.ts`** - Barrel file ที่ re-export types ทั้งหมด (⚠️ deprecated - ใช้เฉพาะไฟล์เฉพาะแทน)

### Page-Specific Types (types เฉพาะหน้าที่ไม่เกี่ยวข้องกับ API)

- **`dashboard.types.ts`** - Types สำหรับ Dashboard page
- **`landing.types.ts`** - Types สำหรับ Landing page

---

## 🎯 หลักการออกแบบ Types

### 1. การแบ่งไฟล์ตาม Domain/Module

✅ **DO:**

- แยกไฟล์ตาม domain/module (auth, equipment, floorplan, program)
- ใช้ไฟล์ `common.types.ts` สำหรับ types ที่ใช้ร่วมกัน
- รวม API types และ Frontend types ของ module เดียวกันไว้ในไฟล์เดียวกัน (เช่น `floorplan.types.ts`)

❌ **DON'T:**

- ไม่แยกไฟล์ย่อยเกินไป (เช่น `floorplan-api.types.ts` + `floorplan-frontend.types.ts`)
- ไม่ใส่ types ที่ไม่เกี่ยวข้องกันในไฟล์เดียว
- ไม่สร้าง types ซ้ำซ้อน

### 2. การตั้งชื่อ Types

**API Types (ตรงกับ Backend):**

- ใช้ชื่อเดียวกับ Backend: `Floorplan`, `Machine`, `Wall`
- Request types: `Create{Entity}Request`, `Update{Entity}Request`
- Response types: ไม่ต้องสร้างแยก (ใช้ entity type โดยตรง)

**Frontend Types:**

- ใช้ชื่อที่ชัดเจน: `FloorSettings`, `MachineFormData`
- State types: `{Entity}State`, `{Entity}ContextValue`
- Utility types: `PanOffset`, `DragOffset`, `SelectedItem`

### 3. การ Import และ Re-export

✅ **DO:**

```typescript
// Import types ที่ต้องใช้ในไฟล์นี้
import type { Machine } from "./equipment.types";
import type { MachineStatus } from "./common.types";

// Re-export types ที่เกี่ยวข้องสำหรับ convenience
export type { Machine, Equipment } from "./equipment.types";
export type { MachineStatus } from "./common.types";
```

❌ **DON'T:**

```typescript
// ไม่ re-export ทุกอย่างโดยไม่จำเป็น
export type * from "./equipment.types";

// ไม่ import types ที่ไม่ใช้
import type {
  Machine,
  Equipment,
  CreateMachineRequest,
} from "./equipment.types";
// ถ้าไม่ใช้ CreateMachineRequest ในไฟล์นี้ อย่า import
```

### 4. การใช้ Types

**สำหรับ Services/API:**

```typescript
// ✅ DO: Import จากไฟล์เฉพาะ
import type {
  Floorplan,
  CreateFloorplanRequest,
} from "../types/floorplan.types";
import type { Machine } from "../types/equipment.types";
import type { MachineStatus } from "../types/common.types";

// ❌ DON'T: ใช้ api.types.ts (deprecated)
import type { Floorplan } from "../types/api.types";
```

**สำหรับ Components/Pages:**

```typescript
// ✅ DO: Import จากไฟล์เฉพาะ หรือ floorplan.types.ts (ถ้ามี frontend types)
import type {
  Floorplan,
  FloorSettings,
  MachineFormData,
} from "../../types/floorplan.types";
import type { Machine } from "../../types/equipment.types";
```

### 5. การจัดการ UI-Specific Fields

Types ที่มาจาก API แต่มี fields เพิ่มเติมสำหรับ UI:

```typescript
export interface Machine {
  // ... API fields
  equipment?: Equipment;

  // UI-specific optional fields (ระบุ comment)
  images?: { url: string }[];
  number?: string;
}
```

---

## 📋 Checklist สำหรับ AI Agent

เมื่อต้องสร้างหรือแก้ไข types:

- [ ] ตรวจสอบว่า types นี้อยู่ใน module ไหน
- [ ] ตรวจสอบว่ามี types ซ้ำซ้อนหรือไม่
- [ ] ถ้าเป็น API type → ใช้ชื่อเดียวกับ Backend
- [ ] ถ้าเป็น Frontend type → ตั้งชื่อให้ชัดเจน
- [ ] Import types ที่จำเป็นเท่านั้น
- [ ] Re-export types ที่เกี่ยวข้องสำหรับ convenience
- [ ] ใช้ `common.types.ts` สำหรับ types ที่ใช้ร่วมกัน
- [ ] ใช้ไฟล์เฉพาะแทน `api.types.ts` (deprecated)
- [ ] ไม่แยกไฟล์ย่อยเกินไป (รวม API + Frontend types ในไฟล์เดียวกัน)
- [ ] ตรวจสอบว่า build ผ่าน (run `npm run build`)

---

## 🔍 ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: สร้าง Service ใหม่

```typescript
// src/services/FloorplanAPI.ts
import axiosClient from "./AxiosClient";
import type {
  Floorplan,
  CreateFloorplanRequest,
  UpdateFloorplanRequest,
} from "../types/floorplan.types"; // ✅ ใช้ไฟล์เฉพาะ

export const floorplanApi = {
  async getById(id: string | number): Promise<Floorplan> {
    // ...
  },
};
```

### ตัวอย่างที่ 2: สร้าง Component ที่ใช้ Floorplan

```typescript
// src/components/Floorplan/EditorCanvas.tsx
import type {
  Floorplan,
  Wall,
  Machine,
  FloorSettings, // Frontend type
  MachineFormData, // Frontend type
} from "../../types/floorplan.types"; // ✅ ใช้ไฟล์เดียวที่มีทั้ง API และ Frontend types
```

### ตัวอย่างที่ 3: เพิ่ม Type ใหม่

```typescript
// ถ้าเป็น API type → เพิ่มใน equipment.types.ts
export interface NewEquipmentRequest {
  name: string;
  type: string;
}

// ถ้าเป็น Frontend type → เพิ่มใน floorplan.types.ts (ถ้าเกี่ยวกับ floorplan)
export interface NewFloorplanUIState {
  isEditing: boolean;
  selectedTool: string;
}
```

---

## ⚠️ ข้อควรระวัง

1. **อย่าแก้ไข API types โดยไม่ตรวจสอบ Backend** - API types ต้องตรงกับ Backend response
2. **อย่า import จาก `api.types.ts`** - ใช้ไฟล์เฉพาะแทน (api.types.ts เป็น deprecated barrel file)
3. **อย่าแยกไฟล์ย่อยเกินไป** - รวม API + Frontend types ในไฟล์เดียวกันตาม module
4. **อย่าลืม import types ที่ต้องใช้** - ถ้า interface ใช้ type อื่น ต้อง import มา
5. **ตรวจสอบ build เสมอ** - run `npm run build` หลังแก้ไข types

---

## 📚 References

- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Project Structure: `src/types/`
- API Endpoints: `src/services/`

---

**Last Updated:** 2026-01-09  
**Maintained by:** AI Agent (Auto)

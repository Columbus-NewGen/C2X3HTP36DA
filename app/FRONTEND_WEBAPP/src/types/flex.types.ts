/**
 * Flex / Equipment Substitution Types
 * Dedicated types for equipment-level substitution logic.
 */

import type { Equipment as BaseEquipment } from "./equipment.types";

export interface Equipment extends Pick<BaseEquipment, "id" | "equipment_name" | "equipment_type" | "status"> {}

export interface EquipmentSubstitution {
  id: number;
  original_equipment: Equipment;
  substitute_equipment: Equipment;
  similarity_score: number;
  reason: string;
  created_at: string;
}


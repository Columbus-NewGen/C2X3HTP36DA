BEGIN;

-- Reverse: Rename table back
ALTER TABLE equipment_instances RENAME TO floorplan_machines;

-- Reverse: Rename sequence
ALTER SEQUENCE equipment_instances_id_seq RENAME TO floorplan_machines_id_seq;

-- Reverse: Rename primary key constraint
ALTER INDEX equipment_instances_pkey RENAME TO floorplan_machines_pkey;

-- Reverse: Rename indexes
ALTER INDEX idx_equipment_instances_floorplan_id RENAME TO idx_floorplan_machines_floorplan_id;
ALTER INDEX idx_equipment_instances_equipment_id RENAME TO idx_floorplan_machines_equipment_id;
ALTER INDEX idx_equipment_instances_deleted_at RENAME TO idx_floorplan_machines_deleted_at;

-- Reverse: Rename constraints
ALTER TABLE floorplan_machines DROP CONSTRAINT fk_equipment_instances_floorplan;
ALTER TABLE floorplan_machines DROP CONSTRAINT fk_equipment_instances_equipment;

ALTER TABLE floorplan_machines
    ADD CONSTRAINT fk_floorplan_machines_floorplan
    FOREIGN KEY (floorplan_id) REFERENCES floorplans(id) ON DELETE CASCADE;

ALTER TABLE floorplan_machines
    ADD CONSTRAINT fk_floorplan_machines_equipment
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT;

COMMIT;

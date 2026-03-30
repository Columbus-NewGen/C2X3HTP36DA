BEGIN;

-- Rename table
ALTER TABLE floorplan_machines RENAME TO equipment_instances;

-- Rename sequence
ALTER SEQUENCE floorplan_machines_id_seq RENAME TO equipment_instances_id_seq;

-- Rename primary key constraint
ALTER INDEX floorplan_machines_pkey RENAME TO equipment_instances_pkey;

-- Rename indexes
ALTER INDEX idx_floorplan_machines_floorplan_id RENAME TO idx_equipment_instances_floorplan_id;
ALTER INDEX idx_floorplan_machines_equipment_id RENAME TO idx_equipment_instances_equipment_id;
ALTER INDEX idx_floorplan_machines_deleted_at RENAME TO idx_equipment_instances_deleted_at;

-- Rename foreign key constraints
ALTER TABLE equipment_instances DROP CONSTRAINT fk_floorplan_machines_floorplan;
ALTER TABLE equipment_instances DROP CONSTRAINT fk_floorplan_machines_equipment;

ALTER TABLE equipment_instances
    ADD CONSTRAINT fk_equipment_instances_floorplan
    FOREIGN KEY (floorplan_id) REFERENCES floorplans(id) ON DELETE CASCADE;

ALTER TABLE equipment_instances
    ADD CONSTRAINT fk_equipment_instances_equipment
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT;

COMMIT;

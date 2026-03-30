-- ============================================
-- Migration: 008_seed_primitive_data
-- Description: Seed primitive reference data (muscles, muscle groups, equipment)
-- Created: 2026-02-20
-- ============================================

BEGIN;

-- ============================================
-- SECTION 1: Muscles (22 rows)
-- ============================================

INSERT INTO muscles (muscle_name, scientific_name, body_region, function) VALUES
    -- Chest
    ('Pectoralis Major', 'Pectoralis major', 'chest', 'การงอ การหุบ และการหมุนเข้าด้านในของกระดูกต้นแขน'),
    ('Pectoralis Minor', 'Pectoralis minor', 'chest', 'ช่วยพยุงกระดูกสะบัก'),
    -- Back
    ('Latissimus Dorsi', 'Latissimus dorsi', 'back', 'การเหยียด การหุบ และการหมุนเข้าด้านในของหัวไหล่'),
    ('Trapezius', 'Trapezius', 'back', 'ยก ดึงกลับ และหมุนกระดูกสะบัก'),
    ('Rhomboids', 'Rhomboideus', 'back', 'ดึงกลับและยกกระดูกสะบัก'),
    ('Erector Spinae', 'Erector spinae', 'back', 'เหยียดและงอข้างของกระดูกสันหลัง'),
    -- Shoulders
    ('Anterior Deltoid', 'Deltoideus anterior', 'shoulders', 'การงอและการหมุนเข้าด้านในของแขน'),
    ('Lateral Deltoid', 'Deltoideus lateralis', 'shoulders', 'การกางแขนออกด้านข้าง'),
    ('Posterior Deltoid', 'Deltoideus posterior', 'shoulders', 'การเหยียดและการหมุนออกด้านนอกของแขน'),
    -- Arms
    ('Biceps Brachii', 'Biceps brachii', 'arms', 'การงอข้อศอกและการหมุนฝ่ามือขึ้น'),
    ('Triceps Brachii', 'Triceps brachii', 'arms', 'การเหยียดข้อศอก'),
    ('Brachialis', 'Brachialis', 'arms', 'การงอข้อศอก'),
    ('Forearm Flexors', 'Flexor group', 'arms', 'การงอข้อมือและนิ้วมือ'),
    ('Forearm Extensors', 'Extensor group', 'arms', 'การเหยียดข้อมือและนิ้วมือ'),
    -- Legs
    ('Quadriceps', 'Quadriceps femoris', 'legs', 'การเหยียดเข่า'),
    ('Hamstrings', 'Hamstring group', 'legs', 'การงอเข่าและการเหยียดสะโพก'),
    ('Glutes', 'Gluteus maximus', 'legs', 'การเหยียดและการหมุนออกด้านนอกของสะโพก'),
    ('Calves', 'Gastrocnemius and Soleus', 'legs', 'การกระดกปลายเท้าลง'),
    ('Adductors', 'Adductor group', 'legs', 'การหุบขาเข้าด้านใน'),
    -- Core
    ('Rectus Abdominis', 'Rectus abdominis', 'core', 'การงอกระดูกสันหลังส่วนล่าง'),
    ('Obliques', 'Obliquus externus and internus', 'core', 'การหมุนและการงอข้างของลำตัว'),
    ('Transverse Abdominis', 'Transversus abdominis', 'core', 'การรัดและพยุงช่องท้อง')
ON CONFLICT (muscle_name) DO NOTHING;

-- ============================================
-- SECTION 2: Muscle Groups (6 rows)
-- ============================================

INSERT INTO muscle_groups (group_name, split_category) VALUES
    ('Chest', 'Push'),
    ('Back', 'Pull'),
    ('Shoulders', 'Push'),
    ('Arms', 'Push'),
    ('Legs', 'Legs'),
    ('Core', 'Upper')
ON CONFLICT (group_name) DO NOTHING;

-- ============================================
-- SECTION 3: Muscle Group Members (22 mappings)
-- ============================================

INSERT INTO muscle_group_members (muscle_id, group_id)
SELECT m.id, g.id
FROM (VALUES
    ('Pectoralis Major', 'Chest'),
    ('Pectoralis Minor', 'Chest'),
    ('Latissimus Dorsi', 'Back'),
    ('Trapezius', 'Back'),
    ('Rhomboids', 'Back'),
    ('Erector Spinae', 'Back'),
    ('Anterior Deltoid', 'Shoulders'),
    ('Lateral Deltoid', 'Shoulders'),
    ('Posterior Deltoid', 'Shoulders'),
    ('Biceps Brachii', 'Arms'),
    ('Triceps Brachii', 'Arms'),
    ('Brachialis', 'Arms'),
    ('Forearm Flexors', 'Arms'),
    ('Forearm Extensors', 'Arms'),
    ('Quadriceps', 'Legs'),
    ('Hamstrings', 'Legs'),
    ('Glutes', 'Legs'),
    ('Calves', 'Legs'),
    ('Adductors', 'Legs'),
    ('Rectus Abdominis', 'Core'),
    ('Obliques', 'Core'),
    ('Transverse Abdominis', 'Core')
) AS v(muscle_name, group_name)
JOIN muscles m ON m.muscle_name = v.muscle_name AND m.deleted_at IS NULL
JOIN muscle_groups g ON g.group_name = v.group_name AND g.deleted_at IS NULL
WHERE NOT EXISTS (
    SELECT 1 FROM muscle_group_members mgm
    WHERE mgm.muscle_id = m.id AND mgm.group_id = g.id
);

-- ============================================
-- SECTION 4: Equipment (47 rows)
-- ============================================

INSERT INTO equipment (equipment_name, equipment_type, description, status) VALUES
    ('Aerobic fitness area gym', 'area', 'พื้นที่โล่งสำหรับแอโรบิกและออกกำลังกายเป็นกลุ่ม', 'ACTIVE'),
    ('Assisted Pull Up Machine', 'machine', 'เครื่องช่วย pull-up และ dip แบบถ่วงน้ำหนัก', 'ACTIVE'),
    ('Barbell Rack', 'free_weight', 'ชั้นวาง barbell และแผ่นน้ำหนัก', 'ACTIVE'),
    ('Bench', 'free_weight', 'ม้านั่งปรับองศาได้สำหรับท่า free weight', 'ACTIVE'),
    ('Cable Chest Fly', 'cable', 'สถานี cable สำหรับท่า chest fly', 'ACTIVE'),
    ('Cable Crossover Machine', 'cable', 'เครื่อง cable คู่สำหรับท่า chest fly และ crossover', 'ACTIVE'),
    ('Captain Chair Abs Station', 'bodyweight', 'เก้าอี้ captain สำหรับท่า hanging leg raise และ knee tuck', 'ACTIVE'),
    ('Cardio zone gym', 'area', 'โซนเฉพาะสำหรับอุปกรณ์คาร์ดิโอ', 'ACTIVE'),
    ('Chest Press Machine', 'machine', 'เครื่อง chest press แบบใช้แผ่นหรือ selectorized', 'ACTIVE'),
    ('Curve Treadmill', 'machine', 'ลู่วิ่งโค้งแบบแมนนวล', 'ACTIVE'),
    ('Dual Lat Machine', 'machine', 'เครื่อง lat pulldown อิสระสองแขน', 'ACTIVE'),
    ('Dumbbell Rack', 'free_weight', 'ชั้นวาง dumbbell', 'ACTIVE'),
    ('EZ Curl Bar Rack', 'free_weight', 'ชั้นวาง EZ curl bar', 'ACTIVE'),
    ('Flat Barbell Bench Press Station', 'machine', 'สถานี bench press แนวราบ', 'ACTIVE'),
    ('Gym locker', 'facility', 'ตู้ล็อกเกอร์สำหรับเก็บของสมาชิก', 'ACTIVE'),
    ('Gym reception counter', 'facility', 'เคาน์เตอร์ต้อนรับส่วนหน้าของฟิตเนส', 'ACTIVE'),
    ('Gym vending machine', 'facility', 'ตู้ขายของอัตโนมัติสำหรับอาหารและอาหารเสริม', 'ACTIVE'),
    ('Hip Abductor Machine', 'machine', 'เครื่อง isolate กล้ามเนื้อกางสะโพก', 'ACTIVE'),
    ('Hip Adductor Machine', 'machine', 'เครื่อง isolate กล้ามเนื้อหุบสะโพก', 'ACTIVE'),
    ('Incline Barbell Bench Press Station', 'machine', 'สถานี bench press แบบเอียงขึ้น', 'ACTIVE'),
    ('Incline Chest Press Machine', 'machine', 'เครื่อง chest press แบบเอียงเน้นหน้าอกบน', 'ACTIVE'),
    ('Lat Pull', 'machine', 'เครื่อง lat pull สำหรับการดึงแนวตั้ง', 'ACTIVE'),
    ('Lat Pulldown Machine', 'machine', 'เครื่อง cable สำหรับท่า lat pulldown', 'ACTIVE'),
    ('Lateral Raise Machine', 'machine', 'เครื่อง isolate การกางไหล่ด้านข้าง', 'ACTIVE'),
    ('Leg Curl Machine', 'machine', 'เครื่อง isolate กล้ามเนื้อ hamstring', 'ACTIVE'),
    ('Leg Extension Machine', 'machine', 'เครื่อง isolate กล้ามเนื้อ quadriceps', 'ACTIVE'),
    ('Lying Leg Curl Machine', 'machine', 'เครื่อง leg curl แบบนอนคว่ำ', 'ACTIVE'),
    ('Olympic Lifting Platform', 'free_weight', 'แพลตฟอร์มสำหรับ Olympic lifting', 'ACTIVE'),
    ('Pec Deck Fly', 'machine', 'เครื่อง pec deck สำหรับ isolate หน้าอก', 'ACTIVE'),
    ('Preacher Curl Machine', 'machine', 'เครื่องสำหรับท่า preacher curl', 'ACTIVE'),
    ('Roman Chair', 'bodyweight', 'Roman chair สำหรับท่า back extension และ core', 'ACTIVE'),
    ('Row Machine', 'machine', 'เครื่อง rowing สำหรับกล้ามเนื้อหลัง', 'ACTIVE'),
    ('Rowing Machine', 'machine', 'เครื่อง rowing ในร่มสำหรับคาร์ดิโอ', 'ACTIVE'),
    ('Seated Cable Row', 'cable', 'สถานี cable row แบบนั่งสำหรับดึงแนวนอน', 'ACTIVE'),
    ('Seated Calf Press Machine', 'machine', 'เครื่องนั่งสำหรับท่า calf raise', 'ACTIVE'),
    ('Seated Crunch Machine', 'machine', 'เครื่องนั่ง isolate กล้ามเนื้อท้อง', 'ACTIVE'),
    ('Seated Leg Curl Machine', 'machine', 'เครื่อง leg curl แบบนั่งสำหรับ hamstrings', 'ACTIVE'),
    ('Seated Leg Press Machine', 'machine', 'เครื่อง leg press แบบนั่งแนวนอน', 'ACTIVE'),
    ('Seated Row Machine', 'machine', 'เครื่อง cable row แบบนั่งสำหรับความหนาของหลัง', 'ACTIVE'),
    ('Seated Shoulder Press', 'machine', 'สถานี shoulder press แบบนั่ง', 'ACTIVE'),
    ('Seated Triceps Press', 'machine', 'เครื่องนั่งสำหรับท่า triceps press', 'ACTIVE'),
    ('Shoulder Press Machine', 'machine', 'เครื่องสำหรับท่า overhead shoulder press', 'ACTIVE'),
    ('Smith Machine', 'machine', 'เครื่อง barbell แบบราง fixed สำหรับท่าต่างๆ', 'ACTIVE'),
    ('Squat Rack', 'machine', 'Power rack สำหรับ squat และ press', 'ACTIVE'),
    ('Standing Leg Curl Machine', 'machine', 'เครื่อง leg curl ขาเดียวแบบยืน', 'ACTIVE'),
    ('Tricep Extension Machine', 'machine', 'เครื่อง isolate tricep extension', 'ACTIVE'),
    ('V Squat Machine', 'machine', 'เครื่อง V-squat เน้น quad', 'ACTIVE')
ON CONFLICT (equipment_name) DO NOTHING;

-- ============================================
-- SECTION 5: Reset sequences to MAX(id) + 1
-- ============================================

SELECT setval('muscles_id_seq', COALESCE((SELECT MAX(id) FROM muscles), 0) + 1, false);
SELECT setval('muscle_groups_id_seq', COALESCE((SELECT MAX(id) FROM muscle_groups), 0) + 1, false);
SELECT setval('muscle_group_members_id_seq', COALESCE((SELECT MAX(id) FROM muscle_group_members), 0) + 1, false);
SELECT setval('equipment_id_seq', COALESCE((SELECT MAX(id) FROM equipment), 0) + 1, false);

COMMIT;

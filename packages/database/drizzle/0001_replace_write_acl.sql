INSERT INTO `role` (`admin_user_id`, `program_id`, `value`)
SELECT DISTINCT source.`admin_user_id`, source.`program_id`, 'CREATE'
FROM `role` AS source
WHERE source.`value` = 'WRITE' AND NOT EXISTS (
  SELECT 1 FROM `role` AS existing
  WHERE existing.`admin_user_id` <=> source.`admin_user_id`
    AND existing.`program_id` <=> source.`program_id`
    AND existing.`value` = 'CREATE'
);
--> statement-breakpoint
INSERT INTO `role` (`admin_user_id`, `program_id`, `value`)
SELECT DISTINCT source.`admin_user_id`, source.`program_id`, 'READ'
FROM `role` AS source
WHERE source.`value` = 'WRITE' AND NOT EXISTS (
  SELECT 1 FROM `role` AS existing
  WHERE existing.`admin_user_id` <=> source.`admin_user_id`
    AND existing.`program_id` <=> source.`program_id`
    AND existing.`value` = 'READ'
);
--> statement-breakpoint
INSERT INTO `role` (`admin_user_id`, `program_id`, `value`)
SELECT DISTINCT source.`admin_user_id`, source.`program_id`, 'UPDATE'
FROM `role` AS source
WHERE source.`value` = 'WRITE' AND NOT EXISTS (
  SELECT 1 FROM `role` AS existing
  WHERE existing.`admin_user_id` <=> source.`admin_user_id`
    AND existing.`program_id` <=> source.`program_id`
    AND existing.`value` = 'UPDATE'
);
--> statement-breakpoint
INSERT INTO `role` (`admin_user_id`, `program_id`, `value`)
SELECT DISTINCT source.`admin_user_id`, source.`program_id`, 'DELETE'
FROM `role` AS source
WHERE source.`value` = 'WRITE' AND NOT EXISTS (
  SELECT 1 FROM `role` AS existing
  WHERE existing.`admin_user_id` <=> source.`admin_user_id`
    AND existing.`program_id` <=> source.`program_id`
    AND existing.`value` = 'DELETE'
);
--> statement-breakpoint
DELETE FROM `role` WHERE `value` = 'WRITE';

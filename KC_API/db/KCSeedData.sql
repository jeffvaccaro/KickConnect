DELIMITER //
DROP PROCEDURE IF EXISTS admin.ResetAllTables;

CREATE PROCEDURE admin.ResetAllTables()
BEGIN
	SET FOREIGN_KEY_CHECKS = 0;

	-- Truncate each table manually
	TRUNCATE TABLE `account`;
	TRUNCATE TABLE `event`;
	TRUNCATE TABLE `location`;
	TRUNCATE TABLE `profile`;
	TRUNCATE TABLE `role`;
	TRUNCATE TABLE `schedulelocation`;
	TRUNCATE TABLE `schedulemain`;
	TRUNCATE TABLE `user`;
	TRUNCATE TABLE `staffroles`;

	SET FOREIGN_KEY_CHECKS = 1;
END //
DELIMITER ;

CALL admin.ResetAllTables();

-- SuperUser1204
INSERT INTO admin.account
	VALUES (	
			1,
			'22a5670c-96a8-11ef-b3f5-c87f545b41fc',
			'SuperUserAccount',
            '9995551212',
            'superuser@superuser.com',
            'SUPER USER ADDRESS INFO',
            'Denver',
            'CO',
            '80219',
            1,
            1,
            '2024-10-30 04:17:15',
            'DB SEED',
            '2024-10-30 04:17:15',
            NULL);
INSERT INTO admin.role VALUES 
			(1,'Super Admin','Super Admin - Creator of all Accounts',1),
			(2,'Owner','Owner of Account - Admin of ALL locations',2),
            (3,'Admin','Admin of Account for ALL locations',3),
            (4,'Local Admin','Admin of Account for 1 locations',4),
            (5,'Instructor','Instructor of classses',5),
            (6,'Staff','Staff user',6);
INSERT INTO admin.staff VALUES (
			1,
            1,
            'SuperUserAccount',
            'superuser@superuser.com',
            '9995551212',
            '',
            'SUPER USER ADDRESS INFO',
            'DENVER',
            'CO',
            80219,
            '$2a$10$D7Ft.ZAJRvZbM6m1ZIw4HOX7hQF9qQhwPaaBp1q.KtDpYo2/KJEdO',
            NULL,
            1,
            0,
            '2024-10-30 04:17:15',
            'DB SEED',
            '2024-10-30 04:17:15',
            NULL);
INSERT INTO admin.staffroles VALUES (1,1);


select * from admin.account;
select * from admin.event;
select * from admin.location;
select * from admin.profile;
select * from admin.role;
select * from admin.schedulelocation;
select * from admin.schedulemain;
select * from admin.staff;
select * from admin.staffroles;

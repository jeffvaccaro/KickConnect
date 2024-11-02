INSERT INTO `account` VALUES (1,'22a5670c-96a8-11ef-b3f5-c87f545b41fc','SuperUserAccount','7208191204','jeff.vaccaro@live.com','2352 S. Winona Ct','Denver','CO','80219',1,1,'2024-10-30 04:17:15','API Account Register','2024-10-30 04:17:15',NULL);
INSERT INTO `role` VALUES (1,'Super Admin','Super Admin - Creator of all Accounts',1),(2,'Owner','Owner of Account - Admin of ALL locations',2),(3,'Admin','Admin of Account for ALL locations',3),(4,'Local Admin','Admin of Account for 1 locations',4),(5,'Instructor','Instructor of classses',5),(6,'Staff','Staff user',6);
INSERT INTO `user` VALUES (1,1,'SuperUserAccount','jeff.vaccaro@live.com','7208191204','','2352 S. Winona Ct','Denver','CO',80219,'$2a$10$D7Ft.ZAJRvZbM6m1ZIw4HOX7hQF9qQhwPaaBp1q.KtDpYo2/KJEdO',NULL,1,1,'2024-10-30 04:17:15','API Register Insert of OWNER','2024-10-30 04:17:15',NULL);
INSERT INTO `userroles` VALUES (1,1);





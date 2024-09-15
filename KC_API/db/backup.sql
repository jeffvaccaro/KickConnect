-- EXAMPLE mysqldump -u root -p Admin > c:\KCAppDB.sql
-- MySQL dump 10.13  Distrib 8.0.39, for Win64 (x86_64)
--
-- Host: localhost    Database: Admin
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `accountId` int NOT NULL AUTO_INCREMENT,
  `accountCode` char(64) NOT NULL,
  `accountName` varchar(250) NOT NULL,
  `accountPhone` varchar(10) NOT NULL,
  `accountEmail` varchar(250) NOT NULL,
  `accountAddress` varchar(500) NOT NULL,
  `accountCity` varchar(250) NOT NULL,
  `accountState` varchar(2) NOT NULL,
  `accountZip` varchar(10) NOT NULL,
  `createdOn` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` varchar(250) NOT NULL,
  `updatedOn` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedBy` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`accountId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES (1,'a5c4044e-5f2f-11ef-8104-c87f545b41fc','Admin','5555555555','admin@admin.com','street address','city name','XX','99999','2024-08-20 14:06:12','API Account Register','2024-08-20 14:06:12',NULL),(2,'938c61ca-6312-11ef-8104-c87f545b41fc','Bus1','7205555555','bus1@bus1.com','street address','city name','XX','99999','2024-08-25 12:48:10','API Account Register','2024-08-25 12:48:10',NULL),(3,'37720e71-6315-11ef-8104-c87f545b41fc','Bus2','5555555555','bus2@xyz.com','street address','city name','XX','99999','2024-08-25 13:07:04','API Account Register','2024-08-25 13:07:04',NULL);
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class`
--

DROP TABLE IF EXISTS `class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class` (
  `classId` int NOT NULL AUTO_INCREMENT,
  `accountId` int NOT NULL,
  `className` varchar(250) NOT NULL,
  `classDescription` varchar(500) NOT NULL,
  `isActive` int NOT NULL DEFAULT '0',
  `createdOn` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` varchar(250) NOT NULL,
  `updatedOn` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedBy` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`classId`),
  KEY `classAcctFK_idx` (`accountId`),
  CONSTRAINT `classAcctFK` FOREIGN KEY (`accountId`) REFERENCES `account` (`accountId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class`
--

LOCK TABLES `class` WRITE;
/*!40000 ALTER TABLE `class` DISABLE KEYS */;
INSERT INTO `class` VALUES (1,1,'Get-Fit-Done','Fitness Class',-1,'2024-08-25 18:15:49','API Class Insert','2024-08-25 18:41:03','API Class Delete'),(2,1,'Krav Maga Beginner','Beginner Krav Maga class',0,'2024-08-25 18:30:39','API Class Insert','2024-08-25 18:30:39',NULL),(3,1,'Yoga','A relaxing yoga class',0,'2024-08-25 18:41:25','API Class Insert','2024-08-25 18:41:25',NULL),(4,1,'Krav Maga Advanced','Yellow Belts are higher',0,'2024-08-27 18:18:36','API Class Insert','2024-08-27 18:18:36',NULL);
/*!40000 ALTER TABLE `class` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location` (
  `locationId` int NOT NULL AUTO_INCREMENT,
  `accountId` int NOT NULL,
  `locationName` varchar(250) NOT NULL,
  `locationAddress` varchar(250) NOT NULL,
  `locationCity` varchar(250) NOT NULL,
  `locationState` varchar(2) NOT NULL,
  `locationZip` varchar(10) NOT NULL,
  `locationPhone` varchar(10) NOT NULL,
  `locationEmail` varchar(250) NOT NULL,
  `isActive` int NOT NULL DEFAULT '0',
  `createdOn` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` varchar(250) NOT NULL,
  `updatedOn` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedBy` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`locationId`),
  KEY `accountFK_idx` (`accountId`),
  KEY `locationAcctFK_idx` (`accountId`),
  CONSTRAINT `locationAcctFK` FOREIGN KEY (`accountId`) REFERENCES `account` (`accountId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
INSERT INTO `location` VALUES (1,1,'Lakewood Studio','1050 S Wadsworth Blvd','Lakewood','CO','80226','3039841957','lakewood@lakewood.com',0,'2024-08-25 16:18:26','API Location Insert','2024-08-25 16:27:55','API Location Update'),(2,1,'Denver Studio','5200 Broadway','Denver','CO','80216','3032925728','denver@denver.com',-1,'2024-08-25 16:20:42','API Location Insert','2024-08-25 16:42:43','API Location Delete');
/*!40000 ALTER TABLE `location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profile`
--

DROP TABLE IF EXISTS `profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profile` (
  `profileId` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `skills` varchar(250) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`profileId`),
  KEY `userFK_idx` (`userId`),
  CONSTRAINT `userFK` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profile`
--

LOCK TABLES `profile` WRITE;
/*!40000 ALTER TABLE `profile` DISABLE KEYS */;
/*!40000 ALTER TABLE `profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `roleId` int NOT NULL AUTO_INCREMENT,
  `roleName` varchar(50) NOT NULL,
  `roleDescription` varchar(250) NOT NULL,
  `roleOrderId` int DEFAULT NULL,
  PRIMARY KEY (`roleId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'Owner','Owner of ALL LOCATIONS',1),(2,'SuperAdmin','Admin of multiple locations',2),(3,'LocalAdmin','Admin of 1 location',3),(4,'Staff','Staff User',4),(5,'instructor','teaches classes',5),(6,'Program Administrator','Create class programs',6);
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule`
--

DROP TABLE IF EXISTS `schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule` (
  `scheduleId` int NOT NULL AUTO_INCREMENT,
  `accountId` int NOT NULL,
  `profileId` int NOT NULL,
  `locationId` int NOT NULL,
  `classId` int NOT NULL,
  `day` int DEFAULT NULL,
  `startTime` time DEFAULT NULL,
  `endTime` time DEFAULT NULL,
  PRIMARY KEY (`scheduleId`),
  KEY `scheduleAcctFK_idx` (`accountId`),
  KEY `scheduleProfileFK_idx` (`profileId`),
  KEY `scheduleLocationFK_idx` (`locationId`),
  KEY `scheduleClassFK_idx` (`classId`),
  CONSTRAINT `scheduleAcctFK` FOREIGN KEY (`accountId`) REFERENCES `account` (`accountId`),
  CONSTRAINT `scheduleClassFK` FOREIGN KEY (`classId`) REFERENCES `class` (`classId`),
  CONSTRAINT `scheduleLocationFK` FOREIGN KEY (`locationId`) REFERENCES `location` (`locationId`),
  CONSTRAINT `scheduleProfileFK` FOREIGN KEY (`profileId`) REFERENCES `profile` (`profileId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule`
--

LOCK TABLES `schedule` WRITE;
/*!40000 ALTER TABLE `schedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `userId` int NOT NULL AUTO_INCREMENT,
  `accountId` int NOT NULL,
  `name` varchar(45) NOT NULL,
  `email` varchar(250) NOT NULL,
  `phone` varchar(10) NOT NULL,
  `phone2` varchar(10) DEFAULT NULL,
  `roleId` int NOT NULL DEFAULT '4',
  `password` varchar(100) DEFAULT NULL,
  `isActive` int NOT NULL DEFAULT '0',
  `createdOn` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` varchar(250) NOT NULL,
  `updatedOn` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updatedBy` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`userId`),
  KEY `accountFK_idx` (`accountId`),
  KEY `roleFK_idx` (`roleId`),
  CONSTRAINT `accountFK` FOREIGN KEY (`accountId`) REFERENCES `account` (`accountId`),
  CONSTRAINT `roleFK` FOREIGN KEY (`roleId`) REFERENCES `role` (`roleId`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,1,'Admin','admin@admin.com','5555555555',NULL,4,'$2a$10$oKfED6Pma1qAz.hJj8Isa.J57JMF0udQjIfkmBZVzCnOqQNkszfGq',0,'2024-08-20 14:06:12','API User Insert','2024-08-20 14:06:12',NULL),(2,1,'USER1c','user1c@user1.com','5555555555','',1,'$2a$10$.H3ilQsMS6gbaLFHO2zUy.PKGWcCpoSa82bBnKaR8QPlYkf.BCWzu',-1,'2024-08-20 14:51:44','API User Update','2024-08-24 17:59:07','API User Delete'),(3,1,'USER2','user2@user2.com','5555555555','',4,'$2a$10$uuCf6hUwFZKZD0WPV33NWeJuYy6Ld/m2dD8psBE4cNwAn6u5Z3m4y',0,'2024-08-24 18:12:32','API User Insert','2024-08-24 18:12:32',NULL),(4,2,'Bus1','bus1@bus1.com','7205555555',NULL,1,'$2a$10$DaMNXKbBSeO63aGAfeTmX.FliUPFCoKzNhR6JRRo4Nn7a4fp6pbnm',0,'2024-08-25 12:48:10','API Register Insert of OWNER','2024-08-25 12:48:10',NULL),(5,3,'Bus2','bus2@xyz.com','5555555555',NULL,1,'$2a$10$IJaXjd/h1kuxadli6zaAnewnWhR2Y.UlaAIHEGUVJtnF4dOxx6AvW',0,'2024-08-25 13:07:04','API Register Insert of OWNER','2024-08-25 13:07:04',NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-08-27 18:35:40
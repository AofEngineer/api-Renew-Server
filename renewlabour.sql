-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 01, 2023 at 07:11 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.0.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `renewlabour`
--

-- --------------------------------------------------------

--
-- Table structure for table `branch`
--

CREATE TABLE `branch` (
  `branch_id` int(100) NOT NULL,
  `branch_no` varchar(100) NOT NULL,
  `branchname` varchar(100) NOT NULL,
  `member_group` int(11) NOT NULL,
  `company_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `branch`
--

INSERT INTO `branch` (`branch_id`, `branch_no`, `branchname`, `member_group`, `company_id`) VALUES
(2, '[value-2]', '[value-3]', 10, 2),
(3, 'test', 'test', 10, 6),
(4, '00001', 'Guruit Solution', 10, 10);

-- --------------------------------------------------------

--
-- Table structure for table `company`
--

CREATE TABLE `company` (
  `cpn_id` int(11) NOT NULL,
  `cpn_n` varchar(100) DEFAULT NULL,
  `cpn_build` varchar(100) DEFAULT NULL,
  `cpn_ad` varchar(100) NOT NULL,
  `cpn_fl` varchar(100) DEFAULT NULL,
  `cpn_vill` varchar(100) DEFAULT NULL,
  `cpn_room` varchar(100) DEFAULT NULL,
  `cpn_moo` varchar(100) DEFAULT NULL,
  `cpn_soi` varchar(100) DEFAULT NULL,
  `cpn_st` varchar(100) DEFAULT NULL,
  `cpn_coun` varchar(100) NOT NULL,
  `cpn_subdist` varchar(100) NOT NULL,
  `cpn_dist` varchar(100) NOT NULL,
  `cpn_prov` varchar(100) NOT NULL,
  `cpn_zip` varchar(100) NOT NULL,
  `c_iden` varchar(13) NOT NULL,
  `member_group` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `company`
--

INSERT INTO `company` (`cpn_id`, `cpn_n`, `cpn_build`, `cpn_ad`, `cpn_fl`, `cpn_vill`, `cpn_room`, `cpn_moo`, `cpn_soi`, `cpn_st`, `cpn_coun`, `cpn_subdist`, `cpn_dist`, `cpn_prov`, `cpn_zip`, `c_iden`, `member_group`, `branch_id`) VALUES
(3, '[value-2]', '[value-3]', '[value-4]', '[value-5]', '[value-6]', '[value-7]', '[value-8]', '[value-9]', '[value-10]', '[value-11]', '[value-12]', '[value-13]', '[value-14]', '[value-15]', '[value-17]', 10, 0),
(4, '[value-2]', '[value-3]', '[value-4]', '[value-5]', '[value-6]', '[value-7]', '[value-8]', '[value-9]', '[value-10]', '[value-11]', '[value-12]', '[value-13]', '[value-14]', '[value-15]', '[value]', 10, 0),
(5, '[value-2]', '[value-3]', '[value-4]', '[value-5]', '[value-6]', '[value-7]', '[value-8]', '[value-9]', '[value-10]', '[value-11]', '[value-12]', '[value-13]', '[value-14]', '[value-15]', 'value', 10, 0),
(6, '[value-2]', '[value-3]', '[value-4]', '[value-5]', '[value-6]', '[value-7]', '[value-8]', '[value-9]', '[value-10]', '[value-11]', '[value-12]', '[value-13]', '[value-14]', '[value-15]', 'va', 10, 0),
(7, '[value-2]', '[value-3]', '[value-4]', '[value-5]', '[value-6]', '[value-7]', '[value-8]', '[value-9]', '[value-10]', '[value-11]', '[value-12]', '[value-13]', '[value-14]', '[value-15]', 'vaa', 10, 0),
(8, '[value-2]', '[value-3]', '[value-4]', '[value-5]', '[value-6]', '[value-7]', '[value-8]', '[value-9]', '[value-10]', '[value-11]', '[value-12]', '[value-13]', '[value-14]', '[value-15]', 'vaaa', 10, 0),
(9, '[value-2]', '[value-3]', '[value-4]', '[value-5]', '[value-6]', '[value-7]', '[value-8]', '[value-9]', '[value-10]', '[value-11]', '[value-12]', '[value-13]', '[value-14]', '[value-15]', 'vaasa', 10, 0),
(10, 'aa', 'a', 'a', 'a', 'a', 'a', '', '', '', '', 'บางค้อ', 'จอมทอง', 'กรุงเทพมหานคร', '10150', '1111111111111', 10, 0);

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `mem_id` int(11) NOT NULL,
  `member_name` varchar(50) DEFAULT NULL,
  `member_lastname` varchar(50) DEFAULT NULL,
  `member_group` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `tel` varchar(10) DEFAULT NULL,
  `activation_code` varchar(50) DEFAULT NULL,
  `piority` int(2) NOT NULL,
  `refreshtoken` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`mem_id`, `member_name`, `member_lastname`, `member_group`, `username`, `password`, `email`, `tel`, `activation_code`, `piority`, `refreshtoken`, `company_id`) VALUES
(11, 'admin', 'admaw', 10, 'admaw', 'admin', '', '', '', 21, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWRtYXciLCJpZCI6MTEsImlhdCI6MTY5NTk2MzEzNSwiZXhwIjoxNjk2MDQ5NTM1fQ.G74egG9R9h8H9vw5-0JJSWpZqK5aASQvHVKtKNNqiT0', 0),
(15, 'Rock', 'Rock', 10, 'rockkung', '123', 'piyarin4826@gmail.com', '0901021423', '', 25, '', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `member_group`
--

CREATE TABLE `member_group` (
  `id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `member_group`
--

INSERT INTO `member_group` (`id`, `company_id`) VALUES
(10, 0);

-- --------------------------------------------------------

--
-- Table structure for table `permission`
--

CREATE TABLE `permission` (
  `per_id` int(11) NOT NULL,
  `readpermis` tinyint(1) NOT NULL,
  `addpermis` tinyint(1) NOT NULL,
  `editpermis` tinyint(1) NOT NULL,
  `delpermis` tinyint(1) NOT NULL,
  `rootadmin` tinyint(1) DEFAULT NULL,
  `admin` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `permission`
--

INSERT INTO `permission` (`per_id`, `readpermis`, `addpermis`, `editpermis`, `delpermis`, `rootadmin`, `admin`) VALUES
(18, 1, 1, 1, 1, 0, 0),
(21, 1, 1, 1, 1, 0, 1),
(22, 1, 1, 1, 0, 0, 0),
(23, 1, 1, 0, 0, 0, NULL),
(25, 1, 1, 0, 0, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `persons`
--

CREATE TABLE `persons` (
  `person_id` int(11) NOT NULL,
  `outlanderNo` varchar(15) NOT NULL,
  `prefix` varchar(20) DEFAULT NULL,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) DEFAULT NULL,
  `prefixth` varchar(20) DEFAULT NULL,
  `firstnameth` varchar(50) DEFAULT NULL,
  `lastnameth` varchar(50) DEFAULT NULL,
  `nationality` varchar(10) DEFAULT NULL,
  `passportNo` varchar(25) DEFAULT NULL,
  `passportdate` varchar(25) DEFAULT NULL,
  `passportexp` varchar(25) DEFAULT NULL,
  `pathpassport` varchar(255) DEFAULT NULL,
  `visaNo` varchar(25) DEFAULT NULL,
  `visadate` varchar(25) DEFAULT NULL,
  `visaext` varchar(25) DEFAULT NULL,
  `pathvisa` varchar(255) DEFAULT NULL,
  `workpermitno` varchar(25) DEFAULT NULL,
  `workpermitdate` varchar(25) DEFAULT NULL,
  `workpermitext` varchar(25) DEFAULT NULL,
  `pathworkpermit` varchar(255) DEFAULT NULL,
  `ninetydate` varchar(25) DEFAULT NULL,
  `ninetyexp` varchar(25) DEFAULT NULL,
  `pathninety` varchar(255) DEFAULT NULL,
  `member_group` int(11) NOT NULL,
  `company_id` int(255) DEFAULT NULL,
  `picpath` varchar(255) DEFAULT NULL,
  `nickname` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `branch`
--
ALTER TABLE `branch`
  ADD PRIMARY KEY (`branch_id`),
  ADD KEY `member_group` (`member_group`),
  ADD KEY `company_id` (`company_id`);

--
-- Indexes for table `company`
--
ALTER TABLE `company`
  ADD PRIMARY KEY (`cpn_id`),
  ADD KEY `member_group` (`member_group`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`mem_id`),
  ADD KEY `member_group` (`member_group`),
  ADD KEY `piority` (`piority`);

--
-- Indexes for table `member_group`
--
ALTER TABLE `member_group`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`) USING BTREE;

--
-- Indexes for table `permission`
--
ALTER TABLE `permission`
  ADD UNIQUE KEY `per_id` (`per_id`),
  ADD KEY `per_id_2` (`per_id`);

--
-- Indexes for table `persons`
--
ALTER TABLE `persons`
  ADD PRIMARY KEY (`person_id`),
  ADD KEY `member_group` (`member_group`),
  ADD KEY `company_id` (`company_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `branch`
--
ALTER TABLE `branch`
  MODIFY `branch_id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `company`
--
ALTER TABLE `company`
  MODIFY `cpn_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `mem_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `member_group`
--
ALTER TABLE `member_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `permission`
--
ALTER TABLE `permission`
  MODIFY `per_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `persons`
--
ALTER TABLE `persons`
  MODIFY `person_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `branch`
--
ALTER TABLE `branch`
  ADD CONSTRAINT `branch_ibfk_1` FOREIGN KEY (`member_group`) REFERENCES `member_group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `company`
--
ALTER TABLE `company`
  ADD CONSTRAINT `company_ibfk_1` FOREIGN KEY (`member_group`) REFERENCES `member_group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `members`
--
ALTER TABLE `members`
  ADD CONSTRAINT `members_ibfk_1` FOREIGN KEY (`member_group`) REFERENCES `member_group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `members_ibfk_2` FOREIGN KEY (`piority`) REFERENCES `permission` (`per_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `persons`
--
ALTER TABLE `persons`
  ADD CONSTRAINT `persons_ibfk_3` FOREIGN KEY (`member_group`) REFERENCES `member_group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

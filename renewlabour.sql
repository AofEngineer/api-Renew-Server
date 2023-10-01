START TRANSACTION;
SET time_zone = "+07:00";
CREATE TABLE `branch` (
  `branch_id` int(100) NOT NULL,
  `branch_no` varchar(100) NOT NULL,
  `branchname` varchar(100) NOT NULL,
  `member_group` int(11) NOT NULL,
  `company_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
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
CREATE TABLE `member_group` (
  `id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
CREATE TABLE `permission` (
  `per_id` int(11) NOT NULL,
  `readpermis` tinyint(1) NOT NULL,
  `addpermis` tinyint(1) NOT NULL,
  `editpermis` tinyint(1) NOT NULL,
  `delpermis` tinyint(1) NOT NULL,
  `rootadmin` tinyint(1) DEFAULT NULL,
  `admin` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
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
ALTER TABLE `branch`
  ADD PRIMARY KEY (`branch_id`),
  ADD KEY `member_group` (`member_group`),
  ADD KEY `company_id` (`company_id`);
ALTER TABLE `company`
  ADD PRIMARY KEY (`cpn_id`),
  ADD KEY `member_group` (`member_group`);
ALTER TABLE `members`
  ADD PRIMARY KEY (`mem_id`),
  ADD KEY `member_group` (`member_group`),
  ADD KEY `piority` (`piority`);
ALTER TABLE `member_group`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`) USING BTREE;
ALTER TABLE `permission`
  ADD UNIQUE KEY `per_id` (`per_id`),
  ADD KEY `per_id_2` (`per_id`);
ALTER TABLE `persons`
  ADD PRIMARY KEY (`person_id`),
  ADD KEY `member_group` (`member_group`),
  ADD KEY `company_id` (`company_id`);
ALTER TABLE `branch`
  MODIFY `branch_id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
ALTER TABLE `company`
  MODIFY `cpn_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
ALTER TABLE `members`
  MODIFY `mem_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
ALTER TABLE `member_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
ALTER TABLE `permission`
  MODIFY `per_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;
ALTER TABLE `persons`
  MODIFY `person_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
ALTER TABLE `branch`
  ADD CONSTRAINT `branch_ibfk_1` FOREIGN KEY (`member_group`) REFERENCES `member_group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `company`
  ADD CONSTRAINT `company_ibfk_1` FOREIGN KEY (`member_group`) REFERENCES `member_group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `members`
  ADD CONSTRAINT `members_ibfk_1` FOREIGN KEY (`member_group`) REFERENCES `member_group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `members_ibfk_2` FOREIGN KEY (`piority`) REFERENCES `permission` (`per_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `persons`
  ADD CONSTRAINT `persons_ibfk_3` FOREIGN KEY (`member_group`) REFERENCES `member_group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;


-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 25, 2023 at 01:06 PM
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
-- Database: `newlabour`
--

-- --------------------------------------------------------

--
-- Table structure for table `branch`
--

CREATE TABLE `branch` (
  `branch_id` int(11) NOT NULL,
  `branch_no` varchar(100) NOT NULL,
  `branchname` varchar(100) NOT NULL,
  `member_group` int(11) NOT NULL,
  `company_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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
  `branch_id` int(11) NOT NULL,
  `logo` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `company`
--

INSERT INTO `company` (`cpn_id`, `cpn_n`, `cpn_build`, `cpn_ad`, `cpn_fl`, `cpn_vill`, `cpn_room`, `cpn_moo`, `cpn_soi`, `cpn_st`, `cpn_coun`, `cpn_subdist`, `cpn_dist`, `cpn_prov`, `cpn_zip`, `c_iden`, `member_group`, `branch_id`, `logo`) VALUES
(0, 'ว่างงาน', NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, '', '', '', '', '', '', 0, 0, ''),
(1, 'ห้างหุ้นส่วนจำกัด กฤษณ์เจริญทรัพย์', '', '1/22', '', '', '', '9', '', '', 'ไทย', 'ทุ่งสุขลา', 'ศรีราชา', 'ชลบุรี', '20230', '0103555021523', 1, 0, 'image.jpg'),
(2, 'ฝ้ายการช่าง', '', '1/21', '', '', '', '9', '', '', 'ไทย', 'ทุ่งสุขลา', 'ศรีราชา', 'ชลบุรี', '20230', '0205562014350', 1, 0, ''),
(3, 'ดีเจริญ 99 คอนสตรัคชั่น', '', '300/132', '', '', '', '5', '', '', 'ไทย', 'นาเกลือ', 'บางละมุง', 'ชลบุรี', '20150', '0205563017832', 1, 0, ''),
(4, 'asdasdasd', 'asdasd', 'asdasd', '', '', '', '', '', '', 'asdasd', 'ทุ่งมหาเมฆ', 'สาทร', 'กรุงเทพมหานคร', '10120', '123123123', 1, 0, '92574.jpg'),
(5, 'asdasd', 'asdasd', '', '', '', '', '', '', '', 'asdasd', 'ทุ่งมหาเมฆ', 'สาทร', 'กรุงเทพมหานคร', '10120', '12312313123', 1, 0, 'pexels-cottonbro-studio-6869637.jpg'),
(6, 'asdasd', 'asdasd', '', '', '', '', '', '', '', 'asdasd', 'ทุ่งมหาเมฆ', 'สาทร', 'กรุงเทพมหานคร', '10120', '1131313111111', 1, 0, 'pexels-cottonbro-studio-6869637.jpg'),
(7, 'asdasd', 'asd', '', '', '', '', '', '', '', 'asd', 'ทุ่งมหาเมฆ', 'สาทร', 'กรุงเทพมหานคร', '10120', '1231231233', 1, 0, 'pexels-cottonbro-studio-6869637.jpg'),
(8, 'asd2wwwe', 'asd', '', '', '', '', '', '', '', 'asd', 'ทุ่งมหาเมฆ', 'สาทร', 'กรุงเทพมหานคร', '10120', '1231232222222', 1, 0, 'pexels-cottonbro-studio-6869637.jpg'),
(9, 'adasd', 'asd', '', '', '', '', '', '', '', 'asd', 'วัดพระยาไกร', 'บางคอแหลม', 'กรุงเทพมหานคร', '10120', '1231232332222', 1, 0, 'pexels-cottonbro-studio-6869637.jpg'),
(10, '223113asad', 'sad', '', '', '', '', '', '', '', 'asdasd', 'ทุ่งมหาเมฆ', 'สาทร', 'กรุงเทพมหานคร', '10120', '1231231321244', 1, 0, 'pexels-cottonbro-studio-6869637.jpg'),
(11, 'asdw', '', '', '', '', '', '', '', '', 'asdasd', 'ทุ่งมหาเมฆ', 'สาทร', 'กรุงเทพมหานคร', '10120', '2123232311312', 1, 0, 'white-cat-with-staring-look-4k-5k-cat.jpg'),
(12, '213asd', 'asdasd', '', '', '', '', '', '', '', '123asd', 'ทุ่งมหาเมฆ', 'สาทร', 'กรุงเทพมหานคร', '10120', '213123124421', 1, 0, 'pexels-cottonbro-studio-6869637.jpg'),
(13, 'yuuuuuiuiuiiuiu', '', '', '', '', '', '', '', '', 'asdasd', 'ทุ่งมหาเมฆ', 'สาทร', 'กรุงเทพมหานคร', '10120', '132434532454', 1, 0, '92574.jpg'),
(14, 'บายบาย', '1', '53/96', '2', '', '201', '', 'เพชรเกษม90', 'บางแค', 'ไทย', 'บางหว้า', 'ภาษีเจริญ', 'กรุงเทพมหานคร', '10160', '1236598563', 1, 0, 'iStock-1067747794.jpg'),
(17, 'asdasdqweqwe', '', '', '', '', '', '', '', '', 'qweqweasd', 'ทุ่งมหาเมฆ', 'สาทร', 'กรุงเทพมหานคร', '10120', '4355221345673', 1, 0, '92574.jpg'),
(18, 'asd121143dsdf', '', '', '', '', '', '', '', '', 'dsfghgf', 'ทุ่งมหาเมฆ', 'สาทร', 'กรุงเทพมหานคร', '10120', '0090494080390', 1, 0, '92574.jpg');

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
  `refreshtoken` varchar(255) DEFAULT NULL,
  `company_id` int(11) DEFAULT NULL,
  `m_read` tinyint(1) NOT NULL,
  `m_add` tinyint(1) NOT NULL,
  `m_edit` tinyint(1) NOT NULL,
  `m_del` int(11) NOT NULL,
  `m_admin` tinyint(1) NOT NULL,
  `m_root` tinyint(1) NOT NULL,
  `m_picpath` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`mem_id`, `member_name`, `member_lastname`, `member_group`, `username`, `password`, `email`, `tel`, `activation_code`, `refreshtoken`, `company_id`, `m_read`, `m_add`, `m_edit`, `m_del`, `m_admin`, `m_root`, `m_picpath`) VALUES
(1, 'admin', 'admun', 1, 'admin', 'admin', '', '', '', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWRtaW4iLCJpZCI6MSwiaWF0IjoxNjk4MjMxNjY2LCJleHAiOjE2OTgzMTgwNjZ9.xV_J0ZrgEVceOtfVjWXx4ACmUGFeQ1JwO3oEuKGkzbI', 12, 1, 1, 1, 1, 1, 0, ''),
(2, 'Thipnapha', 'Thappho', 2, 'Thipnapha.t', 'Renewal$', '', '', '', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiVGhpcG5hcGhhLnQiLCJpZCI6MiwiaWF0IjoxNjk3OTU3NTU1LCJleHAiOjE2OTgwNDM5NTV9.ooHIe_Pj4GolSmhgfzv6AqLK_PEWxoji90i_za0K_Bg', 0, 1, 1, 1, 1, 1, 0, ''),
(6, 'asd', 'asd', 1, 'asdd', 'asd', '', '', '', '', 12, 0, 0, 0, 0, 0, 0, '92574.jpg'),
(7, 'สมชาย', 'ตราไก่', 1, 'love12', 'love12', 'teptida1340@gmail.com', '0998563123', '', '', 12, 1, 1, 1, 0, 0, 0, 'iStock-Home 1.jpg');

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
(0, 0),
(1, 0),
(2, 0);

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
  `company_id` int(11) DEFAULT NULL,
  `picpath` varchar(255) DEFAULT NULL,
  `nickname` varchar(25) DEFAULT NULL,
  `other` varchar(255) DEFAULT NULL,
  `company_name` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `persons`
--

INSERT INTO `persons` (`person_id`, `outlanderNo`, `prefix`, `firstname`, `lastname`, `prefixth`, `firstnameth`, `lastnameth`, `nationality`, `passportNo`, `passportdate`, `passportexp`, `pathpassport`, `visaNo`, `visadate`, `visaext`, `pathvisa`, `workpermitno`, `workpermitdate`, `workpermitext`, `pathworkpermit`, `ninetydate`, `ninetyexp`, `pathninety`, `member_group`, `company_id`, `picpath`, `nickname`, `other`, `company_name`) VALUES
(13, '1131313', 'Mr', 'a', 'e', 'นาย', 'เอ', 'อี', 'ลาว', 'as1313123', '', '', '', 'aa1131313', '10/03/2023', '10/24/2023', '', 'asd13123123', '', '', '', '', '', '', 1, 0, 'a-1131313.jpg', 'a', '', NULL),
(14, '213123231441', 'Mr', 'asdasd', 'asdasd', 'นาย', 'ฟฟหก', 'ฟหกฟหก', 'ลาว', '1313131323', '10/03/2023', '10/31/2023', 'Passport-asdasd-213123231441.pdf', '12131313', '10/03/2023', '10/25/2023', 'Visa-asdasd-213123231441.pdf', '23232323', '10/02/2023', '10/31/2023', 'WorkPermit-asdasd-213123231441.pdf', '10/02/2023', '10/31/2023', 'NinetyDays-asdasd-213123231441.pdf', 1, 1, 'asdasd-213123231441.jpg', 'asdasd', 'otherfilepath-asdasd-213123231441.pdf', NULL),
(15, '11111222222221', 'Mr', 'wwwwwww', 'wwwwwwww', 'นาย', 'ไไไไไไไไ', 'ไไไไไไไไไ', 'ลาว', '1313131323', '10/01/2023', '10/31/2023', 'Passport-wwwwwww-11111222222221.pdf', '12131313', '10/01/2023', '10/31/2023', 'Visa-wwwwwww-11111222222221.pdf', '23232323', '10/01/2023', '10/31/2023', 'WorkPermit-wwwwwww-11111222222221.pdf', '10/01/2023', '10/31/2023', 'NinetyDays-wwwwwww-11111222222221.pdf', 1, 0, 'wwwwwww-11111222222221.jpg', 'aaa', 'otherfilepath-wwwwwww-11111222222221.pdf', NULL),
(16, '13231123', 'Mr', 'sssssss', 'sssssss', 'นาย', 'หหหหหหห', 'หหหหหห', 'ลาว', '1313232323', '10/01/2023', '10/31/2023', 'Passport-sssssss-13231123.pdf', '132313131313', '10/01/2023', '10/31/2023', 'Visa-sssssss-13231123.pdf', '3241241234', '10/01/2023', '10/31/2023', 'WorkPermit-sssssss-13231123.pdf', '10/01/2023', '10/31/2023', 'NinetyDays-sssssss-13231123.pdf', 1, 0, 'sssssss-13231123.jpg', 'asd', 'otherfilepath-sssssss-13231123.pdf', NULL),
(17, '234345e445', 'Mr', 'wwwwwwwwwwwwww', 'wwwwwwwwwwwwwwwwwwwwwww', 'นาย', 'พพพพพพพพพพพพพพพ', 'พพพพพพพพพพพพพพพพพพพพพพ', 'ลาว', '1414414114', '10/01/2023', '10/31/2023', 'Passport-wwwwwwwwwwwwww-234345e445.pdf', '12131313', '10/01/2023', '10/31/2023', 'Visa-wwwwwwwwwwwwww-234345e445.pdf', 'asd13123123', '10/01/2023', '10/31/2023', 'WorkPermit-wwwwwwwwwwwwww-234345e445.pdf', '10/01/2023', '10/31/2023', 'NinetyDays-wwwwwwwwwwwwww-234345e445.pdf', 1, 0, '', 'asdasd', 'otherfilepath-wwwwwwwwwwwwww-234345e445.pdf', NULL),
(18, 'asdasd131414', 'Mr', 'ssaa', 'aasas', 'นาย', 'ฟฟฟฟฟฟ', 'ฟฟฟฟฟฟฟฟ', 'ลาว', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 1, 0, 'ssaa-asdasd131414.jpg', 'sdaa', '', NULL),
(19, '231321342211', 'Mr', 'asasdsa', 'sdasdasdasdasda', 'นาย', 'ฟหกฟกหกหฟหกฟ', 'กหฟหกฟกหฟฟกหหฟกหกฟ', 'ลาว', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 1, 0, 'asasdsa-231321342211.jpg', 'aaaaa', '', NULL),
(20, 'ssssaaa', 'Mr', 'asdasd', 'asdasd', 'นาย', 'ฟหกฟหกฟก', 'ฟหกฟหกฟหก', 'ลาว', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 1, 0, 'asdasd-ssssaaa.jpg', 'asd', '', NULL),
(21, '12332121as2', 'Mr', 'asdasasd', 'sadadas', 'นาย', 'ฟหกฟหก', 'ฟหกฟหก', 'พม่า', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 1, 0, '', 'asd', '', NULL),
(22, '1213123213', 'Mr', 'sadasdasd', 'asdasd', 'นาย', 'หฟกฟหกฟห', 'ฟหกฟหก', 'ลาว', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 1, 0, 'sadasdasd-1213123213.jpg', 'ddd', '', NULL),
(23, '1213123213aa', 'Mrs', 'adasdsadsa', 'dassddsaads', 'นาย', 'เดก้เด้เดเ้ด', 'ดเก้เด่้เ่้าา่้', 'ลาว', 'as34342465789', '10/01/2023', '10/31/2023', 'Passport-adasdsadsa-1213123213aa.pdf', 'a344142214', '10/01/2023', '10/31/2023', 'Visa-adasdsadsa-1213123213aa.pdf', 'as2132435466785', '10/01/2023', '10/31/2023', 'WorkPermit-adasdsadsa-1213123213aa.pdf', '10/02/2023', '10/31/2023', 'NinetyDays-adasdsadsa-1213123213aa.pdf', 1, 0, '', 'adsweewqewqz', 'otherfilepath-adasdsadsa-1213123213aa.pdf', NULL),
(24, '1232115fd', 'Mr', 'ererwewr', 'erwewrwerew', 'นาย', 'หฟกกหฟฟกห', 'ฟหกฟกหหกฟฟกห', 'ลาว', '345678', '10/01/2023', '10/31/2023', 'Passport-ererwewr-1232115fd.pdf', '231456', '10/01/2023', '10/31/2023', 'Visa-ererwewr-1232115fd.pdf', '', '', '', '', '', '', '', 1, 0, 'ererwewr-1232115fd.jpg', 'assddf', '', NULL),
(25, '1121313131ss', 'Mr', 'sasadsda', 'asdasdsda', 'นาย', 'ฟหกฟหก', 'ฟหฟหกกหฟหกฟ', 'ลาว', '', '', '', '', '12131313', '10/01/2023', '10/31/2023', '', '', '', '', '', '10/01/2023', '10/31/2023', '', 1, 0, '', 'asdasd', '', NULL),
(26, '2343456576778aa', 'Mr', 'sahjk', 'sdfghjk', 'นาย', 'กดเ้่าส', 'หกดเ้่าส', 'ลาว', '', '', '', '', 'sdasdsa12e4345', '10/01/2023', '10/31/2023', 'Visa-sahjk-2343456576778aa.pdf', '', '', '', '', '', '', '', 1, 0, 'sahjk-2343456576778aa.jpg', 'sdacvbnm', '', NULL),
(27, '21312321123sds', 'Mr', 'asads', 'asdasd', 'นาย', 'กกดสดเาดเา', 'กดหสเดสเ้าเ้ด', 'ลาว', '', '', '', '', '214562sddffdg', '10/01/2023', '10/31/2023', 'Visa-asads-21312321123sds.pdf', '', '', '', '', '', '', '', 1, 0, 'asads-21312321123sds.jpg', 'asdasddddssssd ', '', NULL),
(28, '1213123213a2ss', 'Mr', 'pppppp', 'ppppppp', 'นาย', 'ยยยยยย', 'บบบบบบบ', 'ลาว', '1313232323', '10/01/2023', '10/31/2023', 'Passport-pppppp-1213123213a2ss.pdf', '12131313', '10/01/2023', '10/31/2023', 'Visa-pppppp-1213123213a2ss.pdf', '3241241234', '10/01/2023', '10/31/2023', 'WorkPermit-pppppp-1213123213a2ss.pdf', '10/01/2023', '10/31/2023', 'NinetyDays-pppppp-1213123213a2ss.pdf', 1, 0, 'pppppp-1213123213a2ss.jpg', 'aaasddd', 'otherfilepath-pppppp-1213123213a2ss.pdf', NULL),
(29, 'aaty554342545', 'Mr', 'errttytyuyuyu', 'yuyuyuyuyuyuyu', 'นาย', 'ฟฟฟบบบบบ', 'ฟฟฟยยยย', 'ลาว', '1313232323', '10/01/2023', '10/31/2023', 'Passport-errttytyuyuyu-aaty554342545.pdf', '12131313', '10/01/2023', '10/31/2023', 'Visa-errttytyuyuyu-aaty554342545.pdf', '141441144114114', '10/02/2023', '10/31/2023', 'WorkPermit-errttytyuyuyu-aaty554342545.pdf', '10/01/2023', '10/31/2023', 'NinetyDays-errttytyuyuyu-aaty554342545.pdf', 1, 0, 'errttytyuyuyu-aaty554342545.jpg', 'alpp', 'otherfilepath-errttytyuyuyu-aaty554342545.pdf', NULL),
(30, '13231123addeew', 'Mr', 'adasss', 'fggf', 'นาย', 'พัะปป', '้เาาส', 'ลาว', '1313131323', '', '', 'Passport-adasss-13231123addeew.pdf', '12131313', '', '', 'Visa-adasss-13231123addeew.pdf', '', '', '', '', '', '', '', 1, 0, 'adasss-13231123addeew.jpg', 'Aof', '', NULL),
(31, '34sasad', 'Mr', 'asd', 'asd', 'นาย', 'ำพำไพ', 'พำไำำพ', 'ลาว', '', '', '', '', 'as', '', '', 'Visa-asd-34sasad.pdf', '', '', '', '', '', '', '', 1, 0, 'asd-34sasad.jpg', 'asd', '', NULL),
(32, '234345657sssd7a', 'Mr', 'dfghjk', 'dfgklpoik', 'นาย', 'เด้่า', 'ยนรีเ', 'ลาว', '', '', '', '', '12131313', '', '', 'Visa-dfghjk-234345657sssd7a.pdf', '', '', '', '', '', '', '', 1, 0, 'dfghjk-234345657sssd7a.jpg', 'cvbnm', '', NULL),
(33, '213312fdhj31323', 'Mr', 'asd', 'dfgh', 'นาย', 'งสาสสาส', 'วงืิทม', 'ลาว', '', '', '', '', '12131313', '', '', 'Visa-asd-213312fdhj31323.pdf', '', '', '', '', '', '', '', 1, 0, 'asd-213312fdhj31323.jpg', 'hjhjk', '', NULL),
(34, '234345asd867', 'Mr', 'sadfgf', 'fdfgh', 'นาย', 'ฟหก', 'หกฟหก', 'ลาว', '', '', '', '', '132313131313', '', '', 'Visa-sadfgf-234345asd867.pdf', '', '', '', '', '', '', '', 1, 0, 'sadfgf-234345asd867.jpg', 'asasd', '', NULL),
(35, '2563695', 'Mrs', 'saban', 'de', 'นางสาว', 'สบาย', 'ดี', 'ลาว', '1236592', '08/16/2022', '12/30/2023', 'Passport-saban-2563695.pdf', '7895462', '10/25/2022', '11/15/2023', 'Visa-saban-2563695.pdf', '8996512', '08/23/2023', '11/18/2023', 'WorkPermit-saban-2563695.pdf', '10/04/2023', '12/04/2023', 'NinetyDays-saban-2563695.pdf', 1, 13, 'saban-2563695.jpg', 'yori', '', NULL);

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
  ADD KEY `member_group` (`member_group`);

--
-- Indexes for table `member_group`
--
ALTER TABLE `member_group`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`) USING BTREE;

--
-- Indexes for table `persons`
--
ALTER TABLE `persons`
  ADD PRIMARY KEY (`person_id`),
  ADD KEY `member_group` (`member_group`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `branch`
--
ALTER TABLE `branch`
  MODIFY `branch_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `company`
--
ALTER TABLE `company`
  MODIFY `cpn_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `mem_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `member_group`
--
ALTER TABLE `member_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `persons`
--
ALTER TABLE `persons`
  MODIFY `person_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

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
  ADD CONSTRAINT `members_ibfk_1` FOREIGN KEY (`member_group`) REFERENCES `member_group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `persons`
--
ALTER TABLE `persons`
  ADD CONSTRAINT `persons_ibfk_3` FOREIGN KEY (`member_group`) REFERENCES `member_group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

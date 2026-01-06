// React Icons untuk fitur Ramadhan
import {
  // Waktu & Kalender
  FaCalendarAlt,
  FaClock,
  FaRegCalendarCheck,
  
  // Ibadah & Sholat
  FaMosque,
  FaPrayingHands,
  FaMoon,
  FaStar,
  FaStarAndCrescent,
  FaHome,
  
  // Doa & Dzikir
  FaHandsWash,
  FaBookOpen,
  FaQuran,
  FaBook,
  
  // Zakat & Sedekah
  FaMoneyBillWave,
  FaHandHoldingHeart,
  FaGem,
  FaFileAlt,
  FaDonate,
  
  // Umum
  FaCheckCircle,
  FaLightbulb,
  FaInfoCircle,
  FaHeart,
  FaSun,
  FaCloudMoon,
  FaCloudSun,
  FaUsers,
  FaUserFriends,
  FaGraduationCap,
  FaListUl,
  FaChevronDown,
  FaChevronRight,
  FaSearch,
  FaTimes,
  FaCheck,
  FaBolt,
} from "react-icons/fa";

import {
  BsMoonStarsFill,
  BsSunriseFill,
  BsSunsetFill,
  BsBookHalf,
  BsCalendar3,
  BsListCheck,
  BsClock,
  BsHeart,
  BsHeartFill,
  BsStarFill,
  BsCalendarCheck,
} from "react-icons/bs";

import {
  MdMosque,
  MdOutlineWbSunny,
  MdNightsStay,
  MdOutlineMenuBook,
  MdOutlineCalculate,
  MdOutlineVolunteerActivism,
  MdOutlineRestaurant,
  MdFastfood,
  MdWaterDrop,
} from "react-icons/md";

import {
  GiMeal,
  GiPrayer,
  GiCrescent,
  GiBookCover,
  GiStarFormation,
} from "react-icons/gi";

import {
  IoMoonOutline,
  IoMoon,
  IoSunnyOutline,
  IoSunny,
  IoBookOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoHeartOutline,
  IoGiftOutline,
  IoWalletOutline,
} from "react-icons/io5";

import {
  HiOutlineBookOpen,
  HiOutlineCalculator,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineHome,
  HiOutlineHeart,
  HiOutlineLightBulb,
  HiOutlineStar,
  HiOutlineUsers,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineSparkles,
  HiOutlineGift,
  HiOutlineCash,
  HiOutlineClipboardList,
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
} from "react-icons/hi";

import {
  RiMoonClearFill,
  RiSunFill,
  RiStarFill,
  RiCalendarCheckFill,
  RiBookOpenLine,
  RiMentalHealthLine,
  RiHandHeartLine,
  RiMoonFill,
} from "react-icons/ri";

// Export icon sets untuk kategori berbeda
export const RamadhanIcons = {
  // Dashboard & General
  Dashboard: HiOutlineSparkles,
  Clock: HiOutlineClock,
  Calendar: HiOutlineCalendar,
  CalendarCheck: BsCalendarCheck,
  QuickAction: FaBolt,
  
  // Waktu Sholat
  Imsak: BsMoonStarsFill,
  Subuh: BsSunriseFill,
  Maghrib: BsSunsetFill,
  Isya: IoMoon,
  Sunrise: HiOutlineSun,
  Sunset: IoSunnyOutline,
  
  // Ramadhan Status
  Moon: RiMoonClearFill,
  MoonOutline: HiOutlineMoon,
  Star: HiOutlineStar,
  StarFill: RiStarFill,
  Crescent: GiCrescent,
  
  // Ibadah
  Mosque: MdMosque,
  Prayer: GiPrayer,
  Tarawih: BsMoonStarsFill,
  Witir: GiStarFormation,
  Itikaf: HiOutlineHome,
  
  // Doa & Dzikir
  Doa: FaPrayingHands,
  Dzikir: RiBookOpenLine,
  Quran: FaQuran,
  Book: HiOutlineBookOpen,
  BookRead: BsBookHalf,
  
  // Puasa
  Fasting: MdFastfood,
  Iftar: MdOutlineRestaurant,
  Sahur: GiMeal,
  Water: MdWaterDrop,
  
  // Zakat & Sedekah
  Zakat: FaMoneyBillWave,
  ZakatMal: FaGem,
  Sedekah: FaHandHoldingHeart,
  Donate: RiHandHeartLine,
  Fidyah: HiOutlineClipboardList,
  Wallet: IoWalletOutline,
  Gift: HiOutlineGift,
  
  // Edukasi
  Education: HiOutlineAcademicCap,
  Lightbulb: HiOutlineLightBulb,
  Info: HiOutlineInformationCircle,
  
  // Actions
  Check: HiOutlineCheckCircle,
  CheckFill: FaCheckCircle,
  Heart: HiOutlineHeart,
  HeartFill: BsHeartFill,
  Users: HiOutlineUsers,
  
  // Calculator
  Calculator: HiOutlineCalculator,
  Calculate: MdOutlineCalculate,
  
  // Navigation
  ChevronDown: FaChevronDown,
  ChevronRight: FaChevronRight,
  Search: FaSearch,
  Close: FaTimes,
  
  // Asmaul Husna & Ayat
  AsmaulHusna: GiStarFormation,
  AyatKursi: FaBookOpen,
  Tadarus: BsListCheck,
  
  // Idul Fitri
  IdulFitri: HiOutlineSparkles,
  Celebration: HiOutlineGift,
  
  // Lailatul Qadar
  LailatulQadar: RiMoonClearFill,
  NightPower: BsMoonStarsFill,
};

export default RamadhanIcons;

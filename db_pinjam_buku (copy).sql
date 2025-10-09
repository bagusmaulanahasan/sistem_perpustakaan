-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 09, 2025 at 07:34 AM
-- Server version: 8.0.42-0ubuntu0.24.04.2
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_pinjam_buku`
--

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(100) NOT NULL,
  `publisher` varchar(100) DEFAULT NULL,
  `publication_year` year DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `category_id` int DEFAULT NULL,
  `cover_image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; -- DIUBAH DI SINI

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `title`, `author`, `publisher`, `publication_year`, `stock`, `category_id`, `cover_image_url`, `created_at`) VALUES
(1, 'Petualangan di Dunia Fantasi', 'Rina Wulandari', 'Gramedia', '2020', 9, 1, '/uploads/covers/cover_image-1759306877151-131979542.jpg', '2025-09-29 09:59:43'),
(2, 'Belajar Python untuk Pemula', 'Andi Nugroho', 'Informatika Press', '2022', 11, 3, '/uploads/covers/cover_image-1759398147713-433681563.jpeg', '2025-09-29 09:59:43'),
(3, 'Sejarah Nusantara', 'Dewi Kartika', 'Kompas', '2018', 7, 4, '/uploads/covers/cover_image-1759372424570-471149537.jpg', '2025-09-29 09:59:43'),
(4, 'Psikologi Anak Modern', 'Dr. Siti Aminah', 'Mizan', '2021', 3, 2, '/uploads/covers/cover_image-1759372391161-967245093.png', '2025-09-29 09:59:43'),
(5, 'Dongeng Horror Sebelum Tidur', 'Tono Prasetyo', 'Tiga Serangkai', '2018', 15, 5, '/uploads/covers/cover_image-1759307371890-369389190.png', '2025-09-29 09:59:43'),
(6, 'Tips & Trik Bertahan Hidup di Universitas Pamulang', 'NotNeverMan', 'PerpusUnpam', '2024', 7, 4, '/uploads/covers/cover_image-1759306754037-52500730.png', '2025-10-01 08:05:21'),
(7, 'Petualangan Si Kancil', 'R. A. Kosasih', 'Gramedia Kids', '2018', 14, 1, '/uploads/covers/cover_image-1759372336946-287319436.jpg', '2025-10-01 10:33:51'),
(10, 'Dunia Tanpa Batas', 'Mira Lesmana', 'Bentang Pustaka', '2021', 9, 3, '/uploads/covers/cover_image-1759372230641-18385117.jpg', '2025-10-01 10:33:51'),
(11, 'Fakta Menakjubkan Tentang Otak', 'Prof. Nina Kartika', 'IlmuPopuler', '2019', 7, 2, '/uploads/covers/cover_image-1759372283264-321657569.jpg', '2025-10-01 10:33:51'),
(12, 'Robot dan Anak Ajaib', 'T. Arief Pratama', 'AnakCerdas', '2023', 13, 1, '/uploads/covers/cover_image-1759360779846-605071448.jpeg', '2025-10-01 10:33:51'),
(13, 'Keindahan dalam sebuah Furniture', 'Lowsen Hayne', 'FurMaz', '2014', 8, 2, '/uploads/covers/cover_image-1759360829672-792749098.jpg', '2025-10-01 23:20:29'),
(14, 'The King Savannah', 'Drawd Edersoon', 'AnimalFams', '1978', 11, 2, '/uploads/covers/cover_image-1759392896204-380041856.jpg', '2025-10-02 08:14:56'),
(15, 'Sejarah Terbentuknya Amazon', 'Darwin Stelbert', 'Floridasx', '2004', 7, 4, '/uploads/covers/cover_image-1759397725975-527797301.webp', '2025-10-02 09:35:25');

-- --------------------------------------------------------

--
-- Table structure for table `borrowings`
--

CREATE TABLE `borrowings` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `book_id` int NOT NULL,
  `borrow_date` date NOT NULL,
  `due_date` date NOT NULL,
  `return_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; -- DIUBAH DI SINI

--
-- Dumping data for table `borrowings`
--

INSERT INTO `borrowings` (`id`, `user_id`, `book_id`, `borrow_date`, `due_date`, `return_date`) VALUES
(1, 1, 1, '2025-09-29', '2025-10-13', '2025-10-01'),
(2, 1, 2, '2025-09-29', '2025-10-13', NULL),
(3, 1, 6, '2025-10-01', '2025-10-15', NULL),
(6, 1, 5, '2025-10-02', '2025-10-16', '2025-10-02'),
(7, 4, 14, '2025-10-02', '2025-10-16', NULL),
(8, 4, 6, '2025-10-02', '2025-10-16', '2025-10-02'),
(9, 4, 1, '2025-10-02', '2025-10-16', NULL),
(10, 5, 12, '2025-10-02', '2025-10-16', '2025-10-02'),
(11, 5, 3, '2025-10-02', '2025-10-16', '2025-10-02'),
(12, 5, 11, '2025-10-02', '2025-10-16', '2025-10-02'),
(13, 5, 10, '2025-10-02', '2025-10-16', NULL),
(14, 1, 10, '2025-10-02', '2025-10-16', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; -- DIUBAH DI SINI

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(5, 'Anak-anak'),
(1, 'Fiksi'),
(2, 'Non-Fiksi'),
(7, 'Pertanian'),
(4, 'Sejarah'),
(3, 'Teknologi');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL, -- DIUBAH DI SINI
  `role` enum('admin','anggota') NOT NULL DEFAULT 'anggota',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; -- DIUBAH DI SINI

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Bagus Maulana', 'bagusmaulana320@gmail.com', '$2b$12$3II1xW9Fk0hKsK.bYo0cVeNZlQHDD.np7gKppzpJwaTpACVXuybaa', 'anggota', '2025-09-29 09:04:29'),
(2, 'admin', 'admin@gmail.com', '$2b$12$matnLhOkCzoy6Ve2oi91xeq4gs/2AbcqsjdbWt9K39aVPwGODxmda', 'admin', '2025-09-29 09:13:01'),
(3, 'testing123', 'testing123@gmail.com', '$2b$12$Q0HqBGxBLnFX.9RT75FctuhnALOrCcuyEr3tVPjNxXejIFeHYxE32', 'anggota', '2025-10-02 04:31:47'),
(4, 'Reysa', 'reysa@gmail.com', '$2b$12$zrTeACpqc3O2B57r6khYZu9RC1Rf.3X2a1RDYNfrJINNWr2xoPYmm', 'anggota', '2025-10-02 08:30:08'),
(5, 'davina', 'davina@gmail.com', '$2b$12$Eq.Yb6revX8avwGXJ6l6E.R/a4vrSDtkkYgYWKmkQFgC3335uCnoa', 'anggota', '2025-10-02 08:31:30');

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `book_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; -- DIUBAH DI SINI

--
-- Dumping data for table `wishlists`
--

INSERT INTO `wishlists` (`id`, `user_id`, `book_id`, `created_at`) VALUES
(4, 1, 4, '2025-09-29 10:04:42'),
(5, 1, 3, '2025-09-29 10:11:35'),
(8, 1, 5, '2025-09-29 10:18:42'),
(11, 1, 6, '2025-10-01 09:22:27'),
(12, 1, 2, '2025-10-01 10:49:18'),
(14, 4, 5, '2025-10-02 08:30:22'),
(15, 4, 13, '2025-10-02 08:30:28'),
(16, 4, 12, '2025-10-02 08:30:33'),
(17, 4, 14, '2025-10-02 08:30:40'),
(18, 5, 2, '2025-10-02 08:31:42'),
(19, 5, 6, '2025-10-02 08:31:47'),
(21, 5, 10, '2025-10-02 08:32:39'),
(22, 1, 10, '2025-10-02 09:42:47');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `borrowings`
--
ALTER TABLE `borrowings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `book_id` (`book_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_book_wish` (`user_id`,`book_id`),
  ADD KEY `book_id` (`book_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `borrowings`
--
ALTER TABLE `borrowings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `books_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `borrowings`
--
ALTER TABLE `borrowings`
  ADD CONSTRAINT `borrowings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrowings_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlists_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

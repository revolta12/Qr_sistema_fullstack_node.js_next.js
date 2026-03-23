-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 23 Mar 2026 pada 01.09
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sistema_absensi`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `absensi`
--

CREATE TABLE `absensi` (
  `id_prezensa` int(11) NOT NULL,
  `id_funsionario` int(11) NOT NULL,
  `data` date NOT NULL,
  `oras_tama` time DEFAULT NULL,
  `oras_sai` time DEFAULT NULL,
  `fatin` varchar(100) DEFAULT NULL,
  `status` enum('hadir','terlambat','izin','sakit','cuti','alpha') DEFAULT 'hadir',
  `observasaun` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `admin`
--

CREATE TABLE `admin` (
  `id_admin` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `naran` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `admin`
--

INSERT INTO `admin` (`id_admin`, `username`, `password`, `naran`, `created_at`) VALUES
(1, 'admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', '2026-01-31 14:19:00'),
(4, 'insio', '$2b$10$5iZFHsKxVHz2ZXufjV8pyuY4Io79zdGEtImG/iQDN7WCcCUtYMclC', 'inaso marques', '2026-02-07 00:02:49'),
(6, 'deonisio', '$2b$10$vmhofdZeBunNV8BDfTGz8.unYMruNvqMsoczZX0.5xHbQyVOx0Y2i', '', '2026-03-22 22:34:05');

-- --------------------------------------------------------

--
-- Struktur dari tabel `email_config`
--

CREATE TABLE `email_config` (
  `id_config` int(11) NOT NULL,
  `email_host` varchar(100) NOT NULL,
  `email_port` int(11) NOT NULL,
  `email_user` varchar(100) NOT NULL,
  `email_password` varchar(255) NOT NULL,
  `email_from_name` varchar(100) DEFAULT 'Sistema Absensi QR',
  `status_aktif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `gaji`
--

CREATE TABLE `gaji` (
  `id_gaji` int(11) NOT NULL,
  `id_funsionario` int(11) NOT NULL,
  `fulan` int(11) NOT NULL,
  `tinan` int(11) NOT NULL,
  `salariu_baziku` decimal(12,2) NOT NULL,
  `total_prezente` int(11) DEFAULT 0,
  `total_tatraza` int(11) DEFAULT 0,
  `potongan` decimal(12,2) DEFAULT 0.00,
  `bonus` decimal(12,2) DEFAULT 0.00,
  `gaji_final` decimal(12,2) NOT NULL,
  `status` enum('pending','dibayar') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `system_logs`
--

CREATE TABLE `system_logs` (
  `id_log` int(11) NOT NULL,
  `nivel` enum('info','warning','error') DEFAULT 'info',
  `modulo` varchar(50) NOT NULL,
  `mensagem` text NOT NULL,
  `detalhes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detalhes`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `system_logs`
--

INSERT INTO `system_logs` (`id_log`, `nivel`, `modulo`, `mensagem`, `detalhes`, `created_at`) VALUES
(1, 'info', 'DATABASE', 'Sistema database inisializa ho susesu', NULL, '2026-01-31 14:19:00'),
(2, 'info', 'SYSTEM', 'Sistema Absensi QR lansamentu', NULL, '2026-01-31 14:19:00');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tb_funsionario`
--

CREATE TABLE `tb_funsionario` (
  `id_funsionario` int(11) NOT NULL,
  `naran_funsionario` varchar(100) NOT NULL,
  `data_moris` date NOT NULL,
  `jeneru` enum('M','F') NOT NULL,
  `email` varchar(100) NOT NULL,
  `no_telp` varchar(20) NOT NULL,
  `posisaun` varchar(50) NOT NULL,
  `departamentu` varchar(50) NOT NULL,
  `salariu_baziku` decimal(12,2) NOT NULL,
  `data_rejistu` date NOT NULL,
  `status_aktif` tinyint(1) DEFAULT 1,
  `alamat` text DEFAULT NULL,
  `qr_code` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `absensi`
--
ALTER TABLE `absensi`
  ADD PRIMARY KEY (`id_prezensa`),
  ADD KEY `idx_data` (`data`),
  ADD KEY `idx_funsionario` (`id_funsionario`);

--
-- Indeks untuk tabel `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id_admin`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indeks untuk tabel `email_config`
--
ALTER TABLE `email_config`
  ADD PRIMARY KEY (`id_config`);

--
-- Indeks untuk tabel `gaji`
--
ALTER TABLE `gaji`
  ADD PRIMARY KEY (`id_gaji`),
  ADD UNIQUE KEY `unique_gaji` (`id_funsionario`,`fulan`,`tinan`);

--
-- Indeks untuk tabel `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `idx_nivel` (`nivel`),
  ADD KEY `idx_modulo` (`modulo`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indeks untuk tabel `tb_funsionario`
--
ALTER TABLE `tb_funsionario`
  ADD PRIMARY KEY (`id_funsionario`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `qr_code` (`qr_code`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `absensi`
--
ALTER TABLE `absensi`
  MODIFY `id_prezensa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `admin`
--
ALTER TABLE `admin`
  MODIFY `id_admin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `email_config`
--
ALTER TABLE `email_config`
  MODIFY `id_config` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `gaji`
--
ALTER TABLE `gaji`
  MODIFY `id_gaji` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id_log` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `tb_funsionario`
--
ALTER TABLE `tb_funsionario`
  MODIFY `id_funsionario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `absensi`
--
ALTER TABLE `absensi`
  ADD CONSTRAINT `absensi_ibfk_1` FOREIGN KEY (`id_funsionario`) REFERENCES `tb_funsionario` (`id_funsionario`);

--
-- Ketidakleluasaan untuk tabel `gaji`
--
ALTER TABLE `gaji`
  ADD CONSTRAINT `gaji_ibfk_1` FOREIGN KEY (`id_funsionario`) REFERENCES `tb_funsionario` (`id_funsionario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

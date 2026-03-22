// Application constants
export const APP_CONFIG = {
  APP_NAME: 'Sistema Absensi QR',
  VERSION: '1.0.0',
};

export const EMPLOYEE_POSITIONS = [
  'Director',
  'Manager',
  'Supervisor',
  'Staff',
  'Driver',
  'Security',
  'Cleaner'
];

export const DEPARTMENTS = [
  'Administrasaun',
  'Finansas',
  'RH',
  'TI',
  'Operasaun',
  'Marketing',
  'Vendas'
];

export const ATTENDANCE_STATUS = {
  HADIR: 'hadir',
  TERLAMBAT: 'terlambat',
  IZIN: 'izin',
  SAKIT: 'sakit',
  CUTI: 'cuti',
  ALPHA: 'alpha'
};

export const ATTENDANCE_STATUS_LABELS = {
  [ATTENDANCE_STATUS.HADIR]: 'Hadir',
  [ATTENDANCE_STATUS.TERLAMBAT]: 'Terlambat',
  [ATTENDANCE_STATUS.IZIN]: 'Izin',
  [ATTENDANCE_STATUS.SAKIT]: 'Sakit',
  [ATTENDANCE_STATUS.CUTI]: 'Cuti',
  [ATTENDANCE_STATUS.ALPHA]: 'Alpha'
};

export const ATTENDANCE_STATUS_COLORS = {
  [ATTENDANCE_STATUS.HADIR]: 'success',
  [ATTENDANCE_STATUS.TERLAMBAT]: 'warning',
  [ATTENDANCE_STATUS.IZIN]: 'info',
  [ATTENDANCE_STATUS.SAKIT]: 'secondary',
  [ATTENDANCE_STATUS.CUTI]: 'info',
  [ATTENDANCE_STATUS.ALPHA]: 'secondary'
};

export const MANUAL_ATTENDANCE_STATUS = {
  IZIN: 'izin',
  SAKIT: 'sakit', 
  CUTI: 'cuti'
};

export const MANUAL_ATTENDANCE_STATUS_LABELS = {
  [MANUAL_ATTENDANCE_STATUS.IZIN]: 'Izin',
  [MANUAL_ATTENDANCE_STATUS.SAKIT]: 'Sakit',
  [MANUAL_ATTENDANCE_STATUS.CUTI]: 'Cuti'
};

export const MANUAL_ATTENDANCE_STATUS_DESCRIPTIONS = {
  [MANUAL_ATTENDANCE_STATUS.SAKIT]: 'Funsionario moras',
  [MANUAL_ATTENDANCE_STATUS.IZIN]: 'Funsionario husi permisasu',
  [MANUAL_ATTENDANCE_STATUS.CUTI]: 'Funsionario iha direitu deskansa'
};

export const MONTHS = [
  'Janeiru', 'Fevereiru', 'Marsu', 'Abril', 'Maiu', 'Junhu',
  'Julhu', 'Agustu', 'Setembru', 'Outubru', 'Novembru', 'Dezembru'
];
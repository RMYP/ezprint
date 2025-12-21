const hitungEstimasiWaktu = (impresi: number, isWarna: boolean, isDuplex: boolean, jumlahJilid: number) => {
  const CONSTANT = -257.207;
  const COEFF_IMPRESI = 14.416;
  const COEFF_WARNA = 637.799;
  const COEFF_SISI = 253.881;
  const COEFF_JILID = 476.658;

  const valWarna = isWarna ? 1 : 0;
  const valSisi = isDuplex ? 1 : 0; 

  let estimasiDetik = CONSTANT + 
                      (COEFF_IMPRESI * impresi) + 
                      (COEFF_WARNA * valWarna) + 
                      (COEFF_SISI * valSisi) + 
                      (COEFF_JILID * jumlahJilid);

  
  if (estimasiDetik < 0) estimasiDetik = 0;

  return Math.ceil(estimasiDetik); 
};

const waktu = hitungEstimasiWaktu(30, true, false, 1);
console.log(`Estimasi Waktu: ${waktu} detik`);
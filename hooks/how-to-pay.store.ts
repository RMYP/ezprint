import { create } from "zustand";
const payment_instructions = [
  {
    bank: "BRI",
    methods: [
      {
        type: "ATM",
        steps: [
          "Masukkan kartu ATM dan PIN.",
          "Pilih 'Transaksi Lain' → 'Pembayaran' → 'Lainnya'.",
          "Pilih 'BRIVA'.",
          "Masukkan Nomor Virtual Account (VA) dan tekan 'Benar'.",
          "Periksa detail pembayaran, lalu pilih 'Ya' untuk konfirmasi.",
          "Transaksi selesai, simpan struk sebagai bukti pembayaran.",
        ],
      },
      {
        type: "Mobile Banking (BRImo)",
        steps: [
          "Login ke aplikasi BRImo.",
          "Pilih menu 'BRIVA'.",
          "Masukkan Nomor VA dan nominal akan muncul otomatis.",
          "Konfirmasi detail pembayaran, lalu tekan 'Bayar'.",
          "Masukkan PIN BRImo untuk menyelesaikan transaksi.",
        ],
      },
      {
        type: "Internet Banking",
        steps: [
          "Login ke Internet Banking BRI.",
          "Pilih menu 'Pembayaran' → 'BRIVA'.",
          "Masukkan Nomor VA dan cek detail pembayaran.",
          "Konfirmasi dan masukkan mToken untuk menyelesaikan transaksi.",
        ],
      },
    ],
  },
  {
    bank: "BNI",
    methods: [
      {
        type: "ATM",
        steps: [
          "Masukkan kartu ATM dan PIN.",
          "Pilih 'Menu Lain' → 'Transfer' → 'Virtual Account Billing'.",
          "Masukkan Nomor VA dan tekan 'Benar'.",
          "Cek detail pembayaran, lalu tekan 'Ya' untuk konfirmasi.",
          "Simpan struk sebagai bukti pembayaran.",
        ],
      },
      {
        type: "Mobile Banking (BNI Mobile)",
        steps: [
          "Login ke aplikasi BNI Mobile Banking.",
          "Pilih 'Transfer' → 'Virtual Account Billing'.",
          "Masukkan Nomor VA, cek detail pembayaran, lalu tekan 'Lanjut'.",
          "Masukkan PIN transaksi untuk konfirmasi.",
        ],
      },
      {
        type: "Internet Banking",
        steps: [
          "Login ke Internet Banking BNI.",
          "Pilih menu 'Transfer' → 'Virtual Account Billing'.",
          "Masukkan Nomor VA dan konfirmasi detail pembayaran.",
          "Masukkan Token BNI untuk menyelesaikan transaksi.",
        ],
      },
    ],
  },
  {
    bank: "BCA",
    methods: [
      {
        type: "ATM",
        steps: [
          "Masukkan kartu ATM dan PIN.",
          "Pilih 'Transaksi Lainnya' → 'Transfer' → 'Ke Rekening BCA Virtual Account'.",
          "Masukkan Nomor VA dan tekan 'Benar'.",
          "Cek detail transaksi, lalu tekan 'Ya'.",
          "Simpan struk sebagai bukti pembayaran.",
        ],
      },
      {
        type: "Mobile Banking (m-BCA)",
        steps: [
          "Login ke aplikasi m-BCA.",
          "Pilih 'm-Transfer' → 'BCA Virtual Account'.",
          "Masukkan Nomor VA, cek detail pembayaran, lalu klik 'Send'.",
          "Masukkan PIN m-BCA untuk konfirmasi.",
        ],
      },
      {
        type: "Internet Banking (KlikBCA)",
        steps: [
          "Login ke KlikBCA.",
          "Pilih 'Transfer Dana' → 'Transfer ke BCA Virtual Account'.",
          "Masukkan Nomor VA, cek detail, lalu klik 'Lanjutkan'.",
          "Masukkan KeyBCA Response untuk menyelesaikan pembayaran.",
        ],
      },
    ],
  },
  {
    bank: "Permata",
    methods: [
      {
        type: "ATM",
        steps: [
          "Masukkan kartu ATM dan PIN.",
          "Pilih 'Transaksi Lainnya' → 'Pembayaran' → 'Virtual Account'.",
          "Masukkan Nomor VA dan tekan 'Benar'.",
          "Konfirmasi detail pembayaran, lalu tekan 'Ya'.",
          "Simpan struk sebagai bukti pembayaran.",
        ],
      },
      {
        type: "Mobile Banking (Permata Mobile X)",
        steps: [
          "Login ke aplikasi Permata Mobile X.",
          "Pilih 'Pembayaran' → 'Virtual Account'.",
          "Masukkan Nomor VA, lalu cek detail transaksi.",
          "Konfirmasi dan masukkan PIN untuk menyelesaikan pembayaran.",
        ],
      },
      {
        type: "Internet Banking",
        steps: [
          "Login ke Internet Banking Permata.",
          "Pilih menu 'Pembayaran' → 'Virtual Account'.",
          "Masukkan Nomor VA, cek detail pembayaran, lalu klik 'Lanjut'.",
          "Masukkan kode OTP untuk konfirmasi.",
        ],
      },
    ],
  },
  {
    bank: "Mandiri",
    methods: [
      {
        type: "ATM",
        steps: [
          "Masukkan kartu ATM dan PIN.",
          "Pilih 'Bayar/Beli' → 'Lainnya' → 'Multi Payment'.",
          "Masukkan Kode Perusahaan Midtrans (70012).",
          "Masukkan Nomor VA, cek detail pembayaran, lalu tekan 'Ya'.",
          "Simpan struk sebagai bukti pembayaran.",
        ],
      },
      {
        type: "Mobile Banking (Livin' by Mandiri)",
        steps: [
          "Login ke aplikasi Livin' by Mandiri.",
          "Pilih 'Bayar' → 'Multi Payment'.",
          "Pilih penyedia jasa 'Midtrans', lalu masukkan Nomor VA.",
          "Cek detail pembayaran dan konfirmasi dengan MPIN.",
        ],
      },
      {
        type: "Internet Banking",
        steps: [
          "Login ke Mandiri Internet Banking.",
          "Pilih menu 'Pembayaran' → 'Multi Payment'.",
          "Masukkan Kode Perusahaan (70012) dan Nomor VA.",
          "Konfirmasi detail pembayaran, lalu masukkan Token Mandiri untuk menyelesaikan transaksi.",
        ],
      },
    ],
  },
  {
    bank: "CIMB Niaga",
    methods: [
      {
        type: "ATM",
        steps: [
          "Masukkan kartu ATM dan PIN.",
          "Pilih 'Transfer' → 'Rekening CIMB Niaga Lain'.",
          "Masukkan Nomor VA, lalu tekan 'Benar'.",
          "Konfirmasi detail pembayaran, lalu pilih 'Ya'.",
          "Simpan struk sebagai bukti pembayaran.",
        ],
      },
      {
        type: "Mobile Banking (OCTO Mobile)",
        steps: [
          "Login ke aplikasi OCTO Mobile.",
          "Pilih 'Transfer' → 'Ke Rekening CIMB Niaga'.",
          "Masukkan Nomor VA, cek detail pembayaran, lalu klik 'Lanjut'.",
          "Konfirmasi dengan PIN OCTO untuk menyelesaikan transaksi.",
        ],
      },
      {
        type: "Internet Banking (OCTO Clicks)",
        steps: [
          "Login ke OCTO Clicks.",
          "Pilih menu 'Transfer' → 'Rekening CIMB Niaga'.",
          "Masukkan Nomor VA, cek detail pembayaran, lalu klik 'Kirim'.",
          "Konfirmasi dengan OTP untuk menyelesaikan transaksi.",
        ],
      },
    ],
  },
];

interface PaymentInstructionDetail {
  paymentInstruction: {
    bank: string;
    methods: {
      type: string;
      steps: string[];
    }[];
  }[];
  neededPaymentInstruction: {
    bank: string;
    methods: {
      type: string;
      steps: string[];
    }[];
  } | null;

  getPaymentInstruction: (bank: string) => void;
}


export const usePaymentInstruction = create<PaymentInstructionDetail>(
  (set) => ({
    paymentInstruction: payment_instructions,
    neededPaymentInstruction: null,

    getPaymentInstruction: (bank) => {
      console.log(bank)
      set((state) => {
        const needed = state.paymentInstruction.find(
          (item) => item.bank.toLowerCase() === bank.toLowerCase()
        );

        return {
          ...state,
          neededPaymentInstruction: needed || null,
        };
      });
    },
  })
);

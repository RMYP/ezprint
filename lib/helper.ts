export const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }

  if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  }

  console.log(cleaned)
  return cleaned;
};

export const formatEstimation = (seconds: number) => {
    const totalMinutes = Math.ceil(seconds / 60);

    if (totalMinutes < 60) {
        return `${totalMinutes} Menit`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    if (remainingMinutes === 0) {
        return `${hours} Jam`;
    }

    return `${hours} Jam ${remainingMinutes} Menit`;
};
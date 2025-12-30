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
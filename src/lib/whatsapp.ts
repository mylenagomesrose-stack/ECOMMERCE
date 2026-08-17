const PHONE = "5500000000000";

export function whatsappLink(message: string) {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}

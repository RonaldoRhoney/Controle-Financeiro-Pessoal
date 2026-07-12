export type Bank = {
  id: string;
  name: string;
  url: string;
  color: string;
  short: string;
};

// URLs oficiais de acesso web / internet banking dos principais bancos brasileiros.
export const DEFAULT_BANKS: Bank[] = [
  { id: "nubank", name: "Nubank", url: "https://app.nubank.com.br/", color: "#820AD1", short: "Nu" },
  { id: "itau", name: "Itaú", url: "https://www.itau.com.br/", color: "#EC7000", short: "It" },
  { id: "bradesco", name: "Bradesco", url: "https://banco.bradesco/", color: "#CC092F", short: "Br" },
  { id: "santander", name: "Santander", url: "https://www.santander.com.br/", color: "#EC0000", short: "Sa" },
  { id: "bb", name: "Banco do Brasil", url: "https://www.bb.com.br/", color: "#FFEF38", short: "BB" },
  { id: "caixa", name: "Caixa", url: "https://internetbanking.caixa.gov.br/", color: "#0070AF", short: "Cx" },
  { id: "inter", name: "Banco Inter", url: "https://internetbanking.bancointer.com.br/", color: "#FF7A00", short: "In" },
  { id: "c6", name: "C6 Bank", url: "https://www.c6bank.com.br/", color: "#242424", short: "C6" },
  { id: "btg", name: "BTG Pactual", url: "https://www.btgpactualdigital.com/", color: "#00203F", short: "BTG" },
  { id: "picpay", name: "PicPay", url: "https://app.picpay.com/", color: "#21C25E", short: "Pp" },
  { id: "mercadopago", name: "Mercado Pago", url: "https://www.mercadopago.com.br/", color: "#00B1EA", short: "MP" },
  { id: "sicoob", name: "Sicoob", url: "https://www.sicoob.com.br/", color: "#003641", short: "Sc" },
  { id: "sicredi", name: "Sicredi", url: "https://www.sicredi.com.br/", color: "#3FA535", short: "Sr" },
  { id: "next", name: "Next", url: "https://next.me/", color: "#00FF5F", short: "Nx" },
  { id: "will", name: "Will Bank", url: "https://www.willbank.com.br/", color: "#00E0A1", short: "Wb" },
  { id: "safra", name: "Safra", url: "https://www.safra.com.br/", color: "#003399", short: "Sf" },
];

const KEY_FAVS = "finwise.banks.favorites";
const KEY_CUSTOM = "finwise.banks.custom";

export function loadFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_FAVS);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_FAVS, JSON.stringify(ids));
}

export function loadCustomBanks(): Bank[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_CUSTOM);
    return raw ? (JSON.parse(raw) as Bank[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomBanks(banks: Bank[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_CUSTOM, JSON.stringify(banks));
}

export function normalizeUrl(input: string): string {
  const v = input.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

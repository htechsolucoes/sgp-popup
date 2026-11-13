// Configurações por provedor (variáveis de ambiente de cada deploy).

// VITE_FEATURE_WIFI controla tudo que usa o Gerenciador CPE: bloco de Wi-Fi e "Reiniciar roteador".
export const features = {
  wifi: import.meta.env.VITE_FEATURE_WIFI === "true"
};

// Nome(s) do campo personalizado do contato que guarda o CPF/CNPJ.
// Aceita vários separados por vírgula; usa o primeiro preenchido. Padrão: "cpf-cnpj".
export const CPF_FIELDS = String(import.meta.env.VITE_CPF_FIELD || "cpf-cnpj")
  .split(",")
  .map(name => name.trim())
  .filter(Boolean);
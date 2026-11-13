// Funcionalidades ligadas/desligadas por provedor (variáveis de ambiente de cada deploy).
// VITE_FEATURE_WIFI controla tudo que usa o Gerenciador CPE: bloco de Wi-Fi e "Reiniciar roteador".
export const features = {
  wifi: import.meta.env.VITE_FEATURE_WIFI === "true"
};
import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Fixa a raiz do Turbopack neste projeto (evita conflito com package-lock.json
  // encontrado em diretórios pais).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

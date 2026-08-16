import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit lê arquivos .afm de fonte relativos ao seu próprio node_modules em runtime —
  // sem isso, o bundler do Turbopack move o código e o require relativo (__dirname) do
  // pacote aponta pro lugar errado (ENOENT ao abrir Helvetica.afm).
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;

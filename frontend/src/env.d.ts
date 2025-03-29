/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS: string;
  readonly VITE_HARDHAT_TOKEN_ADDRESS: string;
  readonly VITE_HARDHAT_SWAP_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 
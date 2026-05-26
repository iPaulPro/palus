import tailwindcss from "@tailwindcss/vite";
// import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const codeSplittingGroups = [
  { name: "apollo", test: /node_modules\/@apollo\// },
  { name: "indexer", test: /packages\/indexer/ },
  {
    name: "react",
    test: /node_modules\/(?:react|react-dom|react-is|scheduler)\//
  },
  {
    name: "react-libs",
    test: /node_modules\/(?:react-router|react-hook-form|react-hotkeys-hook|react-tracked|react-easy-crop|react-simple-pull-to-refresh|react-helmet-async|react-device-detect|react-photo-view|zustand|@uidotdev\/usehooks|@hookform\/resolvers)\//
  },
  { name: "viem", test: /node_modules\/viem/ },
  { name: "wagmi", test: /node_modules\/(?:wagmi|@wagmi\/)/ },
  { name: "motion", test: /node_modules\/(?:motion|framer-motion)/ },
  { name: "zod", test: /node_modules\/zod/ },
  { name: "headlessui", test: /node_modules\/@headlessui\// },
  {
    name: "ui",
    test: /node_modules\/(?:@radix-ui\/|sonner|virtua|html-to-image|browser-image-compression|plur|dayjs|qr|shadcn)/
  },
  { name: "hls-js", test: /node_modules\/hls\.js/ },
  { name: "media", test: /node_modules\/(?:@livepeer\/|howler)/ },
  { name: "phosphor", test: /node_modules\/@phosphor-icons\// },
  { name: "heroicons", test: /node_modules\/@heroicons\// },
  { name: "metamask", test: /node_modules\/@metamask\// },
  { name: "lens", test: /node_modules\/(?:@lens-chain|@lens-protocol)\// },
  { name: "lens-modules", test: /node_modules\/lens-modules/ },
  { name: "prosemirror", test: /node_modules\/prosemirror-/ },
  {
    name: "editor",
    test: /node_modules\/(?:@prosekit\/|prosekit|unified|react-markdown)/
  },
  { name: "walletconnect-utils", test: /node_modules\/@walletconnect\/utils/ },
  { name: "walletconnect-core", test: /node_modules\/@walletconnect\/core/ },
  { name: "walletconnect", test: /node_modules\/@walletconnect\// },
  {
    name: "reown-controllers",
    test: /node_modules\/@reown\/appkit-controllers/
  },
  { name: "reown-ui", test: /node_modules\/@reown\/appkit-ui/ },
  { name: "reown", test: /node_modules\/@reown\// },
  { name: "thirdweb", test: /node_modules\/@thirdweb-dev\// },
  { name: "tanstack", test: /node_modules\/@tanstack\// },
  {
    name: "markdown",
    test: /node_modules\/(?:remark-|rehype-|strip-markdown)/
  },
  {
    name: "tailwind",
    test: /node_modules\/(?:tailwindcss|tailwind-merge|@tailwindcss\/|clsx|class-variance-authority)/
  },
  {
    name: "shared-components",
    test: /src\/components\/Shared/
  }
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: codeSplittingGroups
          },
          strictExecutionOrder: true
        }
      },
      sourcemap: env.VITE_SOURCEMAP === "1" ? "hidden" : false,
      target: "esnext"
    },
    plugins: [
      react(),
      tailwindcss()
      //, basicSsl()
      //, visualizer({
      //   filename: "dist/stats.html",
      //   open: true,
      //   template: "flamegraph"
      // })
    ],
    preview: {
      allowedHosts: ["palus.app", "www.palus.app"]
    },
    resolve: {
      tsconfigPaths: true
    }
    //, server: {
    //   host: true,
    //   https: true
    // }
  };
});

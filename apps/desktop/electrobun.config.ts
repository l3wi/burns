const config = {
  app: {
    name: "Mr. Burns",
    identifier: "com.mrburns.desktop",
    version: "0.1.0",
    urlSchemes: ["mrburns"],
  },
  build: {
    bun: {
      entrypoint: "./src/main.ts",
    },
    mac: {
      icons: "./icon.iconset",
    },
    copy: {
      "../web/dist": "views",
      "../web/public": "views/public",
    },
  },
  scripts: {
    preBuild: "./scripts/prebuild-web.ts",
    postBuild: "./scripts/copy-web-assets.ts",
  },
};

export default config;

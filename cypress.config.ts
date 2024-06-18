import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
    },
    viewportWidth: 1200,
    viewportHeight: 800,
    video: true,
    videoCompression: 15,
    reporter: "cypress-multi-reporters",
    screenshotsFolder: "public/images",
    videosFolder: "public/videos",
    reporterOptions: {
      reporterEnabled: "mochawesome",
      mochawesomeReporterOptions: {
        reportDir: "cypress/results/json",
        "overwrite": false,
        html: false,
        json: true,
        embeddedScreenshots: true
      },
    },
  },
});

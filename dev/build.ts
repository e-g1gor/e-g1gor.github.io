import fs = require("fs-extra");
import pug from "pug";
import sass from "sass";
import MarkdownIt from "markdown-it";
import { IArgs } from "./build.types";
import { ISocialData, ICVData } from "./template.types";
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  langPrefix: "highlight-",
});

// Parse build options from arguments
const argv: IArgs = require("minimist")(process.argv.slice(2));
const {
  html: HTML = false,
  pdf: PDF = false,
  css: CSS = false,
  watch: WATCH = false,
  cv: CV = "junior-js_ts-dev",
  o: OUTPUT_DIR = "dist",
  l: LOG_LEVEL = 0,
} = argv;
const CV_DATA_ROOT: string = "./src/cv-data";
const CV_VERSION_ROOT: string = `${CV_DATA_ROOT}/cvs/${CV}`;
// Print build options
console.log("\nBuild Options:", {
  HTML,
  PDF,
  CSS,
  WATCH,
  OUTPUT_DIR,
  CV,
  CV_DATA_ROOT,
  CV_VERSION_ROOT,
  LOG_LEVEL,
});

const SOCIAL_DATA: ISocialData = fs.readJsonSync(`${CV_DATA_ROOT}/social.json`);
const CV_DATA: ICVData = fs.readJsonSync(`${CV_VERSION_ROOT}/data.json`);
const DATA: ICVData & { social: ISocialData } = Object.assign(
  {},
  { social: SOCIAL_DATA },
  CV_DATA
);

if (LOG_LEVEL > 2) {
  console.log({
    SOCIAL_DATA,
    CV_DATA,
  });
}

if (HTML) {
  // Render Markdown layout files
  {
    console.log("\nMarkdown -> HTML: Started");
    function tryRenderMarkdown(raw: string): string | false {
      if (!fs.pathExistsSync(raw)) return false;
      const descriptionRaw: string = fs.readFileSync(raw).toString();
      return md.render(descriptionRaw, { html: true });
    }
    // Render about content
    const about_content: string = fs
      .readFileSync(`${CV_DATA_ROOT}/about.md`)
      .toString();
    DATA.about.content = md.render(about_content);
    // Render section descripptions
    for (const section of CV_DATA.sections) {
      if (section.layout == "text") {
        const contentPath: string = `${CV_VERSION_ROOT}/${section.title}.md`;
        const content: string | false = tryRenderMarkdown(contentPath);
        if (LOG_LEVEL > 2)
          console.log("Markdown render: Layout file " + section.title, {
            contentPath: contentPath,
            content: content,
          });
        if (!content) continue;
        section.content = content;
      } else {
        for (const item of section.content) {
          const descPath: string = `${CV_VERSION_ROOT}/${section.title}/${item.title}.md`;
          const description: string | false = tryRenderMarkdown(descPath);
          if (!description) continue;
          item.description = description;
        }
      }
    }
    console.log("Markdown -> HTML: Finished");
  }
  console.log("\nPugJS -> HTML: Started");
  // Compile template
  const compiledFunction = pug.compileFile("./src/index.pug");
  // Render with a set of data
  const htmlContent = compiledFunction(DATA);
  // Save html content
  fs.outputFileSync(`./${OUTPUT_DIR}/index.html`, htmlContent);
  console.log("PugJS -> HTML: Finished");
}

if (CSS) {
  console.log("\nSass -> CSS: Started");
  // Compile SCSS
  const cssContent = sass.compile("./src/scss/modern-resume-theme.scss");
  // Save CSS content
  fs.outputFileSync(`./${OUTPUT_DIR}/main.css`, cssContent.css);
  console.log("Sass -> CSS: Finished");
}

import fs = require("fs-extra");
import pug from "pug";
import sass from "sass";
import MarkdownIt from "markdown-it";
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  langPrefix: "highlight-",
});

const argv = require("minimist")(process.argv.slice(2));
const {
  cv: CV = "junior-js_ts-dev",
  html: HTML,
  pdf: PDF,
  css: CSS,
  template,
} = argv;
const CV_DATA_ROOT: string = "./src/cv-data";
const CV_VERSION_ROOT: string = `${CV_DATA_ROOT}/cvs/${CV}`;

console.log({
  CV,
  HTML,
  PDF,
  CSS,
  template,
});

// const TEMPLATE = template ?? ;
interface ICVData {
  about?: string;
  level?: "Junior" | "Middle" | "Senior";
  position?: string;
  name?: string;
  sections: Array<{
    title: string;
    layout: "projects" | "list" | "text";
    content: Array<{
      title: string;
      description?: string;
      layout?: "top-middle" | "left" | "right";
      border?: "weak" | string;
      role?: "Developer" | string;
      quote?: string;
    }>;
  }>;
}

interface SocialData {
  linkedin?: string;
  github?: string;
}

const SOCIAL_DATA: SocialData = fs.readJsonSync(`${CV_DATA_ROOT}/social.json`);
const CV_DATA: ICVData = fs.readJsonSync(`${CV_VERSION_ROOT}/data.json`);
const DATA: ICVData & { social: SocialData } = Object.assign(
  {},
  { social: SOCIAL_DATA },
  CV_DATA
);

console.log({
  SOCIAL_DATA,
  CV_DATA,
});

// Render Markdown templates

// Render about content
const about: string = fs.readFileSync(`${CV_DATA_ROOT}/about.md`).toString();
DATA.about = about;
// Render section descripptions
for (const projectsSection of CV_DATA.sections.filter(
  (section) => section.layout == "projects"
)) {
  for (const project of projectsSection.content) {
    const projectDescriptionPath: string = `$${CV_VERSION_ROOT}/projects/${project.title}.md`;
    if (!fs.pathExistsSync(projectDescriptionPath)) continue;
    const descriptionRaw: string = fs
      .readFileSync(projectDescriptionPath)
      .toString();
    const description: string = md.render(descriptionRaw, { html: true });
    project.description = description;
  }
}

if (HTML) {
  // Compile template
  const compiledFunction = pug.compileFile("./src/index.pug");
  // Render with a set of data
  const htmlContent = compiledFunction(DATA);
  // Save html content
  fs.outputFileSync("./dist/index.html", htmlContent);
}

if (CSS) {
  // Compile SCSS
  const cssContent = sass.compile("./src/scss/modern-resume-theme.scss");
  // Save CSS content
  fs.outputFileSync("./dist/main.css", cssContent.css);
}

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

interface SectionCommon {
  layout: "projects" | "list" | "text";
  title: string;
}

interface IItemCommon {
  title: string;
  layout?: "top-middle" | "left" | "right";
}

interface ListItem extends IItemCommon {
  description?: string;
  border?: "weak" | string;
  role?: "Developer" | string;
  quote?: string;
}

interface ListSection extends SectionCommon {
  layout: "projects" | "list";
  content: Array<ListItem>;
}

interface TextSection extends SectionCommon {
  layout: "text";
  content?: string;
}

interface ICVData {
  about: {
    content: string;
    title?: string;
    profile_photo?: string;
  };
  level?: "Junior" | "Middle" | "Senior";
  position?: string;
  name?: string;
  sections: Array<ListSection | TextSection>;
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

// Render Markdown templates
{
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
      console.log({ contentPath: contentPath, content: content });
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
}

console.log({
  SOCIAL_DATA,
  CV_DATA,
  // sections: CV_DATA.sections,
});

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

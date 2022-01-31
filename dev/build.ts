const argv = require("minimist")(process.argv.slice(2));
const { cv: CV = "junior-js_ts-dev", html: HTML, psf: PDF, template } = argv;
// const TEMPLATE = template ?? ;
import fs = require("fs-extra");
const pug = require("pug");

interface ICVData {
  level?: "Junior" | "Middle" | "Senior";
  position?: string;
  name?: string;
}

interface SocialData {
  linkedin?: string;
  github?: string;
}

const SOCIAL_DATA: SocialData = fs.readJsonSync(`./src/cv-data/social.json`);
const CV_DATA: ICVData = fs.readJsonSync(`./src/cv-data/cvs/${CV}/data.json`);
const DATA = Object.assign({}, { social: SOCIAL_DATA }, CV_DATA);

// Compile template
const compiledFunction = pug.compileFile("./src/index.pug");
// Render with a set of data
const htmlContent = compiledFunction(DATA);
// Save html content
fs.outputFileSync("./dist/index.html", htmlContent);

console.log({
  SOCIAL_DATA,
  CV_DATA,
});

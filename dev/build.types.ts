export interface IArgs {
  /**
   * Enable HTML compiling from PugJS templates and Markdown
   */
  html: boolean;
  /**
   * TODO: implement pdf export (puppeteer)
   */
  pdf: boolean;
  /**
   * Enable CSS compiling from SASS sources
   */
  css: boolean;
  /**
   * TODO: implement livereload for development
   */
  watch: boolean;
  /**
   * CV template name (stored in `./src/cv-data/cvs`)
   */
  cv: string;
  /**
   * Output directory path
   */
  o: string;
  /**
   * Log level: 1 - info, 2 - debug, 3 - verbose
   */
  l: 0 | 1 | 2;
}

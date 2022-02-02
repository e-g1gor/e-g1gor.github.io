export interface SectionCommon {
  layout: "projects" | "list" | "text";
  title: string;
}

export interface IItemCommon {
  title: string;
  layout?: "top-middle" | "left" | "right";
}

export interface ListItem extends IItemCommon {
  description?: string;
  border?: "weak" | string;
  role?: "Developer" | string;
  quote?: string;
}

export interface ListSection extends SectionCommon {
  layout: "projects" | "list";
  content: Array<ListItem>;
}

export interface TextSection extends SectionCommon {
  layout: "text";
  content?: string;
}

export interface ICVData {
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

export interface ISocialData {
  linkedin?: string;
  github?: string;
}

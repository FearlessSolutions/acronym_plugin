//reference location for acronym files for the entire extension
const fileReference = [
  {
    ref: "default",
    name: "None (only include the default)",
    default: true,
    url:
      "https://raw.githubusercontent.com/FearlessSolutions/acronym_plugin/master/acronyms/fearless.json",
  },
  {
    ref: "cms",
    name: "CMS Portfolio",
    default: false,
    url:
      "https://raw.githubusercontent.com/FearlessSolutions/acronym_plugin/master/acronyms/cms.json",
  },
  {
    ref: "software",
    name: "Software",
    default: false,
    url:
      "https://raw.githubusercontent.com/FearlessSolutions/acronym_plugin/master/acronyms/software.json",
  },
];

export { fileReference };

// @ts-check
// this file is copied from https://github.com/mjbvz/vscode-markdown-tm-grammar.git

const fs = require('fs');
const path = require('path');
// https://www.npmjs.com/package/js-yaml
// https://github.com/nodeca/js-yaml
const yaml = require('js-yaml');
// https://www.npmjs.com/package/plist
const plist = require('plist');

const languages = [
//	{ name: 'ini', language: 'ini', identifiers: ['ini'], source: 'source.ini' },
	{ name: 'toml', language: 'toml', identifiers: ['toml'], source: 'source.toml' }
];

const fencedCodeBlockDefinition = (name, identifiers, sourceScope, language, additionalContentName) => {
	if (!Array.isArray(sourceScope)) {
		sourceScope = [sourceScope];
	}

	language = language || name

	const scopes = sourceScope.map(scope =>
		`- { include: '${scope}' }`).join('\n');

	let contentName = `meta.embedded.block.${language}`;
	if (additionalContentName) {
		contentName += ` ${additionalContentName.join(' ')}`;
	}

	return `fenced_code_block_${name}:
  begin:
    (^|\\G)(\\s*)(\`{3,}|~{3,})\\s*(?i:(${identifiers.join('|')})((\\s+|:|,|\\{|\\?)[^\`~]*)?$)
  name:
    markup.fenced_code.block.markdown
  end:
    (^|\\G)(\\2|\\s{0,3})(\\3)\\s*$
  beginCaptures:
    '3': {name: 'punctuation.definition.markdown'}
    '4': {name: 'fenced_code.block.language.markdown'}
    '5': {name: 'fenced_code.block.language.attributes.markdown'}
  endCaptures:
    '3': {name: 'punctuation.definition.markdown'}
  patterns:
    - begin: (^|\\G)(\\s*)(.*)
      while: (^|\\G)(?!\\s*([\`~]{3,})\\s*$)
      contentName: ${contentName}
      patterns:
${indent(4, scopes)}
`;
};

const indent = (count, text) => {
	const indent = new Array(count + 1).join('  ');
	return text.replace(/^/gm, indent);
};

const fencedCodeBlockInclude = (name) =>
	`- { include: '#fenced_code_block_${name}' }`;

const fencedCodeBlockDefinitions = () =>
	languages
		.map(language => fencedCodeBlockDefinition(language.name, language.identifiers, language.source, language.language, language.additionalContentName))
		.join('\n');


const fencedCodeBlockIncludes = () =>
	languages
		.map(language => fencedCodeBlockInclude(language.name))
		.join('\n');

const YAML_OPTS = {
	schema: yaml.JSON_SCHEMA,
	json: true,
};

const buildGrammar = () => {
	let text = fs.readFileSync(path.join(__dirname, 'markdown.tmLanguage.base.yaml'), "utf8");
	text = text.replace(/\s*\{\{languageIncludes\}\}/, '\n' + indent(2, fencedCodeBlockIncludes()));
	text = text.replace(/\s*\{\{languageDefinitions\}\}/, '\n' + indent(1, fencedCodeBlockDefinitions()));

	// Write Yaml format
	fs.writeFileSync(path.join(__dirname, 'syntaxes', 'markdown.tmLanguage.yaml'), text);
	// Write JSON format
	const json_out = yaml.load(text, YAML_OPTS);
	const json_str = JSON.stringify(json_out, null, '  ');
	// console.log(json_out);
	fs.writeFileSync(path.join(__dirname, 'syntaxes', 'markdown.tmLanguage.json'), json_str);
	// Migrate from js-yaml@3 to js-yaml@4
	// const grammar = yaml.safeLoad(text);
	const grammar = yaml.load(text);
	const out = plist.build(grammar);
	// Write plist (xml) format
	fs.writeFileSync(path.join(__dirname, 'syntaxes', 'markdown.tmLanguage'), out);
};

buildGrammar();

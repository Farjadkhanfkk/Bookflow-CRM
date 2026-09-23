const ts = require('typescript');
const fs = require('node:fs');
const path = require('node:path');
const configPath = ts.findConfigFile('.', ts.sys.fileExists, 'tsconfig.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
const files = parsed.fileNames.filter(f => /[\\/]src[\\/]/.test(f));
const host = {
  getScriptFileNames: () => files,
  getScriptVersion: () => '1',
  getScriptSnapshot: f => fs.existsSync(f) ? ts.ScriptSnapshot.fromString(fs.readFileSync(f, 'utf8')) : undefined,
  getCurrentDirectory: () => process.cwd(),
  getCompilationSettings: () => parsed.options,
  getDefaultLibFileName: o => ts.getDefaultLibFilePath(o),
  fileExists: ts.sys.fileExists, readFile: ts.sys.readFile, readDirectory: ts.sys.readDirectory,
};
const service = ts.createLanguageService(host);
for (const file of files) {
  for (const change of service.organizeImports({ type: 'file', fileName: file }, {}, {})) {
    let content = fs.readFileSync(change.fileName, 'utf8');
    for (const edit of [...change.textChanges].sort((a,b) => b.span.start-a.span.start)) content=content.slice(0,edit.span.start)+edit.newText+content.slice(edit.span.start+edit.span.length);
    fs.writeFileSync(change.fileName, content);
  }
}
service.dispose();

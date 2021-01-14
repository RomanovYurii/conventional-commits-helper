const fs = require('fs');
const _map = require('lodash/map');
const _forEach = require('lodash/forEach');
const { author, prompt, requiredPrompt, generateFileContent, asyncExec } = require('./constants');

require('colors');
require('dotenv')
  .config();

(async () => {
  console.log('\nWelcome to components generator'.blue);

  const { componentNames } = await requiredPrompt({
    type: 'list',
    name: 'componentNames',
    message: 'Enter component(s) name:',
    separator: ',',
  });
  const { path } = await requiredPrompt({
    type: 'text',
    name: 'path',
    message: 'Enter component path:',
    initial: 'src/components/'
  });
  const { options } = await prompt({
    type: 'multiselect',
    name: 'options',
    message: 'Select extra files to create',
    choices: [
      {
        title: 'Stories',
        value: 'stories'
      },
      {
        title: 'Styles',
        value: 'styles'
      },
      {
        title: 'Messages',
        value: 'messages'
      },
    ],
    instructions: false,
  });
  const { commit } = await prompt({
    type: 'toggle',
    name: 'commit',
    initial: true,
    active: 'yes',
    inactive: 'no',
    message: 'Commit new files?'
  });

  _forEach(componentNames, async (componentName) => {
    console.log();

    const componentFolder = process.env.PROJECT_PATH + path + componentName;
    const makeFile = async (fileName, options = {}) => {
      const filePath = [componentFolder, fileName].join('/');
      await fs.writeFileSync(filePath, generateFileContent(fileName, componentName, options) + '\n');
      console.log(`Created ${fileName} file...`);
    };

    await fs.mkdirSync(componentFolder);
    await makeFile('index.js');
    await makeFile(`${componentName}.view.js`, {
      withStyles: options.includes('styles')
    });

    for (let optionName of options) {
      if (options.includes(optionName)) {
        await makeFile(`${componentName}.${optionName}.js`);
      }
    }

    if (commit) {
      await fs.writeFileSync(`${__dirname}\\tmp`, `feat(${componentName}): create initial files

Author: @yurii.romanov`);
      await asyncExec(`cd ${process.env.PROJECT_PATH} && git add . && git commit -F ${__dirname}\\tmp`);
      await fs.unlinkSync(`${__dirname}\\tmp`);
      console.log(`Successfully created ${componentName} component files!\n`.yellow);
    }
  });
})();

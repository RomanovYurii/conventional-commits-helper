const prompts = require('prompts');
const { exec } = require('child_process');
require('colors');
require('dotenv')
  .config();

const author = `Author: ${process.env.USER_NAME}`;
const commitTypes = [
  'feat',
  'fix',
  'refactor',
  'style',
  'test',
];
const reviewers = [
  '@yurii.romanov',
  '@damian.rachel',
  '@mateusz.stepaniuk',
];

const onCancel = () => {
  console.log('Good bye!\n'.yellow);
  process.exit();
};

const asyncExec = (command) => {
  const child = exec(command);
  return new Promise((resolve, reject) => {
    child.addListener('error', reject);
    child.addListener('exit', resolve);
  });
};
const prompt = async (options) => await prompts(options, { onCancel });
const requiredPrompt = async (options) => {
  let counter = 3;
  let buffer = '';
  const isBufferEmpty = () => {
    return typeof buffer === typeof [] ? buffer[0].length === 0 : buffer.length === 0;
  };

  while (isBufferEmpty() && counter > 0) {
    buffer = await prompts(options, { onCancel });
    buffer = buffer[options.name];
    counter--;
  }
  if (counter === 0 && isBufferEmpty()) {
    console.error('\nNo value was provided!\n'.red);
    process.exit(1);
  } else {
    return { [options.name]: buffer };
  }
};
const generateFileContent = (fileName, componentName, options) => {
  const getBody = () => {
    return options.withStyles ? `import useStyle from './${componentName}.styles';

const ${componentName} = () => {
  const classes = useStyle();

  return (
    <div className={classes.root} />
  );
};` : `const ${componentName} = () => (
  <div />
);`;
  };
  switch (fileName) {
    case 'index.js':
      return `export { default } from './${componentName}.view';`;
    case `${componentName}.styles.js`:
      return `import makeStyles from '@material-ui/styles/makeStyles';

export default makeStyles(
  () => ({
    root: {},
  }),
);`;
    case `${componentName}.stories.js`:
      return `import Component from '.';
export default {
  title: 'components/${componentName}',
  component: Component,
  argTypes: {
    // Hide next in controls tab
  },
};

const defaultView = Component.bind({});

defaultView.args = {};

export {
  defaultView,
};
`;
    case `${componentName}.messages.js`:
      return `import { defineMessages } from 'react-intl';

export default defineMessages({});`;
    case `${componentName}.view.js`:
      return `import React from 'react';
import PropTypes from 'prop-types';

${getBody()}

${componentName}.propTypes = {};

${componentName}.defaultProps = {};

export default ${componentName};`;
    default:
  };
};

module.exports = {
  author,
  reviewers,
  commitTypes,
  prompt,
  asyncExec,
  requiredPrompt,
  generateFileContent,
};

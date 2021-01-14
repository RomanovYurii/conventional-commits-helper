const fs = require('fs');
const _map = require('lodash/map');
const {
  author,
  reviewers,
  commitTypes,
  prompt,
  asyncExec,
  requiredPrompt,
} = require('./constants');

require('colors');
require('dotenv')
  .config();

(async () => {
  console.log('\nWelcome to commit generator'.blue);
  const { type } = await requiredPrompt({
    type: 'select',
    name: 'type',
    message: 'Choose a commit type:',
    choices: _map(commitTypes, type => ({
      title: type,
      value: type
    })),
    initial: 0
  });

  let { scope } = await prompt({
    type: 'text',
    name: 'scope',
    message: `Enter the scope:`
  });
  scope = scope ? `(${scope})` : '';

  const { message } = await requiredPrompt({
    type: 'text',
    name: 'message',
    message: `Enter commit message:`
  });

  let { body } = await prompt({
    type: 'text',
    name: 'body',
    message: `Enter body content (optional):`
  });
  body = body ? `\n\n${body}` : '';

  let reviewer = '';
  let mr = '';
  if (type === 'refactor') {
    reviewer = await prompt({
      type: 'select',
      name: 'name',
      message: 'Choose a reviewer:',
      choices: _map(reviewers, name => ({
        title: name,
        value: name
      })),
      initial: 0
    });
    reviewer = reviewer.name ? `\nReviewer: ${reviewer.name}` : '';
    mr = await prompt({
      type: 'number',
      name: 'number',
      message: 'Enter merge request number (optional):',
    });
    mr = mr.number ? `\nMR: !${mr.number}` : '';
  }
  const { push } = await prompt({
    type: 'toggle',
    name: 'push',
    message: 'Push after committing?',
    initial: false,
    active: 'yes',
    inactive: 'no'
  });

  const header = `${type}${scope}: ${message}`;
  const footer = `\n\n${author}${reviewer}${mr}`;
  const commitMessage = header + body + footer;
  const pushCommand = push ? ' && git push' : '';

  console.log('\nGenerated commit message:'.blue);
  console.log(`${commitMessage}\n`.yellow);

  await fs.writeFileSync(`${__dirname}\\tmp`, commitMessage);
  await asyncExec(`cd ${process.env.PROJECT_PATH} && git add . && git commit -F ${__dirname}\\tmp${pushCommand}`);
  await fs.unlinkSync(`${__dirname}\\tmp`);
  console.log('Commited successfully!'.green);
})();

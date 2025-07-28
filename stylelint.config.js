//@ts-check

export default {
  extends: [ 'stylelint-config-standard', 'stylelint-config-tailwindcss' ],
  plugin: 'stylelint-plugin-tailwindcss',
  rules: {
    'at-rule-no-deprecated': [
      true,
      {
        ignoreAtRules: [ 'apply' ],
      },
    ],
  },
};

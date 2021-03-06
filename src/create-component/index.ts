import { resolve, join } from 'path';
import { template } from 'lodash';
import * as mkdirPlus from 'mkdirp';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { camelCase, upperFirst, kebabCase } from 'lodash';
import getConfig from '../utils/getConfig';
import debug from '../debug';

/**
 * 获取组件名称(转换组件名称为大驼峰)
 * @param name
 * @example
 * 'button-group' >> 'ButtonGroup'
 */
function getComponentName(name: string): string {
  return upperFirst(camelCase(name));
}

/**
 * 获取组件文件名称
 * @param name
 * @example
 * 'buttonGroup' >> 'button-group'
 */
function getComponentFileName(name: string): string {
  return kebabCase(name)
}

function createFile(
  options: {
    dir: string;
    templateName: string;
    fileName: string;
    data?: object;
  }
) {
  const { dir, fileName, templateName, data } = options;

  const componentTemplate = readFileSync(join(__dirname, `./templates/${templateName}`), 'utf-8');

  const compiled = template(componentTemplate.toString());

  const text = compiled(data);

  // 检查是否是多级目录
  if (fileName.includes('/')) {
    const paths = fileName.split('/');
    paths.pop();
    // 先创建目录
    mkdirPlus.sync(join(dir, paths.join('/')));
  }

  writeFileSync(join(dir, fileName), text);
}

function main(
  options
) {
  debug.log('start create');
  const { libraryDir, createComponent = {} } = getConfig();
  const createComponentOptions = Object.assign(options, createComponent);

  const name = createComponentOptions.component_name;
  const componentName = getComponentName(name);
  const componentFileName = getComponentFileName(name);

  const componentAbsoluteDir = resolve(libraryDir + '', componentFileName);

  // 组件目录是否存在
  if (!existsSync(componentAbsoluteDir)) {
    // 可能存在多级
    mkdirPlus.sync(componentAbsoluteDir);
  } else {
    debug.error(`${componentName} already exists, please choose another name.`);
    process.exit(2);
  }

  const styleAbsoluteDir = resolve(libraryDir + '', 'style');
  const themesAbsoluteDir = resolve(libraryDir + '', 'style/themes');

  // 检查样式目录文件是否存在
  if (!existsSync(styleAbsoluteDir)) {
    // 创建样式目录
    mkdirPlus.sync(styleAbsoluteDir);

    // 生成style/index.less
    createFile({
      dir: libraryDir + '',
      templateName: 'style/index.less.tpl',
      fileName: `style/index.less`
    });

    // 创建style/themes目录
    mkdirPlus.sync(themesAbsoluteDir);

    // 生成style/themes/default.less文件
    createFile({
      dir: libraryDir + '',
      templateName: 'style/themes/default.less.tpl',
      fileName: `style/themes/default.less`,
      data: {
        prefix: createComponentOptions.prefixCls
      }
    });

    // 生成style/themes/index.less文件
    createFile({
      dir: libraryDir + '',
      templateName: 'style/themes/index.less.tpl',
      fileName: `style/themes/index.less`
    });
  }

  // 生成组件文件
  createFile({
    dir: componentAbsoluteDir,
    templateName: 'component.ts.tpl',
    fileName: `${componentFileName}.tsx`,
    data: {
      name: componentName
    }
  });

  // 生成Index文件
  createFile({
    dir: componentAbsoluteDir,
    templateName: 'index.ts.tpl',
    fileName: `index.tsx`,
    data: {
      name: componentName,
      fileName: componentFileName
    }
  });

  if (createComponent.locale) {
    // 生成index.en-US.md
    createFile({
      dir: componentAbsoluteDir,
      templateName: 'index.en-US.md.tpl',
      fileName: `index.en-US.md`,
      data: {
        componentName: componentName
      }
    });

    // 生成index.zh-CN.md
    createFile({
      dir: componentAbsoluteDir,
      templateName: 'index.zh-CN.md.tpl',
      fileName: `index.zh-CN.md`,
      data: {
        componentName: componentName
      }
    });
  } else {
    // 生成index.md
    createFile({
      dir: componentAbsoluteDir,
      templateName: 'index.zh-CN.md.tpl',
      fileName: `index.md`,
      data: {
        componentName: componentName
      }
    });
  }

  // 生成style/index.less
  createFile({
    dir: componentAbsoluteDir,
    templateName: 'style-index.less.tpl',
    fileName: `style/index.less`,
    data: {
      name: componentFileName
    }
  });

  // style/index.ts
  createFile({
    dir: componentAbsoluteDir,
    templateName: 'style-index.ts.tpl',
    fileName: `style/index.tsx`
  });
  debug.log('create success');
}

export default main;

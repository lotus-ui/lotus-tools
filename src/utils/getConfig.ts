import { resolve } from 'path';
import { merge } from 'lodash';
import { LoadResult } from 'joycon';
import configLoader from './config-loader';
import { IOptions } from '../interface';

/**
 * 获取用户配置
 * @param cwd 用户的执行目录
 */
const getUserConfig = (cwd?: string): IOptions => {
  cwd = cwd || process.cwd();

  const userConfig: LoadResult = configLoader.loadSync({
    files: [
      'lotus-tools.config.js',
      'lotus-tools.config.ts'
    ],
    cwd
  });

  const defaultConfig: IOptions = {
    libraryDir: 'components',
    createComponent: {
      locale: true,
      prefixCls: 'lotus'
    }
  };

  return merge(defaultConfig, userConfig.data);
};

/**
 * 获取配置
 * @param cwd
 */
const getConfig = (cwd?: string) => {
  cwd = cwd || process.cwd();

  // 用户配置
  const userConfig = getUserConfig(cwd) || {};
  userConfig.libraryDir = resolve(cwd, userConfig.libraryDir as string);

  return userConfig;
};

export default getConfig;

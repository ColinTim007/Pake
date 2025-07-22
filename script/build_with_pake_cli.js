import shelljs from 'shelljs';
import axios from 'axios';
import fs from 'fs';

const { exec, cd, mv } = shelljs;

console.log('Welcome to use pake-cli to build app');
console.log('Node.js info in your localhost ', process.version);
console.log('\n=======================\n');
console.log('Pake parameters are: ');
console.log('url: ', process.env.URL);
console.log('name: ', process.env.NAME);
console.log('icon: ', process.env.ICON);
console.log('height: ', process.env.HEIGHT);
console.log('width: ', process.env.WIDTH);
console.log('fullscreen: ', process.env.FULLSCREEN);
console.log('hide-title-bar: ', process.env.HIDE_TITLE_BAR);
console.log('is multi arch? only for Mac: ', process.env.MULTI_ARCH);
console.log('targets type? only for Linux: ', process.env.TARGETS);
console.log('===========================\n');

// 处理 dimensions 和 optional_configurations
const dimensions = process.env.DIMENSIONS || '1200,780';  // 默认值
const [width, height] = dimensions.split(',');

const optionalConfig = process.env.OPTIONAL_CONFIGURATIONS || '';  // 获取合并的 user-agent 和 icon
let userAgent = '';
let icon = '';

if (optionalConfig) {
  const [userAgentValue, iconValue] = optionalConfig.split(',');
  userAgent = userAgentValue || '';
  icon = iconValue || '';
}

cd('node_modules/pake-cli');
let params = `node cli.js ${process.env.URL} --name ${process.env.NAME} --height ${height} --width ${width}`;

if (userAgent) {
  params = `${params} --user-agent "${userAgent}"`;
}

if (process.env.HIDE_TITLE_BAR === 'true') {
  params = `${params} --hide-title-bar`;
}

if (process.env.FULLSCREEN === 'true') {
  params = `${params} --fullscreen`;
}

if (process.env.MULTI_ARCH === 'true') {
  exec('rustup target add aarch64-apple-darwin');
  params = `${params} --multi-arch`;
}

if (process.env.TARGETS) {
  params = `${params} --targets ${process.env.TARGETS}`;
}

if (process.platform === 'win32' || process.platform === 'linux') {
  params = `${params} --show-system-tray`;
}

const downloadIcon = async iconFile => {
  try {
    const response = await axios.get(process.env.ICON, { responseType: 'arraybuffer' });
    fs.writeFileSync(iconFile, response.data);
    return `${params} --icon ${iconFile}`;
  } catch (error) {
    console.error('Error occurred during icon download: ', error);
  }
};

const main = async () => {
  if (icon) {
    let iconFile;
    switch (process.platform) {
      case 'linux':
        iconFile = 'icon.png';
        break;
      case 'darwin':
        iconFile = 'icon.icns';
        break;
      case 'win32':
        iconFile = 'icon.ico';
        break;
      default:
        console.log("Unable to detect your OS system, won't download the icon!");
        process.exit(1);
    }

    params = await downloadIcon(iconFile);
  } else {
    console.log("Won't download the icon as ICON environment variable is not defined!");
  }

  console.log('Pake parameters are

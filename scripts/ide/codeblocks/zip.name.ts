import { platform } from 'os';
import { normalize } from 'path';
import { getPackageData, getProductData } from '../../library/misc/fsUtil';

export const TYPE_ZIP_FILE = '7z';

export function releaseFileName(platform: string, type: string): string {
	const product = getProductData();
	const packageJson = getPackageData();
	
	const pv = ('' + packageJson.patchVersion).replace(/\./g, '');
	return normalize(`${platform}.${product.applicationName}.v${packageJson.version}-${product.quality}.${pv}.${type}`);
}

export function packageFileName(platform: string, type: string) {
	return `${platform}.offlinepackages.${type}`;
}

export function nameReleaseFile() {
	const plat = platform();
	return releaseFileName.bind(undefined, plat);
}
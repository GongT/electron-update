import { OutputStreamControl } from '@gongt/stillalive';
import { platform } from 'os';
import { resolve } from 'path';
import { cmp } from 'semver';
import { getRemoteVersion, IDEJson } from '../../library/jsonDefine/releaseRegistry';
import { getPackageData, isExists } from '../../library/misc/fsUtil';
import { releaseZipStorageFolder } from '../codeblocks/zip';
import { releaseFileName, TYPE_ZIP_FILE } from '../codeblocks/zip.name';

export async function checkBaseIsDifferent(remote: IDEJson) {
	const packData = getPackageData();
	
	const rv = getRemoteVersion(remote, 'main');
	if (rv && cmp(rv, '>', packData.version)) {
		throw new Error('run git pull now.');
	}
	
	return rv !== packData.version;
}

export async function checkPatchIsDifferent(remote: IDEJson) {
	const packData = getPackageData();
	const rv = getRemoteVersion(remote, 'patch');
	
	const r = parseFloat(rv);
	const l = parseFloat(packData.patchVersion);
	if (r > l) {
		throw new Error('run git pull now.');
	} else {
		return r !== l;
	}
}

export async function ensureBuildComplete(output: OutputStreamControl) {
	const zip = resolve(releaseZipStorageFolder(), releaseFileName(platform(), TYPE_ZIP_FILE));
	output.writeln('check build result zips exists:\n\t- %s' + zip);
	if (await isExists(zip)) {
		output.success('Build state is ok.');
	} else {
		output.writeln('no, something missing.');
		
		output.warn('these files must exists: \n\t- ' + zip);
		throw new Error('Not complete build process. please run `build` first.');
	}
}
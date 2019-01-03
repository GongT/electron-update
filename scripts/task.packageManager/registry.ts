import { jeditor, task } from '../library/gulp';
import { gulpS3 } from '../library/gulp/aws';
import { IPackageVersionDetail, IRemotePackageInfo, IRemotePackageRegistry, PackageTypes } from '../library/jsonDefine/packageRegistry';
import { ExS3 } from '../library/misc/awsUtil';
import { posixJoin } from '../library/misc/pathUtil';
import { OBJKEY_PACKAGE_MANAGER_EXAMPLE, OBJKEY_PACKAGE_MANAGER_LIBRARY } from '../library/releaseInfo/s3Keys';
import { exampleList, freertosExample, standaloneExample } from './examples';
import { createKeyBase, createKeyName } from './path';
import { freertosSdk, standaloneSdk } from './sdk';
import { getVersionString } from './version';

export const updateSdkRegistry = task('pm:library.json', [standaloneSdk, freertosSdk], () => {
	return gulpS3.src(OBJKEY_PACKAGE_MANAGER_LIBRARY)
	             .pipe(jeditor((json: IRemotePackageRegistry) => {
		             ['kendryte-standalone-sdk', 'kendryte-freertos-sdk'].forEach((name) => {
			             const reg = findOrPrependPackage(PackageTypes.Library, name, json, true);
			             const down = findOrAppendVersion(getVersionString(), reg.versions);
			             down.downloadUrl = ExS3.instance().websiteUrl(
				             posixJoin(
					             createKeyBase(PackageTypes.Library, name),
					             createKeyName(getVersionString()),
				             ),
			             );
		             });
		             return json;
	             }))
	             .pipe(gulpS3.dest());
});

export const updateExampleRegistry = task('pm:example.json', [standaloneExample, freertosExample], () => {
	return gulpS3.src(OBJKEY_PACKAGE_MANAGER_EXAMPLE)
	             .pipe(jeditor((json: IRemotePackageRegistry) => {
		             exampleList.forEach(({type, name, version}) => {
			             const reg = findOrPrependPackage(PackageTypes.Library, name + '_' + type, json, true);
			             const down = findOrAppendVersion(version, reg.versions);
			             down.downloadUrl = ExS3.instance().websiteUrl(
				             posixJoin(
					             createKeyBase(PackageTypes.Executable, name),
					             createKeyName(version, type),
				             ),
			             );
		             });
		             return json;
	             }))
	             .pipe(gulpS3.dest());
});

export function findOrAppendVersion(version: string, json: IPackageVersionDetail[]) {
	const exists = json.find(i => i.versionName === version);
	if (exists) {
		return exists;
	}
	const newData: IPackageVersionDetail = {
		versionName: version,
		downloadUrl: '',
		releaseDate: Date.now(),
	};
	json.push(newData);
	return newData;
}

export function findOrPrependPackage(type: PackageTypes, name: string, json: IRemotePackageRegistry, prepend: boolean) {
	const exists = json.find(i => i.name === name);
	if (exists) {
		return exists;
	}
	const newData: IRemotePackageInfo = {
		name,
		type,
		versions: [],
	};
	json.unshift(newData);
	return newData;
}

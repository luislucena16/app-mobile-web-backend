import * as fs from 'fs';
import * as path from 'path';

export function getExtension(filename) {
  const ext = path.extname(filename);
  return ext.split('.').pop();
}

export function deleteFile(path: string) {
  try {
    fs.unlinkSync(path);
    return true;
  } catch (e) {
    console.log('error delete file ', e);
    return false;
  }
}

export function cleanObject(data) {
  return Object.entries(data)
    .filter(([_, value]) => !!value || typeof value === 'boolean')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
}

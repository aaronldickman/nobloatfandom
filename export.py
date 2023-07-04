import sys
import shutil
import os
import json
from semantic_version import Version

def get_update_type():
    if (len(sys.argv) == 1):
        return 'minor'

    type = str(sys.argv[1])
    if (type != "patch" and type != "minor" and type != "major"):
        print('valid args are patch minor major')
        exit(-1)

    return type

def update_manifest_version(package_json_path, update_type):
    with open(package_json_path, 'r+') as file:
        data = json.load(file)
        current_version = data['version']
        new_version = ""
        if (type == 'patch'):
            new_version = Version(current_version).next_patch()
        elif (type == 'minor'):
            new_version = Version(current_version).next_minor()
        elif (type == 'major'):
            new_version = Version(current_version).next_major()
        data['version'] = str(new_version)
        file.seek(0)
        json.dump(data, file, indent=4)
        file.truncate()
        return str(new_version)

def zip_directory(directory_path, output_path):
    shutil.make_archive(output_path, 'zip', directory_path)


manifest_json_file = './extension/manifest.json'
type = get_update_type()
version = update_manifest_version(manifest_json_file, type)

directory_to_zip = './extension'
output_zip_file = 'nobloatfandom_build'
zip_directory(directory_to_zip, output_zip_file)

print('zipped v', version, 'to', output_zip_file)

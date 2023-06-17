import shutil
import os
import json
from semantic_version import Version


def update_manifest_version(package_json_path):
    with open(package_json_path, 'r+') as file:
        data = json.load(file)
        current_version = data['version']
        new_version = Version(current_version).next_minor()
        data['version'] = str(new_version)
        file.seek(0)
        json.dump(data, file, indent=4)
        file.truncate()

def zip_directory(directory_path, output_path):
    shutil.make_archive(output_path, 'zip', directory_path)


manifest_json_file = './extension/manifest.json'
update_manifest_version(manifest_json_file)

directory_to_zip = './extension'
output_zip_file = 'nobloatfandom_build'
zip_directory(directory_to_zip, output_zip_file)

print('Directory zipped and saved as', output_zip_file)

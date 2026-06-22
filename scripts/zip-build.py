import os
import zipfile

def main():
    zip_filename = 'out.zip'
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    zip_filepath = os.path.join(root_dir, zip_filename)

    # Delete existing zip if it exists
    if os.path.exists(zip_filepath):
        try:
            os.remove(zip_filepath)
        except Exception as e:
            print(f"Error removing existing zip file: {e}")

    print(f"Creating production static package {zip_filename} from 'out/' folder...")

    out_dir = os.path.join(root_dir, 'out')
    if not os.path.exists(out_dir):
        print(f"Error: 'out' directory not found. Please run npm run build first.")
        return

    count = 0
    warnings = 0
    with zipfile.ZipFile(zip_filepath, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(out_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Get path relative to the 'out' directory
                rel_path = os.path.relpath(file_path, out_dir)
                # Force forward slashes for the archive entry path
                arcname = rel_path.replace('\\', '/')
                try:
                    zipf.write(file_path, arcname)
                    count += 1
                except FileNotFoundError:
                    # Ignore files that disappeared (temporary build cache / Next.js internal router metadata)
                    warnings += 1
                except Exception as e:
                    print(f"Warning: Could not zip file {file_path}: {e}")
                    warnings += 1

    print(f"Successfully packaged {count} files from 'out/' into {zip_filename} with forward-slash directory separators.")
    if warnings > 0:
        print(f"Note: Ignored {warnings} missing or locked temporary files during zipping.")

if __name__ == '__main__':
    main()

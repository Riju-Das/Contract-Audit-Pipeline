import pymupdf4llm
import os
import pathlib

def convert_pdfs_to_markdown(pdf_dir:str, output_dir:str):

    pathlib.Path(output_dir).mkdir(parents=True, exist_ok=True)

    for filename in os.listdir(pdf_dir):
        if filename.endswith(".pdf"):

            pdf_path = os.path.join(pdf_dir, filename)

            md_text = pymupdf4llm.to_markdown(pdf_path)

            output_filename = filename.replace(".pdf", ".md")

            output_path = os.path.join(output_dir, output_filename)

            with open(output_path, "w", encoding="utf-8") as f:
                f.write(md_text)

            print(f"Converted {filename} to {output_filename}")


if __name__ == "__main__":
    convert_pdfs_to_markdown("./app/violation-policies", "./app/output_md")
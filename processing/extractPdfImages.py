"""
extractPdfImages.py
--------------------
Extracts product images from abc.pdf and saves them
as {item_code}.png in backend/uploads/parts/
"""

import fitz  # PyMuPDF
import re
import os
import sys

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

PDF_PATH  = r"c:\Users\adnan\OneDrive\Desktop\New folder (2)\abc.pdf"
OUT_DIR   = r"c:\Users\adnan\OneDrive\Desktop\New folder (2)\backend\uploads\parts"

ITEM_CODE_RE = re.compile(r'\b([A-Z]{2}-\d{4}-[A-Z0-9]{2})\b')

def extract():
    doc = fitz.open(PDF_PATH)
    total_pages = len(doc)
    print(f"PDF has {total_pages} pages")

    saved   = 0
    skipped = 0
    errors  = 0

    for page_num in range(total_pages):
        page = doc[page_num]

        text = page.get_text()
        codes_on_page = ITEM_CODE_RE.findall(text)

        if not codes_on_page:
            continue

        img_list = page.get_images(full=True)

        if not img_list:
            print(f"  Page {page_num+1}: {len(codes_on_page)} codes, NO images found")
            continue

        for idx, code in enumerate(codes_on_page):
            if idx >= len(img_list):
                break

            xref = img_list[idx][0]
            try:
                base_image = doc.extract_image(xref)
                img_bytes  = base_image["image"]
                ext        = base_image["ext"]

                out_path = os.path.join(OUT_DIR, f"{code}.png")

                if ext.lower() == "png":
                    with open(out_path, "wb") as f:
                        f.write(img_bytes)
                else:
                    pix = fitz.Pixmap(doc, xref)
                    if pix.n > 4:
                        pix = fitz.Pixmap(fitz.csRGB, pix)
                    pix.save(out_path)

                saved += 1
                print(f"  OK  {code}  ->  {code}.png")

            except Exception as e:
                print(f"  ERR {code}  ->  {e}")
                errors += 1

    doc.close()

    print(f"\n{'='*45}")
    print(f"Saved   : {saved}")
    print(f"Skipped : {skipped}")
    print(f"Errors  : {errors}")
    print(f"{'='*45}")
    print("\nDone! Refresh your dashboard.")

extract()


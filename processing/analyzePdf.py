import fitz
import re

PDF_PATH = r"c:\Users\adnan\OneDrive\Desktop\New folder (2)\abc.pdf"

def analyze_page(page_num):
    doc = fitz.open(PDF_PATH)
    page = doc[page_num]
    
    print(f"--- Analyzing Page {page_num + 1} ---")
    
    # Text with positions
    blocks = page.get_text("blocks")
    for b in blocks:
        # b = (x0, y0, x1, y1, "text", block_no, block_type)
        print(f"Text Block at ({b[0]:.1f}, {b[1]:.1f}): {b[4].strip()}")
    
    # Images with positions
    img_info = page.get_image_info(hashes=False)
    for i, img in enumerate(img_info):
        # img has "bbox" = (x0, y0, x1, y1)
        bbox = img["bbox"]
        print(f"Image {i} at ({bbox[0]:.1f}, {bbox[1]:.1f}) size {bbox[2]-bbox[0]:.1f}x{bbox[3]-bbox[1]:.1f}")
    
    doc.close()

analyze_page(0) # First page

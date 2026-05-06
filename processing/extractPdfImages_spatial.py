import fitz
import re
import os
import sys

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

PDF_PATH = r"c:\Users\adnan\OneDrive\Desktop\New folder (2)\abc.pdf"
OUT_DIR = r"c:\Users\adnan\OneDrive\Desktop\New folder (2)\backend\uploads\parts"

ITEM_CODE_RE = re.compile(r'\b([A-Z]{2}-\d{4}-[A-Z0-9]{2,})\b')

def extract():
    doc = fitz.open(PDF_PATH)
    total_pages = len(doc)
    print(f"PDF has {total_pages} pages")

    saved = 0
    errors = 0

    for page_num in range(total_pages):
        page = doc[page_num]
        
        # 1. Get all text with positions
        # We want to find item codes and their Y positions
        text_instances = []
        blocks = page.get_text("dict")["blocks"]
        for b in blocks:
            if "lines" in b:
                for l in b["lines"]:
                    for s in l["spans"]:
                        match = ITEM_CODE_RE.search(s["text"])
                        if match:
                            code = match.group(1)
                            # Use vertical center of the text span
                            y_center = (s["bbox"][1] + s["bbox"][3]) / 2
                            text_instances.append({"code": code, "y": y_center})
        
        if not text_instances:
            continue
            
        # 2. Get all images with positions
        img_info = page.get_image_info(hashes=False)
        images = []
        for img in img_info:
            bbox = img["bbox"]
            y_center = (bbox[1] + bbox[3]) / 2
            # xref is needed to extract the image
            # get_image_info doesn't give xref, but get_images does.
            # However, get_images order matches get_image_info order in many cases.
            # Let's use get_images and match by bbox if possible or just assume order.
            images.append({"bbox": bbox, "y": y_center})

        # Match images to xrefs
        img_list = page.get_images(full=True)
        # Note: img_list order might not match img_info order.
        # But fitz.Pixmap(doc, xref) followed by position search is safer.
        # Actually, get_images returns (xref, smask, width, height, bpc, cs, ...)
        
        # A more robust way:
        for item in text_instances:
            code = item["code"]
            target_y = item["y"]
            
            # Find closest image vertically
            # Usually the image is on the same row or slightly above the text baseline
            closest_img = None
            min_dist = float('inf')
            
            for img in images:
                dist = abs(img["y"] - target_y)
                # Images for a row are usually within 20-30 points of the text baseline
                if dist < min_dist and dist < 40: 
                    min_dist = dist
                    closest_img = img
            
            if closest_img:
                # Extract this image. We need its xref.
                # Since get_image_info doesn't give xref, we'll find the image index in img_list 
                # that has similar dimensions/CS if possible, or just use the index if we trust order.
                # Actually, fitz has page.get_image_rects(xref)
                
                # Let's find the xref that covers the bbox of closest_img
                final_xref = None
                for xref_item in img_list:
                    xref = xref_item[0]
                    rects = page.get_image_rects(xref)
                    for r in rects:
                        # Check if r overlaps significantly with closest_img["bbox"]
                        if abs(r.y0 - closest_img["bbox"][1]) < 2 and abs(r.y1 - closest_img["bbox"][3]) < 2:
                            final_xref = xref
                            break
                    if final_xref: break
                
                if final_xref:
                    try:
                        base_image = doc.extract_image(final_xref)
                        img_bytes = base_image["image"]
                        
                        out_path = os.path.join(OUT_DIR, f"{code}.png")
                        
                        # Save as PNG
                        pix = fitz.Pixmap(doc, final_xref)
                        if pix.n > 4: pix = fitz.Pixmap(fitz.csRGB, pix)
                        pix.save(out_path)
                        
                        saved += 1
                        # print(f"  OK  {code}  at Y={target_y:.1f} matched Img at Y={closest_img['y']:.1f}")
                    except Exception as e:
                        print(f"  ERR {code}  ->  {e}")
                        errors += 1
        
        if page_num % 10 == 0:
            print(f"Processed {page_num} pages...")

    doc.close()
    print(f"\nSaved   : {saved}")
    print(f"Errors  : {errors}")
    print("\nExtraction complete!")

extract()

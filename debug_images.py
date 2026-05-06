import fitz
doc = fitz.open("processing/abc.pdf")
for i in range(5):
    page = doc[i]
    images = page.get_images(full=True)
    print(f"Page {i}: {len(images)} images")
    for img in images:
        xref = img[0]
        base = doc.extract_image(xref)
        print(f"  xref {xref}, size {len(base['image'])}, ext {base['ext']}, width {base['width']}, height {base['height']}")

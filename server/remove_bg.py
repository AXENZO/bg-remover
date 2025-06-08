
import sys
import rembg
from PIL import Image

def remove_background(image_path, output_path):
    with open(image_path, "rb") as inp_file:
        with open(output_path, "wb") as out_file:
            out_file.write(rembg.remove(inp_file.read()))

if __name__ == "__main__":
    input_image = sys.argv[1]
    output_image = sys.argv[2]
    remove_background(input_image, output_image)
    print(output_image)
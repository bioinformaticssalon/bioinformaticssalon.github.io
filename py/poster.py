#!/usr/local/bin/python

# This program creates a pretty rectangle of randomized DNA bases (ATGC) and bits (01)
# and writes it to a pdf file.

# It depends on reportlab to generate PDF files (https://bitbucket.org/rptlab/reportlab)

# To install reportlab, do this:
# $pip install reportlab

from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import Color
from random import randint, random

# Pathname to the Courier New font
COURIER_PATH = '/Library/Fonts/Courier New.ttf'
OUT_FILENAME = 'out.pdf'

# Image geometry
PAGE_SIZE = (7.25*inch, 3.5*inch)
MAX_X = 100
MIN_X = 3
MAX_Y = 30

# Letter glyphs to be printed
BASES = "ATGC"
BITS = "01"

# "ATGC" are rainbow colored. 01 are black and gray.
BIT_COLORS = [Color(0,0,0),
              Color(.5,.5,.5)]
              
DNA_COLORS = [Color(.62,0,0),          
              Color(0,.62,0),
              Color(0,0,.62),
              Color(.8, .6, 0.0)]

pdfmetrics.registerFont(TTFont("Courier New", COURIER_PATH))

def is_bit(x):
    '''
    Returns False (ATGC) or True (01), given an X coordinate.
    The left side of the image is letters, the right side is bits.
    In between, the probability scales linearly in proportion to the X coordinate.
    Uses a weighted random number to choose between letters (ATGC) and bits (01)
    '''
    scale = 2.5
    left = (MAX_X - MIN_X)/scale
    pu = scale*(x - left)/60.0
    p = max(min(pu,1),0)
    return p < random()

def main(outfile=OUT_FILENAME):
    c = canvas.Canvas(outfile)
    c.setPageSize(PAGE_SIZE)
    c.setFont("Courier New", 8)
    dx = 5
    dy = 8
    for x in range(MIN_X, MAX_X):
        for y in range(3, MAX_Y):
            if is_bit(x):
                e = randint(0,3)
                letter = BASES[e]
                color = DNA_COLORS[e]
            else:
                e = randint(0,1)
                letter = BITS[e]
                color = BIT_COLORS[e]
            c.setFillColor(color)
            c.drawString(x*dx, y*dy, letter)
    c.showPage()
    c.save()


if __name__ == '__main__':
    main()
    

import requests
import threading
import time
import datetime
import sys
from decimal import Decimal

if len(sys.argv) != 3:
    print("Two parameters requested: two report files, example: [report1.txt] [report2.txt]!")
    sys.exit(1)

somma1 = Decimal(0)
somma2 = Decimal(0)
fileName1 = sys.argv[1]
fileName2 = sys.argv[2]

with open(fileName1, "r") as f:
    
    for i in f.readlines():
        if i.startswith("Start"):
            somma1+=Decimal(i.strip().split(":")[1].lstrip())
        if i.startswith("Service"):
            somma2+=Decimal(i.strip().split(":")[1].lstrip())

with open(fileName2, "r") as f:
    
    for i in f.readlines():
        if i.startswith("Start"):
            somma2+=Decimal(i.strip().split(":")[1].lstrip())


media = Decimal((somma2-somma1)/1000)
print ("Average of arrival time: "+str(media))
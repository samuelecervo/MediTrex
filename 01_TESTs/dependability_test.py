import requests
import threading
import time
import datetime
import sys
from decimal import Decimal

if len(sys.argv) != 2:
    print("Please insert parameter: name of file to write, example: [report.txt]!")
    sys.exit(1)

fileName = sys.argv[1]
terminate = False

def do_something():
    global terminate
    try:
        print("Starting request: " +str(time.time()))
        response = requests.get("http://localhost:3001/user/signin")
        print("Response: \t\t"+str(response) + ": "+str(time.time()))
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if terminate:
            return

threads = []

somma = Decimal(0)
daPrintare = ""
print("\n\nPreparing 1000 requests to send...:\n\n")
time.sleep(3)
for i in range(1000):
    # thread = threading.Thread(target=do_something)
    # threads.append(thread)
    # thread.start()
    inizio = str(time.time())
    print("Start request: " +str(time.time()))
    daPrintare+=("Start request: " + inizio + "\n")
    response = requests.get("http://localhost:3001/user/signin")
    fine = str(time.time())
    print("Response type: "+str(response))
    print("Response time: "+ str(time.time()))
    daPrintare+=("Response type: "+str(response) + "\n")
    daPrintare+=("Response time: " + fine + "\n")
    diff = Decimal(fine) - Decimal(inizio)
    print("Service time:  "+ str(diff)+"\n------------------------------------------")
    daPrintare+=("Service time:  "+ str(diff)+"\n------------------------------------------\n")
    somma+=diff

print("\nTerminating...\t")
time.sleep(3)
terminate = True

for thread in threads:
    thread.join()
print("\n\nThe sum is:\t"+str(somma))
print("With average:\t"+str(Decimal(somma/1000))+"\n\n")

daPrintare+=("\n\nThe sum is:\t\t"+str(somma) +"\n")
daPrintare+=("With average:\t"+str(Decimal(somma/1000)))

with open(fileName, "w") as f:
    f.write(daPrintare)
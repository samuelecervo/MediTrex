import requests 
import threading 
import sys

if len(sys.argv) != 2:
    print("Insert an email for the test, example: [email@email.it]!")
    sys.exit(1)

terminate = False 
email_par = sys.argv[1]
 
def do_something(index):
    global terminate 
    try: 
        if (index==0): 
            url = "http://localhost:3001/user/signup" 
        else : 
            url = "http://localhost:3002/user/signup" 
        myobj = {
            "isDoctor" : False,
            "taxidcode" : "AAAAAA00A00A000A",
            "name" : "PAXOS_TEST",
            "surname" : "PAXOS_TEST",
            "email": email_par,
            "password": "123",
            "dateofbirth": "1999-04-14",
            "gender": "F"}
        
        response = requests.post(url, json = myobj) 

        print("RISPOSTA "+str(response)) 
    except Exception as e: 
        print(f"Errore: {e}") 
    finally: 
        if terminate: 
            return 
 
threads = [] 

for i in range(2):
    thread = threading.Thread(target=do_something, args=(i,)) 
    threads.append(thread) 
    thread.start() 
 
terminate = True 
 
for thread in threads: 
    thread.join()
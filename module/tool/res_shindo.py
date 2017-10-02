#from visual import *
import time
import numpy as np
t0=time.time()
import MySQLdb

db = MySQLdb.connect("localhost","root","","csn" )

cursor = db.cursor()

def calc(dataEW, dataNS, dataUD):
    fs = 50
    L = len(dataEW)
    spectrumE = np.fft.fft(dataEW)
    spectrumN = np.fft.fft(dataNS)
    spectrumU = np.fft.fft(dataUD)

    freqList = abs( np.fft.fftfreq(L, d=1.0/fs) )

    winX = np.sqrt( 1 / freqList[1:] )
    winX=np.concatenate(([0],winX))

    y = freqList / 10.
    winY = 1.0/np.sqrt(1.0 + 0.694*np.power(y,2) + 0.241*np.power(y,4) + 0.0557*np.power(y,6) + 0.009664*np.power(y,8) + 0.00134*np.power(y,10) + 0.000155*np.power(y,12))

    winZ = np.sqrt(1.0 - np.exp( np.power( -1.0 * (freqList / 0.5), 3) ))

    win = winX * winY * winZ

    spectrum_winE = win * spectrumE
    spectrum_winN = win * spectrumN
    spectrum_winU = win * spectrumU

    resyn_sigE = np.fft.ifft(spectrum_winE)
    resyn_sigN = np.fft.ifft(spectrum_winN)
    resyn_sigU = np.fft.ifft(spectrum_winU)


    S2 = np.sqrt(np.power(resyn_sigE,2) + np.power(resyn_sigN,2) + np.power(resyn_sigU,2))

    maxS2 = sorted(S2, reverse=True)
    I = 2*np.log10(maxS2[int(0.3*fs)]) + 0.94
    I = int( round(I.real,2) * 10 ) / 10.0
    return I
#A1=arrow(pos=vector(0,0,0),axis=vector(0,1,0),color=color.red)
#T1=label(pos=(0,-0.2,0), text='Intensity')
points=300
loop_num=1
num=0
EW_list = np.zeros(points)
NS_list = np.zeros(points)
UD_list = np.zeros(points)
while num < loop_num:
#while True:
    cursor.execute("SELECT * FROM Event ORDER By id DESC limit "+str(points))
    results = cursor.fetchall()
    ii=0
    for row in results:
        id = row[0]
        device_id = row[1]
        EW_list[ii]= row[4]# * 100
        NS_list[ii]= row[5]# * 100
        UD_list[ii] = row[6]# * 100
        ii+=1
    Intensity = calc(EW_list, NS_list, UD_list)
    
    
    if Intensity<0.5:
        Intensity=0
    elif Intensity<1.5:
        Intensity=1
    elif Intensity<2.5:
       Intensity=2
    elif Intensity<3.5:
       Intensity=3
    elif Intensity<4.5:
       Intensity=4
    elif Intensity<5.0:
       Intensity=5.0
    elif Intensity<5.5:
       Intensity=5.5
    elif Intensity<6.0:
       Intensity=6.0
    elif Intensity<6.5:
       Intensity=6.5
    else:
      Intensity=7
    
    #T1.text=str(Intensity)
    print Intensity
    time.sleep(0.2)
    num+=1
    #if Intensity<=0:
    #    A1.axis=vector(0,0,0)
    #    Intensity=0
    #    sleep(0.2)
    #elif Intensity<=3:
    #    A1.axis=vector(0,Intensity,0)
    #    A1.color=color.green
    #    sleep(0.2)
    #else:
    #    if Intensity<=7:
    #        A1.axis=vector(0,Intensity,0)
    #        A1.color=color.red
    #        sleep(0.2)
    #    else:
    #        A1.axis=vector(0,Intensity,0)
    #        A1.color=color.yellow
    #        sleep(0.2)


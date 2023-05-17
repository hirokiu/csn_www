#!/usr/bin/python
# -*- coding: utf-8 -*- 

#============================
# convert_csv.py
# 
# csn.logのデータをJSON,csv形式に変換
# plotyで利用しやすいjson
#============================
import time
import numpy as np
t0=time.time()

import sys
import json
import csv
import datetime

from pathlib import Path
import shutil

base_dir = "/data/www/410_seismic_www"
data_org_dir = "data/earthquakes"
data_csv_dir = "htdocs/data"
data_json_dir = "htdocs/data"


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

class np2jsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return super(np2jsonEncoder, self).default(obj)

def paths_sorted(paths):
    return sorted(paths, key = lambda x: x.name)

###
### main
###

base_path = Path(base_dir)
## 対象のファイルを取得
org_p = base_path.joinpath(data_org_dir)
#org_list = [p for p in org_p.iterdir() if p.is_file()]
org_list = [p for p in org_p.glob('**/*.csv') if p.is_file()]
#print(org_list)

org_list_name = [p.name for p in org_p.glob('**/*.csv') if p.is_file()]
print(org_list_name)

## 作成済みのファイル一覧を取得
csv_p = base_path.joinpath(data_csv_dir)
csv_list = [p.name for p in csv_p.glob('**/*.csv') if p.is_file()]
csv_name_list = [p.name for p in org_p.glob('**/*.csv') if p.is_file()]
#print(org_list_name)
print(csv_list)
## 作成済みのファイル一覧を取得
json_path = base_path.joinpath(data_json_dir)
#json_list = [p.name for p in csv_p.iterdir() if p.is_file()]
#print(json_list)

## TODO
## 変換済みかどうか確認
## jsonを作るので、ここではチェックしない
#target_list = set(org_list_name) - set(csv_list)
#print(target_list)

# 
station_list = []
waveform_list = {}

## ファイルの作成
for _org_file in paths_sorted(org_list) :
    if _org_file.exists() :
        # デバイスIDの取得
        station_id = _org_file.name[0:3]
        if station_id not in station_list :
            station_list.append(station_id)
            waveform_list[station_id] = {}
        # ファイル名の設定
        json_filename = str(_org_file.name).replace('csv','json')
        # 観測日時の読み取り
        detect_date = datetime.datetime.fromtimestamp(int(_org_file.name[4:14]), datetime.timezone(datetime.timedelta(hours=9)))
        # 出力用jsonに追加
        waveform_list[station_id][json_filename] = detect_date

        print("観測点：" + str(station_id))
        print("観測日時：" + str(detect_date) + " / target_file：" + json_filename + " ___")

        if _org_file.name not in csv_name_list :
            _org_data = np.loadtxt(_org_file, delimiter=',')
            _t_data = _org_data.transpose()
            data_x = np.array([_value - np.mean(_t_data[1]) for _value in _t_data[1]])
            data_y = np.array([_value - np.mean(_t_data[2]) for _value in _t_data[2]])
            data_z = np.array([_value - np.mean(_t_data[3]) for _value in _t_data[3]])

            intensity = calc(_t_data[2], _t_data[1], _t_data[3])
            print(intensity)

            _json_data = json.dumps({'earthquake': {
                                    'filename' : _org_file.name,
                                    'station_id' : station_id,
                                    'intensity' : intensity,
                                    'time' : _t_data[0],
                                    'NS' : data_x,
                                    'EW' : data_y,
                                    'UD' : data_z,
                                    'EW_ave' : np.mean(_t_data[1]),
                                    'NS_ave' : np.mean(_t_data[2]),
                                    'UD_ave' : np.mean(_t_data[3])
                                }},
                                cls = np2jsonEncoder)
            #print(_json_data)

            # ディレクトリの確認
            station_path = json_path.joinpath(station_id)
            if not station_path.exists() :
                station_path.mkdir()
            # json形式でファイルを保存
            _f = open(station_path.joinpath(json_filename), 'w')
            _f.write(_json_data)
            _f.close()
            # csv形式のファイルをコピー
            shutil.copy(_org_file, station_path)


## リスト表示用のjsonを作成
#print(station_list)
_stations_json = {}
for station_id in station_list :
    _stations_json["csn" + str(station_id)] = {
                        "station_name" : "csn" + str(station_id),
                        "station_id" : station_id,
                        "lat" : "",
                        "lon" : ""
    }
    _waveform_json = {}
    for _waveform in waveform_list[station_id] :
        detect_date = datetime.datetime.fromtimestamp(int(_waveform[4:14]), datetime.timezone(datetime.timedelta(hours=9)))
        _waveform_json[str(detect_date)] = {
                            "json_filename" : _waveform,
                            "detect_date" : str(detect_date)
        }
        _json_data = json.dumps({'waveforms': {
                        "station_name" : "csn" + str(station_id),
                        "station_id" : station_id,
                        "waveform" :
                            _waveform_json
                    }},
                    cls = np2jsonEncoder)

        station_path = json_path.joinpath(station_id)
        _f = open(station_path.joinpath("waveform_list_" + station_id + ".json"), 'w')
        _f.write(_json_data)
        _f.close()

_json_data = json.dumps({'csn_station': 
                        _stations_json
                    },
                    cls = np2jsonEncoder)

_f = open(json_path.joinpath("station_list.json"), 'w')
_f.write(_json_data)
_f.close()


'''
        data_time = list()
        data_x = list()
        data_y = list()
        data_z = list()
        data_x_sum = 0.0
        data_y_sum = 0.0
        data_z_sum = 0.0
        for _row in reader :
            data_time.append(_row[0])
            data_x.append(_row[1])
            data_x_sum += float(_row[1])
            data_y.append(_row[2])
            data_y_sum += float(_row[2])
            data_z.append(_row[3])
            data_z_sum += float(_row[3])

        print(len(data_x))
        intensity = calc(data_x, data_y, data_z)
        print(intensity)

        ## csvファイルをjsonに変換
        ### plotly用json



### Download用json

## TODO
## csvファイルをコピー


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
'''

from datetime import datetime
import re
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from firebase_admin import storage
import pandas as pd
import sqlite3 as sq3
import chess
import chess.svg
import sys
import google.api_core.exceptions

# connect to database, get data
con = sq3.connect('../CHESS_ANALYSIS/datasets/chess_games.db')
df = pd.read_sql('select * from calculated_stats inner join games on games.link = calculated_stats.game', con); # https://www.sqlitetutorial.net/sqlite-inner-join/

# set up connection to Firebase
cred = credentials.Certificate("chess-analysis-3f2da-firebase-adminsdk-20e41-a8fef3a3fc.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# set necessary index points, get total games counter (for updating)
user_ref = db.collection(u'users').document(u'roudiere')
games_ref = user_ref.collection(u'games')

def board_to_svg(fen, link):
    board = chess.Board(fen)
    boardsvg = chess.svg.board(board=board)
    f = open("temp_img_folder/{}.SVG".format(link), "w")
    f.write(boardsvg)
    f.close()

def update_pictures():
  l = len(df)
  printProgressBar(0, l, prefix='(firestore_prep) Creating images:', suffix='Complete', length=50)
  i = 0
  for _, series in df.iterrows():
    board_to_svg(series['CurrentPosition'], re.sub('https://www.chess.com/game/(live|daily)/', '', series["Link"]))
    printProgressBar(i+1, l, prefix='(firestore_prep) Creating images:', suffix='Complete', length=50)

def update_db_with_refs_to_pics():
  bucket = storage.bucket("chess-analysis-3f2da.appspot.com")
  from os import walk

  filenames = next(walk("./temp_img_folder"), (None, None, []))[2]
  l = len(filenames)
  printProgressBar(0, l, prefix='(firestore_prep) Uploading and linking images:', suffix='Complete', length=50)
  for f in filenames:
    f_stor_path = 'temp_img_folder/{}'.format(f)
    blob = bucket.blob(f)
    blob.upload_from_filename(f_stor_path)
    blob.make_public()
    image_url = blob.public_url

    docs = games_ref.where(u'id', u'==', f.replace('.SVG', '')).stream()
    docs_updated = 0
    for i, doc in enumerate(docs):
      try:
        doc_ref = games_ref.document(doc.id)
        doc_ref.update({
          u'image_url': image_url
        })

        user_ref.update({
         u'docs_updated': docs_updated + 1
        })

        docs_updated += 1
      except KeyError:
        print(doc.id)

      printProgressBar(i+1, l, prefix='(firestore_prep) Uploading and linking images:', suffix='Complete', length=50)
    

def set_id_field():
  docs = games_ref.stream()
  docs_updated = 0
  for doc in docs:
    try:
      doc_ref = games_ref.document(doc.id)
      doc_ref.update({
        u'id': doc.to_dict()["link"].split('/')[-1] 
      })
      user_ref.update({
        u'docs_updated': docs_updated + 1
      })
      docs_updated += 1
    except KeyError:
      print(doc.id)
      continue


def printProgressBar (iteration, total, prefix = '', suffix = '', decimals = 1, length = 100, fill = '█', printEnd = "\r"):
    """
    Call in a loop to create terminal progress bar
    @params:
        iteration   - Required  : current iteration (Int)
        total       - Required  : total iterations (Int)
        prefix      - Optional  : prefix string (Str)
        suffix      - Optional  : suffix string (Str)
        decimals    - Optional  : positive number of decimals in percent complete (Int)
        length      - Optional  : character length of bar (Int)
        fill        - Optional  : bar fill character (Str)
        printEnd    - Optional  : end character (e.g. "\r", "\r\n") (Str)
    """
    percent = ("{0:." + str(decimals) + "f}").format(100 * (iteration / float(total)))
    filledLength = int(length * iteration // total)
    bar = fill * filledLength + '-' * (length - filledLength)
    print(f'\r{prefix} |{bar}| {percent}% {suffix}', end = printEnd)
    # Print New Line on Complete
    if iteration == total:
        print()

def add_data():
  game_links = [link.replace('\n', '') for link in open('links.txt', 'r').readlines()]

  for _, series in df.iterrows():
    if series['Link'] in game_links:
      continue

    color = 'black' if series['White'] == series['opponent'] else 'white'

    data = {
      u'black_elo': series['BlackElo'],
      u'color': color,
      u'cp_loss': series['cp_loss'],
      u'date': datetime.strptime(series['Date'], "%Y.%M.%d"),
      u'eco': series['ECO'],
      u'final_position': series['CurrentPosition'],
      u'link': series['Link'],
      u'moves': series['moves'],
      u'opponent': series['opponent'],
      u'pgn': series['PGN'],
      u'punish_rate': series['punish_rate'],
      u'result': series['Result'],
      u'smoothness': series['smoothness'],
      u'termination': series['Termination'].split(' ')[-1],
      u'time_control': series['TimeControl'],
      u'upload_date': datetime.now(),
      u'white_elo': series['WhiteElo'],
    }
    
    try:
      games_ref.add(data)
    except google.api_core.exceptions.AlreadyExists:
      print("{} already exists".format(series["Link"]))
      continue

  # cleanup
  with open('links.txt', 'w') as fp:
    for _, series in df.iterrows():
      fp.write('{}\n'.format(series['Link']))

add_data()

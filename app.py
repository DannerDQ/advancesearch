from flask import Flask, render_template, redirect, url_for
from bs4 import BeautifulSoup
import requests

app = Flask(__name__)

percentEncoding = {
	" ": "%20", "!": "%21", "#": "%23", "$": "%24",
	"%": "%25", "&": "%26", "'": "%27", "(": "%28",
	")": "%29", "*": "%2A", "+": "%2B", ",": "%2C",
	"/": "%2F", ":": "%3A", ";": "%3B", "=": "%3D",
	"?": "%3F", "@": "%40", "[": "%5B", "]": "%5D"
}

percentEncodingKeys = [" ","!","#","$","%","&","'","(",")","*","+",",","",":",";","=","?","@","[","]"]

@app.route('/')
def home():
	return render_template('index.html')

@app.route('/history')
def history():
	return render_template('history.html')

@app.route('/__/texto/<search>/<extension>/<start>')
def searchText(search,extension,start):
	global percentEncoding
	searchEncoding = ""

	for i in search:
		if i in percentEncodingKeys:
			searchEncoding += percentEncoding[i]
		else:
			searchEncoding += i

	home = "https://google.com/search?q="
	addURL = searchEncoding + "+filetype%3A" + extension
	addURL += '&hl=es&num=100&start='+str(start)
	completeURL = home + addURL
	response = requests.get(completeURL)
	soup = BeautifulSoup(response.text,'lxml')
	divs = soup.find_all("div",class_="fP1Qef")
	results = []
	obj = {
		"search": "",
		"results": ""
	}
	for div in divs:
		result = {
			"title": "",
			"description": "",
			"link": ""
		}
		try:
			# Título:
			title = div.find('div', class_="vvjwJb")
			result["title"] = title.get_text()
			# Descripción:
			description_container = div.find("div", class_="s3v9rd")
			description = description_container.find("div", class_="s3v9rd")
			result["description"] = description.get_text()
			# link:
			anchorTag = div.find("a")
			href = anchorTag["href"]
			result["link"] = "https://google.com"+href
			results.append(result)
		except:
			pass

	obj["search"] = search
	obj["results"] = results
	return obj

@app.route('/<link>')
def notFound(link):
	return render_template('notFound.html')



if __name__ == "__main__":
	app.run()
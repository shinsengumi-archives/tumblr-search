from lxml import html
import requests
import re
import json

CLEAN_RUN = True
NPAGES = 14

root_url = "https://shinsengumi-archives.tumblr.com/"
data = {}
tags = {}
if not CLEAN_RUN:
	with open("data.json", "r") as read_file:
		data = json.load(read_file)
	with open("tags.json", "r") as read_file:
		tags = json.load(read_file)

for page_id in range(NPAGES, 12, -1):
	page_url = root_url+"page/"+str(page_id)
	page = requests.get(page_url)
	doc = html.fromstring(page.content)

	post_urls = [url.get('href') for url in doc.cssselect('h3.post-title a')]
	post_htmls = [html.tostring(raw).decode('utf-8') for raw in doc.cssselect('div.post-text')]
	print(len(post_htmls), len(post_urls))

	for post_url, post_html in zip(post_urls, post_htmls):

		id = post_url[post_url.find("/post/")+6 : post_url.rfind("/")]
		if id in data:
			print(id)
			continue

		post = requests.get(post_url)
		doc = html.fromstring(post.content)

		title = doc.cssselect('h3.post-title')[0].text_content()

		text = html.tostring(doc.cssselect('div.post-text')[0]).decode('utf-8')
		text = re.sub('<.*?>', ' ', text)
		text = text.strip().replace('\r', ' ').replace('\n', ' ').replace('\t', ' ').replace(' ', ' ')
		text = re.sub('[ ]{2,}', ' ', text)

		post_tags = list(map(
			lambda tag: tag.text_content(),
			doc.cssselect('div.tags a.single-tag')
		))
		for tag in post_tags:
			if tag not in tags:
				tags[tag] = []
			tags[tag].append(id)

		post_data = {
			'url': post_url,
			'title': title,
			'text': text,
			'html': post_html,
			'tags': post_tags,
		}
		
		data[id] = post_data


with open('data.json', 'w', encoding='utf8') as outfile:
    json.dump(data, outfile, sort_keys=True)
	
with open('tags.json', 'w', encoding='utf8') as outfile:
    json.dump(tags, outfile, sort_keys=True)

from lxml import html
import requests
import re
import json

CLEAN_RUN = True
NPAGES = 14

print("沖".encode('utf8'))

root_url = "https://shinsengumi-archives.tumblr.com/"
data = {}
data["posts"] = {}
data["tags"] = {}
if not CLEAN_RUN:
	with open("data.json", "r") as read_file:
		data = json.load(read_file)

for page_id in range(NPAGES, 12, -1):
	print("page", page_id);
	page_url = root_url+"page/"+str(page_id)
	page = requests.get(page_url)
	doc = html.fromstring(page.content)

	post_urls = [url.get('href') for url in doc.cssselect('h3.post-title a')]
	post_htmls = [str(html.tostring(raw, encoding="unicode")) for raw in doc.cssselect('div.post')]

	for post_url, post_html in zip(post_urls, post_htmls):
		#post_url = "https://shinsengumi-archives.tumblr.com/post/188382973356/rintaro-okita-%E6%B2%96%E7%94%B0%E6%9E%97%E5%A4%AA%E9%83%8E-wiki-corpus"
		#post_url = "https://shinsengumi-archives.tumblr.com/post/188360292966/soji-okita-%E6%B2%96%E7%94%B0%E7%B7%8F%E5%8F%B8-wiki-corpus"
		
		id = post_url[post_url.find("/post/")+6 : post_url.rfind("/")]
		if id in data:
			continue

		post = requests.get(post_url)
		doc = html.fromstring(post.content)

		title = doc.cssselect('h3.post-title')[0].text_content()

		text = str(html.tostring(doc.cssselect('div.post-text')[0], encoding="unicode"))
		text = re.sub('<.*?>', ' ', text)
		text = text.strip().replace('\r', ' ').replace('\n', ' ').replace('\t', ' ').replace(' ', ' ')
		text = re.sub('[ ]{2,}', ' ', text)
		
		print(title)

		post_tags = list(map(
			lambda tag: tag.text_content(),
			doc.cssselect('div.tags a.single-tag')
		))
		for tag in post_tags:
			if tag not in data["tags"]:
				data["tags"][tag] = []
			data["tags"][tag].append(id)

		post_data = {
			'url': post_url,
			'title': title,
			'text': text,
			'html': post_html,
			'tags': post_tags,
		}
		
		data["posts"][id] = post_data


with open('data.json', 'w', encoding='utf8') as outfile:
    json.dump(data, outfile, sort_keys=True)

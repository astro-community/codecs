URL.from = {
	from(href) {
		return new URL(href)
	}
}.from

URL.prototype.goto = {
	goto(href) {
		return new URL(href, this)
	}
}.goto
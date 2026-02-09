function writeUpdate(date)
{
	var update = new Date(date);
	var today = new Date();
	var diffTime = today.getTime() - update.getTime();
	var diffDay = diffTime / (1000 * 60 * 60 * 24);
	if (diffDay < 8) {
		document.write(" " + date.replace(/\//g, "\.") + " update");
	}
}

const puppeteer = require('puppeteer');

async function scrapeProduct(url){

   const browser = await puppeteer.launch();

   const page = await browser.newPage();

   if(url){
      await page.goto(url);
      } else {
         await browser.close();
         return [];
	   }

    const data = await page.evaluate(() => {
    const result = [];

    const labelTds = document.querySelectorAll('td.item-col');

    labelTds.forEach(td => {
      const a = td.querySelector('a');
      const nextTd = td.nextElementSibling;
      const thirdTd = nextTd ? nextTd.nextElementSibling : null;

      if (a && nextTd && thirdTd && 
          nextTd.tagName.toLowerCase() === 'td' &&
          thirdTd.tagName.toLowerCase() === 'td') {
        result.push({
          name: a.textContent.trim(),
          value: nextTd.textContent.trim(),
          title: thirdTd.textContent.trim()
        });
      }
    });

    return result;
  });

  console.log(JSON.stringify(data, null, 2));


  await browser.close();
}

scrapeProduct('https://oldschool.runescape.wiki/w/Zulrah');
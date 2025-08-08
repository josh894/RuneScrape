const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeProduct(url, browser){
   const page = await browser.newPage();

   if(url){
      await page.goto(url);
   } else {
      await browser.close();
      return {};
   }

   const data = await page.evaluate(() => {
      // Helper to remove content in square brackets
      function clean(str) {
         return str.replace(/\[[^\]]*\]/g, '').trim();
      }
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
               name: clean(a.textContent),
               value: clean(nextTd.textContent),
               title: clean(thirdTd.textContent)
            });
         }
      });
      return result;
   });

   // Extract the parent key from the URL
   const parentKey = url.split('/w/')[1];

   // Return as an object with the parentKey
   return { [parentKey]: data };
}

async function scrapeMultipleProducts(urls) {
   const browser = await puppeteer.launch();
   const finalOutput = {};

   for (const url of urls) {
      const result = await scrapeProduct(url, browser);
      Object.assign(finalOutput, result);
   }

   await browser.close();

   console.log(JSON.stringify(finalOutput, null, 2));
   fs.writeFileSync('output.json', JSON.stringify(finalOutput, null, 2), 'utf-8');
}

const urls = [
   'https://oldschool.runescape.wiki/w/Giant_Mole',
   'https://oldschool.runescape.wiki/w/Zulrah'
];

scrapeMultipleProducts(urls);
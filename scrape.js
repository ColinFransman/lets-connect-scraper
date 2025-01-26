import puppeteer from "puppeteer";

//Require fs module
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require('fs');

const getData = async () => {
  // Start a Puppeteer session with:
  // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
  // - no default viewport (`defaultViewport: null` - website page will be in full width and height)
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();

  // On this new page:
  // - open the website https://xerte.deltion.nl/play.php?template_id=8708#programma
  // - wait until all content is loaded
  await page.goto("https://xerte.deltion.nl/play.php?template_id=8708#programma", {
    waitUntil: "load",
  });

  // Get page data
  const data = await page.evaluate(() => {
    // Fetch the first element with class ".accordion-group"
    const workshop = document.querySelectorAll(".accordion-group");
    // Convert the workshopList to an iterable array
    // For each workshop fetch the title
    return Array.from(workshop).map((data) => {
      // Fetch the sub-elements from the previously fetched workshop element
      // Get the displayed text and return it (`.innerText`)
      const text = data.querySelector(".accordion-heading").innerText;

      return { text };
    });
  });

  data.forEach(element => {
    //Data to write to file
    let text = element.text + "\n\n";

    //Clear old data
    // fs.writeFile('scraped-data.txt', "", (error) => {
    //     if (error) throw error;
    // });

    //Write data to file
    fs.appendFile('scraped-data.txt', text, (error) => {
      if (error) throw error;
    });
  });

  // Close the browser after scraping is done
  await browser.close();
};

// Start the scraping
getQuotes();
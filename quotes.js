import puppeteer from "puppeteer";

//Require fs module
import { createRequire } from "module";
import { exit } from "process";
const require = createRequire(import.meta.url);
const fs = require('fs');

const getQuotes = async () => {
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
  // - open the website
  // - wait until the dom content is loaded (HTML is ready)
  await page.goto("https://quotes.toscrape.com/", {
    waitUntil: "domcontentloaded",
  });

  // Get page data
  const quotes = await page.evaluate(() => {
    // Fetch the first element with class "quote"
    // Get the displayed text and returns it
    const scrapedData = document.querySelectorAll(".quote");

    // Convert the quoteList to an iterable array
    // For each quote fetch the text and author
    return Array.from(scrapedData).map((data) => {
      // Fetch the sub-elements from the previously fetched quote element
      // Get the displayed text and return it (`.innerText`)
      const text = data.querySelector(".text").innerText;
      const author = data.querySelector(".author").innerText;

      return { text, author };
    });
  });

  // Display the quotes
  // console.log(quotes);

  quotes.forEach(element => {
    //Data to write to file
    let text = element.text;
    let author = element.author;
    let data = text + "\n" + author + "\n\n";

    //Clear old data
    // fs.writeFile('scraped-data.txt', "", (error) => {
    //     if (error) throw error;
    // });

    //Write data to file
    fs.appendFile('scraped-data.txt', data, (error) => {
      if (error) throw error;
    });
  });

  // Close the browser
  await browser.close();
};

// Open Browser
// getSite();

// Start the scraping
getQuotes();
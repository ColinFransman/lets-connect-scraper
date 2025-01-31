import puppeteer from "puppeteer";

import { createRequire } from "module";
import { arrayBuffer } from "stream/consumers";
const require = createRequire(import.meta.url);
const express = require('express');
const app = express();
const port = 4001;


const getData = async () => {
    let json = 
    { 
        Titles: [],
        Descriptions: [],
        Images: []
    }
    // start a Puppeteer session with:
    // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
    // - no default viewport (`defaultViewport: null` - website page will be in full width and height)
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        timeout: 0,
    });
  
    // open a new page
    const page = await browser.newPage();
  
    // on this new page:
    // - open the website https://xerte.deltion.nl/play.php?template_id=8708#programma
    // - wait until all content is loaded
    await page.goto("https://xerte.deltion.nl/play.php?template_id=8708#programma", {
        waitUntil: "load",
        timeout: 0,
    });
  
    // get workshop titles
    const titles = await page.evaluate(() => {
        // fetch the first element with class ".accordion-group"
        const workshop = document.querySelectorAll(".accordion-group");
        // convert the workshopList to an iterable array
        // for each workshop fetch the title
        return Array.from(workshop).map((data) => {
            // fetch the sub-elements from the previously fetched workshop element
            // get the displayed text and return it (`.innerText`)
            const text = data.querySelector(".accordion-heading").innerText;
    
            return { text };
        });
    });
    
    //push each header to array in json object
    titles.forEach(element => {
        json.Titles.push(element.text);
    });

    //get workshop description
    const workshopDescriptions = await page.evaluate(() => {
        // fetch the first element with class ".accordion-group"
        const workshop = document.querySelectorAll(".accordion-group");
        // convert the workshopList to an iterable array
        // for each workshop fetch the title
        return Array.from(workshop).map((data) => {
            // fetch the sub-elements from the previously fetched workshop element
            const html = data.querySelector(".accordion-inner");
            let trElements = html.getElementsByTagName("p");
            // make new array for description
            let description = [];
            for (let index = 0; index < trElements.length; index++) {
                const element = trElements[index];
                if (element.innerText.trim() != "") {
                    // push text of paragraph to description array if not empty and trim the string
                    description.push(element.innerText.replace(/\n/g, "").replace(/\t/g, "").trim());
                }
            }

            return { description };
        });
    });

    // push each description to array in json object
    workshopDescriptions.forEach(elem => {
        json.Descriptions.push(elem);
    });

    const workshopImages = await page.evaluate(() => {
        const workshop = document.querySelectorAll(".accordion-group");
        return Array.from(workshop).map((data) => {
            const imageElements = data.getElementsByTagName("img");
            let image = [];
            for (let index = 0; index < imageElements.length; index++) {
                const element = imageElements[index];
                //if (element.src != "https://xerte.deltion.nl/play.php?template_id=8708" && element.src != "https://xerte.deltion.nl/USER-FILES/8708-abvries-site/media/pijl13x10.png") {
                    image.push(element.src);
                //}
            }

            return { image };
        });
    });
    workshopImages.forEach(elem => {
        json.Images.push(elem);
    });

    // Close the browser after scraping is done
    await browser.close();
    return json;
};

let data = getData();

app.listen(port, () => {
    console.log(`Deze app is te bereiken op: http://localhost:${port}/getData`);
});

app.use(express.urlencoded({ extended: true, }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.get("/getData", async(req, res) => {
    res.json(await data);
});

// app.get("/getHeaders", async(req, res) => {
//     res.json((await data).Headers);
// });

// app.get("/getDescriptions", async(req, res) => {
//     res.json((await data).Descriptions);
// });

This project is making use of the Apify SDK CheerioCrawler to crawl through multiple product pages and save the following data in a json file format.

    -The product url page;

    -The product title;

    -The product price;

    -The stock status of the product.

The input urls are provided in apify_storage\key_value_stores\default\input.json. 

The data is saved in apify_storage\key_value_stores\default\output.json.

You can run this app with "apify run -p" 

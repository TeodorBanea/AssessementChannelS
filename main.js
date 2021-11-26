
const Apify = require('apify');
const { handleStart, handleList, handleDetail } = require('./src/routes');
const { utils: { log } } = Apify;

Apify.main(async () => {
    const { startUrls } = await Apify.getInput();
    const requestList = await Apify.openRequestList('start-urls', startUrls);
    const requestQueue = await Apify.openRequestQueue();

    const crawler = new Apify.CheerioCrawler({
        requestList,
        requestQueue,
        minConcurrency: 10,
        maxConcurrency: 20,
        maxRequestRetries: 1,
        handlePageTimeoutSecs: 30,
        maxRequestsPerCrawl: 10,
        maxConcurrency: 50,
 
        handlePageFunction: async ({request , $ }) => {
          log.debug(`Processing ${request.url}...`)
         
         const Product_Title = () =>    // Extracting the title of the product
         {
          return $('title').text()
         }
         const Product_Price = ()=>
          {
            let price
            let decimal
            if($('p.product-new-price.has-deal').text())                // Checking for existing prices (discounts or normal)
              { 
                price = $('p.product-new-price').clone().children().remove().end().text()       // Extracting the price  without the decimal
                decimal = $('p.product-new-price').clone().children().text()                    // Extracting the decimal part or the price
              }
            if ($('p.product-new-price').text())
              { 
                price = $('p.product-new-price').clone().children().remove().end().text()
                decimal = $('p.product-new-price').clone().children().text()
              }
            price=price.split(' ')  // Extracting the first price in the page (the one that corresponds to the product)
            decimal.split('Lei')    // Extracting the first decimal price

            return `${price[0]},${decimal[0]}${decimal[1]} Lei`
          }
         
         const Stock_Status = () =>       // Extracting the stock status of the product
          { 
            let StockStatus
            if($('span.label.label-in_stock').text())          
              StockStatus ="InStock"
            if($('span.label.label-out_of_stock').text())  
              StockStatus = "OutOfStock"
          
            return StockStatus
          }

          // We push the data into the datasets file
          await Apify.pushData({        
            ProductTitle:Product_Title(), 
            ProductUrl: request.url,
            ProductPrice:Product_Price(),
            StockStatus:Stock_Status(),
          });
         //We merge the data into the same json file called "output"
          dataset = await Apify.openDataset();                  
          const wholeDataset = await dataset.reduce((memo, value) => {
          memo.push(value);
          return memo;
          }, []);
          await Apify.setValue('output',wholeDataset);
        },
    });

    log.info('STARTING the crawl.If there are any problems you can stop the crawl with "CTRL+C" ');
    await crawler.run();
    log.info('Crawler FINISHED. You can now check the "output.json" file to see the data.');
});
